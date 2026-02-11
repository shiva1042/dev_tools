import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Receipt, Calculator, Download } from 'lucide-react';

interface LineItem { id: string; description: string; quantity: number; price: number; }

export default function App() {
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<LineItem[]>([{ id: '1', description: '', quantity: 1, price: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [tip, setTip] = useState(0);
  const [currency, setCurrency] = useState('USD');

  const addItem = () => setItems(prev => [...prev, { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 }]);
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax + tip;

  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };
  const sym = symbols[currency] || '$';

  const exportData = () => {
    const data = { vendor, date, currency, items: items.map(i => ({ ...i, total: i.quantity * i.price })), subtotal, taxRate, tax, tip, total };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `receipt-${date}.json`; a.click();
  };

  const splitBill = (ways: number) => ways > 0 ? (total / ways).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Receipt className="w-6 h-6 text-lime-400" /> Receipt Scanner</h1>
          <p className="text-gray-400 text-sm">Digitize and calculate receipts</p></div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Vendor</label>
              <input value={vendor} onChange={e => setVendor(e.target.value)} placeholder="Store name..." className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
          </div>
          <div className="flex gap-3 mb-4">
            <div><label className="block text-xs text-gray-500 mb-1">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm">
                {Object.keys(symbols).map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={e => setTaxRate(+e.target.value)} min={0} step={0.5} className="w-20 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
            <div><label className="block text-xs text-gray-500 mb-1">Tip ({sym})</label>
              <input type="number" value={tip} onChange={e => setTip(+e.target.value)} min={0} step={0.01} className="w-24 p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm" /></div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-[1fr_60px_80px_32px] gap-2 text-xs text-gray-500 px-1">
              <span>Description</span><span className="text-center">Qty</span><span className="text-center">Price</span><span />
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-[1fr_60px_80px_32px] gap-2 items-center">
                <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Item..." className="p-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none" />
                <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', +e.target.value)} min={1} className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-center" />
                <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', +e.target.value)} min={0} step={0.01} className="p-2 bg-gray-800 border border-gray-700 rounded text-sm text-center" />
                <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="flex items-center gap-1 text-sm text-lime-400 hover:text-lime-300"><Plus className="w-4 h-4" /> Add Item</button>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{sym}{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Tax ({taxRate}%)</span><span>{sym}{tax.toFixed(2)}</span></div>
            {tip > 0 && <div className="flex justify-between text-gray-400"><span>Tip</span><span>{sym}{tip.toFixed(2)}</span></div>}
            <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-lime-400">{sym}{total.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 mb-4">
          <h3 className="text-sm text-gray-400 mb-2"><Calculator className="w-4 h-4 inline mr-1" /> Split Bill</h3>
          <div className="flex gap-3">{[2, 3, 4, 5].map(n => (
            <div key={n} className="flex-1 p-2 bg-gray-800 rounded-lg text-center">
              <div className="text-xs text-gray-500">{n} ways</div>
              <div className="text-sm font-mono text-white">{sym}{splitBill(n)}</div>
            </div>
          ))}</div>
        </div>
        <button onClick={exportData} className="flex items-center gap-1 px-4 py-2 bg-lime-600 hover:bg-lime-700 rounded-lg text-sm"><Download className="w-4 h-4" /> Export JSON</button>
      </div>
    </div>
  );
}
