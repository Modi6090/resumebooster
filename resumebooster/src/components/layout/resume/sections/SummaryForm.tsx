import { SummaryData } from "@/types/resume";

interface SummaryFormProps {
  data: SummaryData;
  onChange: (data: SummaryData) => void;
}

export default function SummaryForm({ data, onChange }: SummaryFormProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Summary</label>
      <textarea
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={4}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="Write a brief summary about yourself..."
      />
    </div>
  );
}