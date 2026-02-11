import { useState, useMemo } from 'react';
import {
  Box, Paper, Typography, TextField, IconButton, Tooltip, Chip, Snackbar,
  FormControl, InputLabel, Select, MenuItem, Tabs, Tab,
} from '@mui/material';
import { ContentCopy, Home, Search } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface Pattern { name: string; icon: string; intent: string; problem: string; whenToUse: string[]; structure: string; codeTs: string; pros: string[]; cons: string[]; }
interface Cat { name: string; color: string; patterns: Pattern[]; }

const DATA: Cat[] = [
  { name: 'Creational', color: '#4caf50', patterns: [
    { name: 'Singleton', icon: '1', intent: 'Ensure a class has only one instance and provide a global point of access to it.', problem: 'Multiple instances of a class cause conflicts or waste resources (e.g., database connections, config managers).', whenToUse: ['Single shared resource needed', 'Global configuration', 'Connection pools'], structure: 'Class with private constructor + static getInstance() method', codeTs: `class Singleton {
  private static instance: Singleton;
  private constructor() {}
  static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}`, pros: ['Controlled access to sole instance', 'Reduced namespace pollution', 'Lazy initialization'], cons: ['Hard to unit test (global state)', 'Violates Single Responsibility Principle', 'Can mask bad design'] },
    { name: 'Factory Method', icon: 'F', intent: 'Define an interface for creating objects, letting subclasses decide which class to instantiate.', problem: 'Code is tightly coupled to specific classes, making it hard to extend.', whenToUse: ['Unknown exact types beforehand', 'Want to provide extension points', 'Complex object creation logic'], structure: 'Creator (abstract) -> ConcreteCreator; Product (interface) -> ConcreteProduct', codeTs: `interface Product { operation(): string; }
class ConcreteProductA implements Product {
  operation() { return 'Product A'; }
}
class ConcreteProductB implements Product {
  operation() { return 'Product B'; }
}
abstract class Creator {
  abstract createProduct(): Product;
  doWork(): string {
    const product = this.createProduct();
    return product.operation();
  }
}
class CreatorA extends Creator {
  createProduct() { return new ConcreteProductA(); }
}`, pros: ['Avoids tight coupling', 'Single Responsibility Principle', 'Open/Closed Principle'], cons: ['More subclasses needed', 'Can become complex'] },
    { name: 'Abstract Factory', icon: 'AF', intent: 'Provide an interface for creating families of related objects without specifying concrete classes.', problem: 'Need to create families of related products that work together.', whenToUse: ['Multiple product families', 'Cross-platform UI', 'Theme systems'], structure: 'AbstractFactory -> ConcreteFactory1/2; AbstractProductA/B -> ConcreteProducts', codeTs: `interface Button { render(): string; }
interface Input { render(): string; }
interface UIFactory {
  createButton(): Button;
  createInput(): Input;
}
class DarkButton implements Button { render() { return '<dark-btn/>'; } }
class DarkInput implements Input { render() { return '<dark-input/>'; } }
class DarkUIFactory implements UIFactory {
  createButton() { return new DarkButton(); }
  createInput() { return new DarkInput(); }
}`, pros: ['Ensures product compatibility', 'Avoids tight coupling', 'Easy to swap families'], cons: ['Complexity with many product types', 'Hard to add new products'] },
    { name: 'Builder', icon: 'B', intent: 'Separate construction of a complex object from its representation.', problem: 'Constructor with many parameters, or object needs step-by-step assembly.', whenToUse: ['Complex object construction', 'Multiple representations', 'Telescoping constructor problem'], structure: 'Director -> Builder (interface) -> ConcreteBuilder -> Product', codeTs: `class QueryBuilder {
  private table = '';
  private conditions: string[] = [];
  private orderBy = '';
  from(table: string) { this.table = table; return this; }
  where(cond: string) { this.conditions.push(cond); return this; }
  order(col: string) { this.orderBy = col; return this; }
  build(): string {
    let q = \`SELECT * FROM \${this.table}\`;
    if (this.conditions.length) q += ' WHERE ' + this.conditions.join(' AND ');
    if (this.orderBy) q += ' ORDER BY ' + this.orderBy;
    return q;
  }
}
// Usage: new QueryBuilder().from('users').where('age > 18').order('name').build()`, pros: ['Step-by-step construction', 'Reuse construction code', 'Immutable objects possible'], cons: ['More classes/code', 'Increased complexity'] },
    { name: 'Prototype', icon: 'P', intent: 'Create objects by copying an existing object (prototype) rather than creating new instances.', problem: 'Object creation is expensive, or you need copies with slight modifications.', whenToUse: ['Costly object initialization', 'Many similar objects needed', 'Runtime object composition'], structure: 'Prototype (interface with clone()) -> ConcretePrototype', codeTs: `interface Cloneable { clone(): Cloneable; }
class Config implements Cloneable {
  constructor(public host: string, public port: number, public options: Record<string, unknown>) {}
  clone(): Config {
    return new Config(this.host, this.port, { ...this.options });
  }
}
const defaultConfig = new Config('localhost', 3000, { debug: true });
const prodConfig = defaultConfig.clone();
prodConfig.host = 'prod.example.com';`, pros: ['Avoid expensive initialization', 'Clone without coupling to class', 'Convenient preset objects'], cons: ['Deep cloning can be complex', 'Circular references tricky'] },
  ]},
  { name: 'Structural', color: '#2196f3', patterns: [
    { name: 'Adapter', icon: 'Ad', intent: 'Convert the interface of a class into another interface clients expect.', problem: 'Incompatible interfaces between existing and new code.', whenToUse: ['Integrating legacy code', 'Third-party library wrapping', 'Interface translation'], structure: 'Client -> Target (interface) <- Adapter -> Adaptee', codeTs: `interface Logger { log(msg: string): void; }
class OldLogger { writeLog(text: string) { console.log('[OLD] ' + text); } }
class LoggerAdapter implements Logger {
  constructor(private old: OldLogger) {}
  log(msg: string) { this.old.writeLog(msg); }
}`, pros: ['Separation of concerns', 'Reuse existing code', 'Single Responsibility'], cons: ['Adds complexity', 'Sometimes simpler to change Adaptee'] },
    { name: 'Decorator', icon: 'D', intent: 'Attach additional responsibilities to objects dynamically.', problem: 'Need to add behavior without modifying existing code or using inheritance explosion.', whenToUse: ['Adding behavior at runtime', 'Avoiding subclass explosion', 'Cross-cutting concerns'], structure: 'Component (interface) <- ConcreteComponent; Decorator <- ConcreteDecorators', codeTs: `interface DataSource { read(): string; write(data: string): void; }
class FileSource implements DataSource {
  private data = '';
  read() { return this.data; }
  write(data: string) { this.data = data; }
}
class EncryptionDecorator implements DataSource {
  constructor(private source: DataSource) {}
  read() { return atob(this.source.read()); }
  write(data: string) { this.source.write(btoa(data)); }
}
// Usage: new EncryptionDecorator(new FileSource())`, pros: ['Flexible alternative to inheritance', 'Add/remove at runtime', 'Combine behaviors'], cons: ['Many small objects', 'Hard to remove specific wrapper', 'Order-dependent'] },
    { name: 'Facade', icon: 'Fa', intent: 'Provide a simplified interface to a complex subsystem.', problem: 'Complex subsystem with many classes makes code hard to use.', whenToUse: ['Simplifying complex libraries', 'Layered architecture', 'Reducing coupling'], structure: 'Facade -> Subsystem classes (A, B, C)', codeTs: `class VideoConverter {
  convert(filename: string, format: string): string {
    const file = new FileReader().read(filename);
    const codec = format === 'mp4' ? new MP4Codec() : new AVICodec();
    const compressed = new Compressor().compress(file, codec);
    return new Mixer().fix(compressed);
  }
}
// Hides: FileReader, Codec, Compressor, Mixer complexity`, pros: ['Simplified interface', 'Decouples subsystems', 'Easier to use'], cons: ['Can become god object', 'May hide useful features'] },
    { name: 'Proxy', icon: 'Px', intent: 'Provide a surrogate or placeholder for another object to control access.', problem: 'Need lazy initialization, access control, logging, or caching for an object.', whenToUse: ['Lazy loading', 'Access control', 'Logging/caching', 'Remote objects'], structure: 'Subject (interface) <- RealSubject; Proxy -> RealSubject', codeTs: `interface API { fetchData(id: string): Promise<unknown>; }
class RealAPI implements API {
  async fetchData(id: string) { /* expensive call */ return {}; }
}
class CachingProxy implements API {
  private cache = new Map<string, unknown>();
  constructor(private real: RealAPI) {}
  async fetchData(id: string) {
    if (!this.cache.has(id)) {
      this.cache.set(id, await this.real.fetchData(id));
    }
    return this.cache.get(id);
  }
}`, pros: ['Control without client changes', 'Manage lifecycle', 'Works when real object not ready'], cons: ['Increased complexity', 'Response delay'] },
    { name: 'Composite', icon: 'Cm', intent: 'Compose objects into tree structures to represent part-whole hierarchies.', problem: 'Need to treat individual objects and groups of objects uniformly.', whenToUse: ['Tree structures', 'File systems', 'UI component trees', 'Organization charts'], structure: 'Component (interface) <- Leaf; Composite (has children: Component[])', codeTs: `interface FileSystemItem { getSize(): number; getName(): string; }
class File implements FileSystemItem {
  constructor(private name: string, private size: number) {}
  getSize() { return this.size; }
  getName() { return this.name; }
}
class Directory implements FileSystemItem {
  private children: FileSystemItem[] = [];
  constructor(private name: string) {}
  add(item: FileSystemItem) { this.children.push(item); }
  getSize() { return this.children.reduce((s, c) => s + c.getSize(), 0); }
  getName() { return this.name; }
}`, pros: ['Uniform treatment of objects', 'Easy to add new types', 'Simplifies client code'], cons: ['Hard to restrict component types', 'Can be overly general'] },
  ]},
  { name: 'Behavioral', color: '#ff9800', patterns: [
    { name: 'Observer', icon: 'Ob', intent: 'Define a one-to-many dependency so that when one object changes state, all dependents are notified.', problem: 'Multiple objects need to react to state changes without tight coupling.', whenToUse: ['Event systems', 'UI data binding', 'Pub/sub messaging', 'State change notifications'], structure: 'Subject -> Observer (interface) <- ConcreteObservers', codeTs: `type Listener<T> = (data: T) => void;
class EventEmitter<T> {
  private listeners: Listener<T>[] = [];
  subscribe(fn: Listener<T>) {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }
  emit(data: T) { this.listeners.forEach(fn => fn(data)); }
}
const bus = new EventEmitter<string>();
const unsub = bus.subscribe(msg => console.log(msg));
bus.emit('Hello!');
unsub(); // unsubscribe`, pros: ['Loose coupling', 'Dynamic relationships', 'Open/Closed Principle'], cons: ['Unexpected updates', 'Memory leaks if not unsubscribed', 'Order not guaranteed'] },
    { name: 'Strategy', icon: 'St', intent: 'Define a family of algorithms, encapsulate each, and make them interchangeable.', problem: 'Need to switch between different algorithms at runtime.', whenToUse: ['Multiple algorithm variants', 'Avoiding conditionals', 'Runtime algorithm selection'], structure: 'Context -> Strategy (interface) <- ConcreteStrategies', codeTs: `interface SortStrategy<T> { sort(data: T[]): T[]; }
class QuickSort<T> implements SortStrategy<T> {
  sort(data: T[]) { return [...data].sort(); }
}
class BubbleSort<T> implements SortStrategy<T> {
  sort(data: T[]) { /* bubble sort impl */ return data; }
}
class Sorter<T> {
  constructor(private strategy: SortStrategy<T>) {}
  setStrategy(s: SortStrategy<T>) { this.strategy = s; }
  sort(data: T[]) { return this.strategy.sort(data); }
}`, pros: ['Swap algorithms at runtime', 'Isolate implementation', 'Open/Closed Principle'], cons: ['Clients must know strategies', 'Extra classes', 'Overkill for few algorithms'] },
    { name: 'Command', icon: 'Co', intent: 'Encapsulate a request as an object, allowing parameterization and queuing.', problem: 'Need to decouple sender from receiver, support undo/redo, or queue operations.', whenToUse: ['Undo/redo functionality', 'Transaction queues', 'Macro recording', 'Deferred execution'], structure: 'Invoker -> Command (interface) <- ConcreteCommand -> Receiver', codeTs: `interface Command { execute(): void; undo(): void; }
class AddTextCommand implements Command {
  constructor(private editor: { text: string }, private added: string) {}
  execute() { this.editor.text += this.added; }
  undo() { this.editor.text = this.editor.text.slice(0, -this.added.length); }
}
class History {
  private stack: Command[] = [];
  execute(cmd: Command) { cmd.execute(); this.stack.push(cmd); }
  undo() { this.stack.pop()?.undo(); }
}`, pros: ['Decouple invoker/receiver', 'Undo/redo support', 'Composable commands'], cons: ['Many command classes', 'Increased complexity'] },
    { name: 'State', icon: 'Ss', intent: 'Allow an object to alter its behavior when its internal state changes.', problem: 'Object behavior depends on state, leading to complex conditionals.', whenToUse: ['State machines', 'Workflow engines', 'UI states', 'Game character states'], structure: 'Context -> State (interface) <- ConcreteStates', codeTs: `interface State {
  handle(context: TrafficLight): void;
  color: string;
}
class GreenState implements State {
  color = 'green';
  handle(ctx: TrafficLight) { ctx.setState(new YellowState()); }
}
class YellowState implements State {
  color = 'yellow';
  handle(ctx: TrafficLight) { ctx.setState(new RedState()); }
}
class RedState implements State {
  color = 'red';
  handle(ctx: TrafficLight) { ctx.setState(new GreenState()); }
}
class TrafficLight {
  constructor(private state: State = new RedState()) {}
  setState(s: State) { this.state = s; }
  change() { this.state.handle(this); }
  getColor() { return this.state.color; }
}`, pros: ['Eliminates state conditionals', 'Single Responsibility', 'Open/Closed Principle'], cons: ['Overkill for few states', 'More classes'] },
    { name: 'Iterator', icon: 'It', intent: 'Provide a way to access elements of a collection sequentially without exposing its representation.', problem: 'Need to traverse different data structures uniformly.', whenToUse: ['Custom collections', 'Lazy evaluation', 'Uniform traversal interface'], structure: 'Iterator (interface) <- ConcreteIterator; Iterable <- ConcreteCollection', codeTs: `class RangeIterator implements Iterable<number> {
  constructor(private start: number, private end: number) {}
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) yield i;
  }
}
for (const n of new RangeIterator(1, 5)) {
  console.log(n); // 1, 2, 3, 4, 5
}`, pros: ['Clean traversal code', 'Multiple iterators simultaneously', 'Lazy evaluation'], cons: ['Overkill for simple collections', 'Performance overhead'] },
    { name: 'Template Method', icon: 'Tm', intent: 'Define the skeleton of an algorithm, deferring some steps to subclasses.', problem: 'Algorithm steps are fixed but individual steps vary.', whenToUse: ['Framework hooks', 'Data processing pipelines', 'Common algorithm skeleton'], structure: 'AbstractClass (template method + abstract steps) <- ConcreteClasses', codeTs: `abstract class DataProcessor {
  process(data: string): string {
    const parsed = this.parse(data);
    const validated = this.validate(parsed);
    return this.format(validated);
  }
  abstract parse(data: string): unknown;
  abstract validate(data: unknown): unknown;
  abstract format(data: unknown): string;
}
class CSVProcessor extends DataProcessor {
  parse(data: string) { return data.split(','); }
  validate(data: unknown) { return data; }
  format(data: unknown) { return JSON.stringify(data); }
}`, pros: ['Code reuse', 'Controlled extension points', 'Eliminates duplication'], cons: ['Inheritance coupling', 'Hard to maintain many steps', 'Liskov Substitution issues'] },
  ]},
];

