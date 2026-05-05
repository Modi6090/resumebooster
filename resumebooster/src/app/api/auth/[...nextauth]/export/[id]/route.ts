// src/app/api/export/[id]/route.ts
// GET /api/export/:id → renders the resume as HTML via Puppeteer and returns a PDF

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { ResumeContent } from "@/types/resume";
import { renderResumeHtml } from "@/lib/ResumeHtml";
export const runtime = "nodejs";
export const maxDuration = 30; // Puppeteer can be slow — give it 30s


export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: { id: params.id, userId: session.user.id },
  });

  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const content = resume.content as unknown as ResumeContent;
  const html = renderResumeHtml(content, resume.template);

  // Launch headless Chromium and print to PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9]/gi, "_")}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}