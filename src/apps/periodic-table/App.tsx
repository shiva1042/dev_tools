import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Atom, Search } from 'lucide-react';

interface Element { n: number; s: string; name: string; mass: string; cat: string; row: number; col: number; }

const cats: Record<string, string> = { 'alkali': 'bg-red-500/30 border-red-500/50', 'alkaline': 'bg-orange-500/30 border-orange-500/50', 'transition': 'bg-yellow-500/30 border-yellow-500/50', 'post-transition': 'bg-green-500/30 border-green-500/50', 'metalloid': 'bg-teal-500/30 border-teal-500/50', 'nonmetal': 'bg-blue-500/30 border-blue-500/50', 'halogen': 'bg-cyan-500/30 border-cyan-500/50', 'noble': 'bg-purple-500/30 border-purple-500/50', 'lanthanide': 'bg-pink-500/30 border-pink-500/50', 'actinide': 'bg-rose-500/30 border-rose-500/50' };

const elements: Element[] = [
  {n:1,s:'H',name:'Hydrogen',mass:'1.008',cat:'nonmetal',row:1,col:1},{n:2,s:'He',name:'Helium',mass:'4.003',cat:'noble',row:1,col:18},
  {n:3,s:'Li',name:'Lithium',mass:'6.941',cat:'alkali',row:2,col:1},{n:4,s:'Be',name:'Beryllium',mass:'9.012',cat:'alkaline',row:2,col:2},
  {n:5,s:'B',name:'Boron',mass:'10.81',cat:'metalloid',row:2,col:13},{n:6,s:'C',name:'Carbon',mass:'12.01',cat:'nonmetal',row:2,col:14},
  {n:7,s:'N',name:'Nitrogen',mass:'14.01',cat:'nonmetal',row:2,col:15},{n:8,s:'O',name:'Oxygen',mass:'16.00',cat:'nonmetal',row:2,col:16},
  {n:9,s:'F',name:'Fluorine',mass:'19.00',cat:'halogen',row:2,col:17},{n:10,s:'Ne',name:'Neon',mass:'20.18',cat:'noble',row:2,col:18},
  {n:11,s:'Na',name:'Sodium',mass:'22.99',cat:'alkali',row:3,col:1},{n:12,s:'Mg',name:'Magnesium',mass:'24.31',cat:'alkaline',row:3,col:2},
  {n:13,s:'Al',name:'Aluminium',mass:'26.98',cat:'post-transition',row:3,col:13},{n:14,s:'Si',name:'Silicon',mass:'28.09',cat:'metalloid',row:3,col:14},
  {n:15,s:'P',name:'Phosphorus',mass:'30.97',cat:'nonmetal',row:3,col:15},{n:16,s:'S',name:'Sulfur',mass:'32.07',cat:'nonmetal',row:3,col:16},
  {n:17,s:'Cl',name:'Chlorine',mass:'35.45',cat:'halogen',row:3,col:17},{n:18,s:'Ar',name:'Argon',mass:'39.95',cat:'noble',row:3,col:18},
  {n:19,s:'K',name:'Potassium',mass:'39.10',cat:'alkali',row:4,col:1},{n:20,s:'Ca',name:'Calcium',mass:'40.08',cat:'alkaline',row:4,col:2},
  {n:21,s:'Sc',name:'Scandium',mass:'44.96',cat:'transition',row:4,col:3},{n:22,s:'Ti',name:'Titanium',mass:'47.87',cat:'transition',row:4,col:4},
  {n:23,s:'V',name:'Vanadium',mass:'50.94',cat:'transition',row:4,col:5},{n:24,s:'Cr',name:'Chromium',mass:'52.00',cat:'transition',row:4,col:6},
  {n:25,s:'Mn',name:'Manganese',mass:'54.94',cat:'transition',row:4,col:7},{n:26,s:'Fe',name:'Iron',mass:'55.85',cat:'transition',row:4,col:8},
  {n:27,s:'Co',name:'Cobalt',mass:'58.93',cat:'transition',row:4,col:9},{n:28,s:'Ni',name:'Nickel',mass:'58.69',cat:'transition',row:4,col:10},
  {n:29,s:'Cu',name:'Copper',mass:'63.55',cat:'transition',row:4,col:11},{n:30,s:'Zn',name:'Zinc',mass:'65.38',cat:'transition',row:4,col:12},
  {n:31,s:'Ga',name:'Gallium',mass:'69.72',cat:'post-transition',row:4,col:13},{n:32,s:'Ge',name:'Germanium',mass:'72.63',cat:'metalloid',row:4,col:14},
  {n:33,s:'As',name:'Arsenic',mass:'74.92',cat:'metalloid',row:4,col:15},{n:34,s:'Se',name:'Selenium',mass:'78.97',cat:'nonmetal',row:4,col:16},
  {n:35,s:'Br',name:'Bromine',mass:'79.90',cat:'halogen',row:4,col:17},{n:36,s:'Kr',name:'Krypton',mass:'83.80',cat:'noble',row:4,col:18},
  {n:37,s:'Rb',name:'Rubidium',mass:'85.47',cat:'alkali',row:5,col:1},{n:38,s:'Sr',name:'Strontium',mass:'87.62',cat:'alkaline',row:5,col:2},
  {n:39,s:'Y',name:'Yttrium',mass:'88.91',cat:'transition',row:5,col:3},{n:40,s:'Zr',name:'Zirconium',mass:'91.22',cat:'transition',row:5,col:4},
  {n:41,s:'Nb',name:'Niobium',mass:'92.91',cat:'transition',row:5,col:5},{n:42,s:'Mo',name:'Molybdenum',mass:'95.95',cat:'transition',row:5,col:6},
  {n:43,s:'Tc',name:'Technetium',mass:'[98]',cat:'transition',row:5,col:7},{n:44,s:'Ru',name:'Ruthenium',mass:'101.1',cat:'transition',row:5,col:8},
  {n:45,s:'Rh',name:'Rhodium',mass:'102.9',cat:'transition',row:5,col:9},{n:46,s:'Pd',name:'Palladium',mass:'106.4',cat:'transition',row:5,col:10},
  {n:47,s:'Ag',name:'Silver',mass:'107.9',cat:'transition',row:5,col:11},{n:48,s:'Cd',name:'Cadmium',mass:'112.4',cat:'transition',row:5,col:12},
  {n:49,s:'In',name:'Indium',mass:'114.8',cat:'post-transition',row:5,col:13},{n:50,s:'Sn',name:'Tin',mass:'118.7',cat:'post-transition',row:5,col:14},
  {n:51,s:'Sb',name:'Antimony',mass:'121.8',cat:'metalloid',row:5,col:15},{n:52,s:'Te',name:'Tellurium',mass:'127.6',cat:'metalloid',row:5,col:16},
  {n:53,s:'I',name:'Iodine',mass:'126.9',cat:'halogen',row:5,col:17},{n:54,s:'Xe',name:'Xenon',mass:'131.3',cat:'noble',row:5,col:18},
];

