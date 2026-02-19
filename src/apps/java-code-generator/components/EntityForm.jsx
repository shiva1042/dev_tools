export default function EntityForm({ entityName, packageName, onEntityChange, onPackageChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="entityName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Class Name
        </label>
        <input
          type="text"
          id="entityName"
          value={entityName}
          onChange={(e) => onEntityChange(e.target.value)}
          placeholder="e.g., Product, User, ChatBot"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm
                     focus:border-indigo-500 focus:ring-indigo-500
                     px-3 py-2 border text-sm bg-white dark:bg-slate-800
                     text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Use PascalCase (e.g., Product, UserProfile, MyChatBot)
        </p>
      </div>

      <div>
        <label htmlFor="packageName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Package Name
        </label>
        <input
          type="text"
          id="packageName"
          value={packageName}
          onChange={(e) => onPackageChange(e.target.value)}
          placeholder="e.g., com.example.myapp"
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 shadow-sm
                     focus:border-indigo-500 focus:ring-indigo-500
                     px-3 py-2 border text-sm bg-white dark:bg-slate-800
                     text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Base package for generated code
        </p>
      </div>
    </div>
  );
}
