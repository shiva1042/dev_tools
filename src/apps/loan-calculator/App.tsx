import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Landmark, TrendingUp } from 'lucide-react';

export default function App() {
  const [principal, setPrincipal] = useState(250000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extraPayment, setExtraPayment] = useState(0);

  const calc = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    if (r === 0) { const mp = principal / n; return { monthly: mp, totalPayment: mp * n, totalInterest: 0, schedule: [] }; }
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let balance = principal;
    const schedule: { month: number; payment: number; principalPart: number; interest: number; balance: number }[] = [];
    let totalInterest = 0;
    for (let m = 1; m <= n && balance > 0; m++) {
      const interest = balance * r;
      let principalPart = monthly - interest + extraPayment;
      if (principalPart > balance) principalPart = balance;
      balance = Math.max(0, balance - principalPart);
      totalInterest += interest;
      schedule.push({ month: m, payment: principalPart + interest, principalPart, interest, balance });
      if (balance <= 0) break;
    }
    return { monthly, totalPayment: principal + totalInterest, totalInterest, schedule };
  }, [principal, rate, years, extraPayment]);

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const payoffMonths = calc.schedule.length;
  const savedMonths = years * 12 - payoffMonths;
  const savedInterest = extraPayment > 0 ? (() => {
    const r = rate / 100 / 12; const n = years * 12;
    if (r === 0) return 0;
    const monthly = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let bal = principal, ti = 0;
    for (let m = 1; m <= n && bal > 0; m++) { const i = bal * r; bal -= (monthly - i); ti += i; }
    return ti - calc.totalInterest;
  })() : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="p-2 hover:bg-gray-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Landmark className="w-6 h-6 text-violet-400" /> Loan Calculator</h1>
          <p className="text-gray-400 text-sm">Calculate payments and amortization</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 space-y-4">
              {[{ label: 'Loan Amount ($)', value: principal, set: setPrincipal, min: 1000, max: 10000000, step: 1000 },
                { label: 'Interest Rate (%)', value: rate, set: setRate, min: 0, max: 30, step: 0.1 },
                { label: 'Loan Term (years)', value: years, set: setYears, min: 1, max: 50, step: 1 },
                { label: 'Extra Monthly Payment ($)', value: extraPayment, set: setExtraPayment, min: 0, max: 10000, step: 50 },
              ].map(({ label, value, set, min, max, step }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{label}</span>
                    <input type="number" value={value} onChange={e => set(+e.target.value)} className="w-28 p-1 bg-gray-800 border border-gray-700 rounded text-right text-sm focus:outline-none" step={step} /></div>
                  <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} className="w-full" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
                <p className="text-xs text-gray-500">Monthly Payment</p>
                <p className="text-2xl font-bold text-violet-400">{fmt(calc.monthly + extraPayment)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
                <p className="text-xs text-gray-500">Total Interest</p>
                <p className="text-2xl font-bold text-red-400">{fmt(calc.totalInterest)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
                <p className="text-xs text-gray-500">Total Payment</p>
                <p className="text-lg font-bold">{fmt(calc.totalPayment)}</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-xl border border-gray-800 text-center">
                <p className="text-xs text-gray-500">Payoff</p>
                <p className="text-lg font-bold">{Math.floor(payoffMonths / 12)}y {payoffMonths % 12}m</p>
              </div>
            </div>
            {extraPayment > 0 && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-sm text-green-400 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> With extra payments:</p>
                <p className="text-xs text-gray-400 mt-1">Save {fmt(savedInterest)} in interest, pay off {savedMonths} months early</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
            <h3 className="text-sm text-gray-400 mb-3">Amortization Schedule</h3>
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-900"><tr className="text-gray-500">
                  <th className="py-1 text-left">Month</th><th className="text-right">Payment</th><th className="text-right">Principal</th><th className="text-right">Interest</th><th className="text-right">Balance</th>
                </tr></thead>
                <tbody>{calc.schedule.filter((_, i) => i % (payoffMonths > 120 ? 12 : payoffMonths > 60 ? 6 : 1) === 0).map(row => (
                  <tr key={row.month} className="border-t border-gray-800 text-gray-400">
                    <td className="py-1">{row.month}</td><td className="text-right">{fmt(row.payment)}</td><td className="text-right">{fmt(row.principalPart)}</td>
                    <td className="text-right">{fmt(row.interest)}</td><td className="text-right">{fmt(row.balance)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
