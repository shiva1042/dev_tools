import { Folder, FileCode, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function buildTree(folderStructure) {
  const tree = {};

  Object.entries(folderStructure).forEach(([path, type]) => {
    const parts = path.split('/');
    let current = tree;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = {
          name: part,
          type: index === parts.length - 1 ? type : 'directory',
          children: {}
        };
      }
      current = current[part].children;
    });
  });

  return tree;
}

function TreeNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Object.keys(node.children).length > 0;
  const isDirectory = node.type === 'directory';

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDirectory && setExpanded(!expanded)}
      >
        {isDirectory ? (
          <>
            {hasChildren ? (
              expanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              )
            ) : <span className="w-4" />}
            <Folder className="w-4 h-4 text-yellow-500 ml-1" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileCode className="w-4 h-4 text-blue-500 ml-1" />
          </>
        )}
        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{node.name}</span>
      </div>

      {expanded && hasChildren && (
        <div>
          {Object.values(node.children)
            .sort((a, b) => {
              if (a.type === 'directory' && b.type !== 'directory') return -1;
              if (a.type !== 'directory' && b.type === 'directory') return 1;
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNode key={child.name} node={child} depth={depth + 1} />
            ))}
        </div>
      )}
    </div>
  );
}

export default function FolderStructure({ structure }) {
  if (!structure || Object.keys(structure).length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm p-4">
        Generate templates to see the folder structure
      </div>
    );
  }

  const tree = buildTree(structure);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-2 max-h-96 overflow-auto">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 border-b border-gray-100 dark:border-slate-700 mb-2">
        Project Structure
      </h3>
      {Object.values(tree).map((node) => (
        <TreeNode key={node.name} node={node} />
      ))}
    </div>
  );
}
