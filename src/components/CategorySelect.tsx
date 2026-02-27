import { CATEGORIES } from '../data/categories';
import { CategoryId } from '../types';

interface Props {
  onSelect: (categoryId: CategoryId) => void;
  onBack: () => void;
}

export function CategorySelect({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h2 className="text-3xl font-extrabold text-indigo-700 text-center mb-2">
          Choose Your Buzzword Pack
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Pick the category that matches your meeting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelect(category.id)}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-150 text-left border-2 border-transparent hover:border-indigo-300"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{category.description}</p>
              <div className="flex flex-wrap gap-1">
                {category.words.slice(0, 3).map((word) => (
                  <span
                    key={word}
                    className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
