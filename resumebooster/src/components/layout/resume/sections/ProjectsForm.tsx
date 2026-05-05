import { ProjectItem } from "@/types/resume";

interface ProjectsFormProps {
  data: ProjectItem[];
  onChange: (data: ProjectItem[]) => void;
}

export default function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  const addItem = () => {
    const newItem: ProjectItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      techStack: [""],
      url: "",
      github: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    onChange([...data, newItem]);
  };

  const updateItem = (index: number, updates: Partial<ProjectItem>) => {
    const newData = [...data];
    newData[index] = { ...newData[index], ...updates };
    onChange(newData);
  };

  const removeItem = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.id} className="border rounded p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, { description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Tech Stack</label>
            {item.techStack.map((tech, techIndex) => (
              <input
                key={techIndex}
                type="text"
                value={tech}
                onChange={(e) => {
                  const newTechStack = [...item.techStack];
                  newTechStack[techIndex] = e.target.value;
                  updateItem(index, { techStack: newTechStack });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="url"
                value={item.url}
                onChange={(e) => updateItem(index, { url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GitHub</label>
              <input
                type="url"
                value={item.github}
                onChange={(e) => updateItem(index, { github: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="text"
                value={item.startDate}
                onChange={(e) => updateItem(index, { startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="text"
                value={item.endDate}
                onChange={(e) => updateItem(index, { endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Bullets</label>
            {item.bullets.map((bullet, bulletIndex) => (
              <input
                key={bulletIndex}
                type="text"
                value={bullet}
                onChange={(e) => {
                  const newBullets = [...item.bullets];
                  newBullets[bulletIndex] = e.target.value;
                  updateItem(index, { bullets: newBullets });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ))}
          </div>
          <button
            onClick={() => removeItem(index)}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Add Project
      </button>
    </div>
  );
}