import { FileCode, Hash, Braces, Clock } from 'lucide-react';

export default function CodeStats({ templates }) {
  if (!templates || templates.length === 0) {
    return null;
  }

  // Calculate statistics
  const stats = templates.reduce((acc, template) => {
    const lines = template.code.split('\n').length;
    const chars = template.code.length;
    const methods = (template.code.match(/\b(public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length;
    const classes = (template.code.match(/\b(class|interface|enum|record)\s+\w+/g) || []).length;
    const imports = (template.code.match(/^import\s+/gm) || []).length;

    return {
      totalLines: acc.totalLines + lines,
      totalChars: acc.totalChars + chars,
      totalMethods: acc.totalMethods + methods,
      totalClasses: acc.totalClasses + classes,
      totalImports: acc.totalImports + imports,
      fileCount: acc.fileCount + 1,
    };
  }, { totalLines: 0, totalChars: 0, totalMethods: 0, totalClasses: 0, totalImports: 0, fileCount: 0 });

  const statItems = [
    { icon: FileCode, label: 'Files', value: stats.fileCount, color: 'text-blue-500' },
    { icon: Hash, label: 'Lines', value: stats.totalLines.toLocaleString(), color: 'text-green-500' },
    { icon: Braces, label: 'Methods', value: stats.totalMethods, color: 'text-purple-500' },
    { icon: Clock, label: 'Classes', value: stats.totalClasses, color: 'text-orange-500' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Code Statistics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {label}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{stats.totalImports} imports</span>
          <span>{(stats.totalChars / 1024).toFixed(1)} KB total</span>
        </div>
      </div>
    </div>
  );
}
