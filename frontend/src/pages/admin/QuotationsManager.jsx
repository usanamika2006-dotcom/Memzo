import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  CheckCircle, 
  XCircle, 
  Send, 
  FileText 
} from 'lucide-react';

export const QuotationsManager = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    title: 'Enterprise Custom Software Package',
    description: 'Custom integration & onboarding package',
    quantity: 1,
    unit_price: '1200.00',
    subtotal: '1200.00',
    tax_amount: '120.00',
    discount_amount: '0.00',
    notes: 'Valid for 30 calendar days from issue.'
  });
  const [error, setError] = useState('');

  const fetchQuotations = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        api.get('/quotations/'),
        api.get('/users/?role=CUSTOMER')
      ]);
      setQuotations(qRes.data);
      setCustomers(cRes.data);
      if (cRes.data.length > 0 && !formData.customer_id) {
        setFormData(prev => ({ ...prev, customer_id: cRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        customer_id: formData.customer_id,
        title: formData.title,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        discount_amount: formData.discount_amount,
        notes: formData.notes,
        items: [
          {
            description: formData.description,
            quantity: Number(formData.quantity),
            unit_price: formData.unit_price
          }
        ]
      };
      await api.post('/quotations/', payload);
      setModalOpen(false);
      fetchQuotations();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create quotation.');
    }
  };

  const handleChangeStatus = async (q, newStatus) => {
    try {
      await api.post(`/quotations/${q.id}/change_status/`, {
        status: newStatus,
        generate_invoice: newStatus === 'ACCEPTED'
      });
      fetchQuotations();
      alert(`Quotation ${q.quotation_number} marked as ${newStatus}.${newStatus === 'ACCEPTED' ? ' Generated invoice automatically.' : ''}`);
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const filtered = quotations.filter(q => 
    q.quotation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customer_details?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Enterprise Quotations
          </h2>
          <p className="text-xs text-slate-500">
            Create custom corporate quotations, track deal acceptance, and convert quotes to invoices.
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
          <span>Create New Quotation</span>
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by quote # or customer..."
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
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{q.quotation_number}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{q.customer_details?.first_name ? `${q.customer_details.first_name} ${q.customer_details.last_name || ''}` : q.customer_details?.username}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{q.customer_details?.company_name || 'Individual'}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-medium">{q.title}</td>
                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{q.valid_until}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">${q.total_amount}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      q.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : q.status === 'REJECTED'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-1.5">
                    {q.status === 'SENT' && (
                      <>
                        <button
                          onClick={() => handleChangeStatus(q, 'ACCEPTED')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold"
                          title="Accept & Convert to Invoice"
                        >
                          Accept & Convert
                        </button>
                        <button
                          onClick={() => handleChangeStatus(q, 'REJECTED')}
                          className="px-2 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-[10px] font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Draft Enterprise Quotation"
        subtitle="Prepare a commercial offer for customer approval"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Account</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.username} ({c.company_name || 'Individual'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quotation Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtotal ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: e.target.value, unit_price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Terms</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2"
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
              Dispatch Quotation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationsManager;
