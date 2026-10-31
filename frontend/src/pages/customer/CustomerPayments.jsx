import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export const CustomerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/');
        setPayments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
          Payment History
        </h2>
        <p className="text-xs text-slate-500">
          Complete ledger of simulated credit card transactions and settlements.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Card Used</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">No payment records found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{p.transaction_id}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {p.payment_method === 'CARD' ? 'Simulated Credit Card' : p.payment_method}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500">•••• {p.card_last_four}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.paid_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-emerald-700 text-sm">${p.amount}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerPayments;
