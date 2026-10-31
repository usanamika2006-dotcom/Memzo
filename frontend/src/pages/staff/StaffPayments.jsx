import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Building 
} from 'lucide-react';

export const StaffPayments = () => {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '79.00',
    payment_method: 'BANK_TRANSFER',
    card_last_four: '0000'
  });
  const [error, setError] = useState('');

  const fetchPaymentsData = async () => {
    try {
      const [payRes, invRes] = await Promise.all([
        api.get('/payments/'),
        api.get('/invoices/')
      ]);
      setPayments(payRes.data);
      const unpaid = invRes.data.filter(i => i.status !== 'PAID');
      setInvoices(unpaid);
      if (unpaid.length > 0 && !formData.invoice_id) {
        setFormData(prev => ({
          ...prev,
          invoice_id: unpaid[0].id,
          amount: unpaid[0].total_amount
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/payments/', formData);
      setModalOpen(false);
      fetchPaymentsData();
      alert("Payment recorded successfully and invoice marked as PAID.");
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record payment.');
    }
  };

  const filtered = payments.filter(p => 
    p.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer_details?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Payments & Transactions
          </h2>
          <p className="text-xs text-slate-500">
            Audit simulated card payments and manually record client wire transfers or cash settlements.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Offline Payment</span>
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by transaction ID or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Card Last 4</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{p.transaction_id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{p.customer_details?.first_name ? `${p.customer_details.first_name} ${p.customer_details.last_name || ''}` : p.customer_details?.username}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{p.customer_details?.company_name || 'Individual'}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium">
                    {p.payment_method === 'CARD' ? 'Simulated Credit Card' : p.payment_method}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-500">**** {p.card_last_four}</td>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment for Unpaid Invoice"
        subtitle="Manually confirm funds received via corporate wire or check"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

          {invoices.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              There are currently no unpaid invoices in the system.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unpaid Invoice</label>
                <select
                  value={formData.invoice_id}
                  onChange={(e) => {
                    const inv = invoices.find(i => String(i.id) === e.target.value);
                    setFormData({
                      ...formData,
                      invoice_id: e.target.value,
                      amount: inv ? inv.total_amount : formData.amount
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} – {inv.customer_details?.username} (${inv.total_amount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CARD">Manual Credit Card</option>
                  <option value="SIMULATED">Simulated Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
                >
                  Record Payment
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default StaffPayments;