export default function App() {
  const [selected, setSelected] = useState<Element | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = elements.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.s.toLowerCase().includes(search.toLowerCase()) && !String(e.n).includes(search)) return false;
    if (filterCat && e.cat !== filterCat) return false;
    return true;
  });

  const grid = Array.from({ length: 7 }, () => Array(18).fill(null)) as (Element | null)[][];
  filtered.forEach(e => { if (e.row <= 7) grid[e.row - 1][e.col - 1] = e; });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Atom className="w-6 h-6 text-indigo-400" /> Periodic Table</h1></div>
          <div className="flex-1" />
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-40" /></div>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          <button onClick={() => setFilterCat('')} className={`px-2 py-1 rounded text-xs ${!filterCat ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>All</button>
          {Object.keys(cats).map(c => <button key={c} onClick={() => setFilterCat(c === filterCat ? '' : c)} className={`px-2 py-1 rounded text-xs capitalize ${filterCat === c ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{c}</button>)}
        </div>
        <div className="overflow-x-auto mb-6">
          <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: 'repeat(18, 1fr)', minWidth: '900px' }}>
            {grid.map((row, ri) => row.map((el, ci) => (
              <div key={`${ri}-${ci}`} onClick={() => el && setSelected(el)} className={`w-12 h-12 flex flex-col items-center justify-center rounded text-center cursor-pointer border transition-all ${el ? `${cats[el.cat] || 'bg-gray-800 border-gray-700'} hover:scale-110 hover:z-10` : 'border-transparent'}`}>
                {el && <><span className="text-[8px] text-gray-400">{el.n}</span><span className="text-xs font-bold">{el.s}</span></>}
              </div>
            )))}
          </div>
        </div>
        {selected && (
          <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 flex flex-col items-center justify-center rounded-xl border-2 ${cats[selected.cat]}`}>
                <span className="text-xs text-gray-400">{selected.n}</span><span className="text-2xl font-bold">{selected.s}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-gray-400 text-sm">Atomic Mass: {selected.mass}</p>
                <p className="text-gray-500 text-sm capitalize">Category: {selected.cat}</p>
                <p className="text-gray-500 text-sm">Period: {selected.row} | Group: {selected.col}</p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(cats).map(([name, cls]) => (
            <span key={name} className={`px-2 py-1 rounded text-xs capitalize border ${cls}`}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
