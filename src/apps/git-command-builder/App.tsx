import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, GitBranch } from 'lucide-react';

type Category = 'basic' | 'branch' | 'merge' | 'remote' | 'stash' | 'advanced';

interface GitCommand { name: string; base: string; flags: { flag: string; desc: string }[]; }

const commands: Record<Category, GitCommand[]> = {
  basic: [
    { name: 'init', base: 'git init', flags: [{ flag: '--bare', desc: 'Create bare repo' }] },
    { name: 'add', base: 'git add', flags: [{ flag: '.', desc: 'All files' }, { flag: '-A', desc: 'All changes' }, { flag: '-p', desc: 'Interactive patch' }] },
    { name: 'commit', base: 'git commit', flags: [{ flag: '-m "message"', desc: 'With message' }, { flag: '--amend', desc: 'Amend last commit' }, { flag: '-a', desc: 'Auto-stage tracked' }] },
    { name: 'status', base: 'git status', flags: [{ flag: '-s', desc: 'Short format' }] },
    { name: 'log', base: 'git log', flags: [{ flag: '--oneline', desc: 'One line per commit' }, { flag: '--graph', desc: 'Show graph' }, { flag: '-n 5', desc: 'Last 5 commits' }] },
    { name: 'diff', base: 'git diff', flags: [{ flag: '--staged', desc: 'Staged changes' }, { flag: '--stat', desc: 'Show stats' }] },
  ],
  branch: [
    { name: 'branch', base: 'git branch', flags: [{ flag: '-a', desc: 'All branches' }, { flag: '-d <name>', desc: 'Delete branch' }, { flag: '-m <new>', desc: 'Rename current' }] },
    { name: 'checkout', base: 'git checkout', flags: [{ flag: '-b <name>', desc: 'Create & switch' }, { flag: '<branch>', desc: 'Switch branch' }] },
    { name: 'switch', base: 'git switch', flags: [{ flag: '-c <name>', desc: 'Create & switch' }, { flag: '<branch>', desc: 'Switch branch' }] },
  ],
  merge: [
    { name: 'merge', base: 'git merge', flags: [{ flag: '<branch>', desc: 'Merge branch' }, { flag: '--squash', desc: 'Squash commits' }, { flag: '--no-ff', desc: 'No fast-forward' }, { flag: '--abort', desc: 'Abort merge' }] },
    { name: 'rebase', base: 'git rebase', flags: [{ flag: '<branch>', desc: 'Rebase onto' }, { flag: '--abort', desc: 'Abort rebase' }, { flag: '--continue', desc: 'Continue rebase' }] },
    { name: 'cherry-pick', base: 'git cherry-pick', flags: [{ flag: '<hash>', desc: 'Pick commit' }, { flag: '--no-commit', desc: 'Without committing' }] },
  ],
  remote: [
    { name: 'push', base: 'git push', flags: [{ flag: 'origin main', desc: 'Push to main' }, { flag: '-u origin <branch>', desc: 'Set upstream' }, { flag: '--tags', desc: 'Push tags' }] },
    { name: 'pull', base: 'git pull', flags: [{ flag: '--rebase', desc: 'Pull with rebase' }, { flag: 'origin main', desc: 'Pull from main' }] },
    { name: 'fetch', base: 'git fetch', flags: [{ flag: '--all', desc: 'All remotes' }, { flag: '--prune', desc: 'Remove deleted' }] },
    { name: 'clone', base: 'git clone', flags: [{ flag: '<url>', desc: 'Clone repo' }, { flag: '--depth 1', desc: 'Shallow clone' }] },
  ],
  stash: [
    { name: 'stash', base: 'git stash', flags: [{ flag: 'push -m "msg"', desc: 'Named stash' }, { flag: 'pop', desc: 'Apply & remove' }, { flag: 'apply', desc: 'Apply & keep' }, { flag: 'list', desc: 'List stashes' }, { flag: 'drop', desc: 'Delete stash' }] },
  ],
  advanced: [
    { name: 'reset', base: 'git reset', flags: [{ flag: '--soft HEAD~1', desc: 'Undo commit, keep staged' }, { flag: '--mixed HEAD~1', desc: 'Undo commit & stage' }, { flag: '<file>', desc: 'Unstage file' }] },
    { name: 'revert', base: 'git revert', flags: [{ flag: '<hash>', desc: 'Revert commit' }, { flag: '--no-commit', desc: 'Without auto-commit' }] },
    { name: 'bisect', base: 'git bisect', flags: [{ flag: 'start', desc: 'Start bisect' }, { flag: 'good <hash>', desc: 'Mark good' }, { flag: 'bad <hash>', desc: 'Mark bad' }] },
    { name: 'tag', base: 'git tag', flags: [{ flag: '-a v1.0 -m "msg"', desc: 'Annotated tag' }, { flag: '-l', desc: 'List tags' }] },
  ],
};

const workflows = [
  { name: 'Undo last commit (keep changes)', cmd: 'git reset --soft HEAD~1' },
  { name: 'Discard all local changes', cmd: 'git checkout -- .' },
  { name: 'Squash last N commits', cmd: 'git reset --soft HEAD~N && git commit' },
  { name: 'Update fork from upstream', cmd: 'git fetch upstream && git rebase upstream/main' },
  { name: 'Delete remote branch', cmd: 'git push origin --delete <branch>' },
  { name: 'Find commit that introduced a bug', cmd: 'git bisect start && git bisect bad && git bisect good <hash>' },
];

export default function App() {
  const [category, setCategory] = useState<Category>('basic');
  const [built, setBuilt] = useState('git ');
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch className="w-6 h-6 text-orange-400" /> Git Command Builder</h1>
          <p className="text-gray-400 text-sm">Visual builder for git commands</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm">$</span>
            <input value={built} onChange={e => setBuilt(e.target.value)} className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-green-400 text-sm focus:outline-none focus:border-orange-500" />
            <button onClick={() => copy(built)} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button>
          </div>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(Object.keys(commands) as Category[]).map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-sm capitalize whitespace-nowrap ${category === c ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>
          ))}
        </div>
        <div className="space-y-3 mb-6">
          {commands[category].map(cmd => (
            <div key={cmd.name} className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <code className="text-sm font-mono text-orange-400 cursor-pointer hover:text-orange-300" onClick={() => setBuilt(cmd.base)}>{cmd.base}</code>
              </div>
              <div className="flex flex-wrap gap-2">
                {cmd.flags.map(f => (
                  <button key={f.flag} onClick={() => setBuilt(cmd.base + ' ' + f.flag)} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs" title={f.desc}>
                    <code className="text-cyan-400">{f.flag}</code><span className="text-gray-500 ml-2">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
          <h3 className="text-sm text-gray-400 mb-3">Common Workflows</h3>
          <div className="space-y-2">
            {workflows.map(w => (
              <div key={w.name} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer" onClick={() => { setBuilt(w.cmd); copy(w.cmd); }}>
                <span className="text-sm">{w.name}</span>
                <code className="text-xs text-orange-400 font-mono">{w.cmd}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
