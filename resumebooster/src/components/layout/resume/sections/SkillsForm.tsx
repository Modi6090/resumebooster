import { SkillItem } from "@/types/resume";

interface SkillsFormProps {
  data: SkillItem;
  onChange: (data: SkillItem) => void;
}

export default function SkillsForm({ data, onChange }: SkillsFormProps) {
  const addCategory = () => {
    const newCategory = { id: Date.now().toString(), label: "", skills: [""] };
    onChange({ categories: [...data.categories, newCategory] });
  };

  const updateCategory = (index: number, updates: Partial<{ id: string; label: string; skills: string[] }>) => {
    const newCategories = [...data.categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    onChange({ categories: newCategories });
  };

  const removeCategory = (index: number) => {
    onChange({ categories: data.categories.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {data.categories.map((category, index) => (
        <div key={category.id} className="border rounded p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Label</label>
            <input
              type="text"
              value={category.label}
              onChange={(e) => updateCategory(index, { label: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Skills</label>
            {category.skills.map((skill, skillIndex) => (
              <input
                key={skillIndex}
                type="text"
                value={skill}
                onChange={(e) => {
                  const newSkills = [...category.skills];
                  newSkills[skillIndex] = e.target.value;
                  updateCategory(index, { skills: newSkills });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            ))}
            <button
              onClick={() => updateCategory(index, { skills: [...category.skills, ""] })}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Add Skill
            </button>
          </div>
          <button
            onClick={() => removeCategory(index)}
            className="mt-2 text-red-600 hover:text-red-800"
          >
            Remove Category
          </button>
        </div>
      ))}
      <button
        onClick={addCategory}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Add Category
      </button>
    </div>
  );
}