export default function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Pattern | null>(null);
  const [codeTab, setCodeTab] = useState(0);
  const [snack, setSnack] = useState('');

  const copy = (t: string) => { navigator.clipboard.writeText(t); setSnack('Copied!'); };

  const filtered = useMemo(() => {
    let cats = DATA;
    if (category !== 'All') cats = cats.filter(c => c.name === category);
    if (!search) return cats;
    const s = search.toLowerCase();
    return cats.map(c => ({ ...c, patterns: c.patterns.filter(p => p.name.toLowerCase().includes(s) || p.intent.toLowerCase().includes(s)) })).filter(c => c.patterns.length > 0);
  }, [search, category]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'grey.300', p: 3 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Link to="/"><IconButton size="small" sx={{ color: 'grey.500' }}><Home /></IconButton></Link>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Design Patterns Reference</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search patterns..." value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} /> }}
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: '#111', '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#1976d2' } }, '& .MuiInputBase-input': { color: 'grey.300' } }} />
          <FormControl size="small" sx={{ width: 180, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' } }, '& .MuiInputLabel-root': { color: 'grey.500' }, '& .MuiSelect-icon': { color: 'grey.500' } }}>
            <InputLabel sx={{ color: 'grey.500' }}>Category</InputLabel>
            <Select value={category} onChange={e => setCategory(e.target.value)} label="Category" sx={{ color: 'grey.300' }}>
              <MenuItem value="All">All</MenuItem>
              {DATA.map(c => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            {filtered.map(cat => (
              <Box key={cat.name} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: cat.color, mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: cat.color, borderRadius: '50%' }} />{cat.name} ({cat.patterns.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {cat.patterns.map(p => (
                    <Paper key={p.name} onClick={() => { setSelected(p); setCodeTab(0); }}
                      sx={{ bgcolor: selected?.name === p.name ? cat.color + '22' : '#111', border: `1px solid ${selected?.name === p.name ? cat.color : '#222'}`, p: 1.5, cursor: 'pointer', width: 140, '&:hover': { borderColor: cat.color + '88' }, transition: 'all 0.2s' }}>
                      <Box sx={{ width: 32, height: 32, bgcolor: cat.color + '33', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 12, color: cat.color }}>{p.icon}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{p.name}</Typography>
                      <Typography variant="caption" sx={{ color: 'grey.500', fontSize: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.intent}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {selected && (
            <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, flex: 1.5, minWidth: 350, maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{selected.name}</Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 2 }}>{selected.intent}</Typography>

              <Typography variant="subtitle2" sx={{ color: 'grey.500', mt: 1 }}>Problem:</Typography>
              <Typography variant="body2" sx={{ color: 'grey.300', mb: 1, fontSize: 13 }}>{selected.problem}</Typography>

              <Typography variant="subtitle2" sx={{ color: 'grey.500', mt: 1 }}>When to Use:</Typography>
              <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.whenToUse.map(w => <Chip key={w} label={w} size="small" sx={{ bgcolor: '#1a2332', color: '#90caf9', fontSize: 11 }} />)}
              </Box>

              <Typography variant="subtitle2" sx={{ color: 'grey.500', mt: 1 }}>Structure:</Typography>
              <Box sx={{ p: 1, bgcolor: '#0a0a0a', borderRadius: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12, color: '#ce93d8' }}>{selected.structure}</Typography>
              </Box>

              <Typography variant="subtitle2" sx={{ color: 'grey.500', mt: 1 }}>Code Example:</Typography>
              <Tabs value={codeTab} onChange={(_, v) => setCodeTab(v)} sx={{ '& .MuiTab-root': { color: 'grey.500', textTransform: 'none', fontSize: 12, minWidth: 60 }, '& .Mui-selected': { color: '#90caf9' } }}>
                <Tab label="TypeScript" />
              </Tabs>
              <Box sx={{ position: 'relative', mb: 1 }}>
                <Tooltip title="Copy code"><IconButton onClick={() => copy(selected.codeTs)} sx={{ position: 'absolute', right: 4, top: 4, color: 'grey.500' }}><ContentCopy sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                <Box component="pre" sx={{ p: 1.5, bgcolor: '#0a0a0a', borderRadius: 1, fontFamily: 'monospace', fontSize: 12, color: '#81c784', overflow: 'auto', maxHeight: 300, whiteSpace: 'pre', m: 0 }}>
                  {selected.codeTs}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#4caf50', fontSize: 12 }}>Pros:</Typography>
                  {selected.pros.map(p => <Typography key={p} variant="body2" sx={{ fontSize: 12, color: 'grey.400', pl: 1, '&::before': { content: '"+ "', color: '#4caf50' } }}>{p}</Typography>)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#f44336', fontSize: 12 }}>Cons:</Typography>
                  {selected.cons.map(c => <Typography key={c} variant="body2" sx={{ fontSize: 12, color: 'grey.400', pl: 1, '&::before': { content: '"- "', color: '#f44336' } }}>{c}</Typography>)}
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
      <Snackbar open={!!snack} autoHideDuration={1500} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}
