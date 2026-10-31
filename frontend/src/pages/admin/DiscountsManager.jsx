import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  Tag, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  DollarSign 
} from 'lucide-react';

export const DiscountsManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    value: '20.00',
    min_order_value: '50.00',
    is_active: true
  });
  const [error, setError] = useState('');

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts/');
      setDiscounts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/discounts/', {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        value: Number(formData.value),
        min_order_value: Number(formData.min_order_value)
      });
      setModalOpen(false);
      fetchDiscounts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create discount rule.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this discount coupon?")) return;
    try {
      await api.delete(`/discounts/${id}/`);
      fetchDiscounts();
    } catch (err) {
      alert("Failed to delete discount.");
    }
  };

  const filtered = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Discount Rules & Coupons
          </h2>
          <p className="text-xs text-slate-500">
            Define promotional discount coupons, percentage deductions, and minimum purchase thresholds.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              code: '',
              description: '',
              discount_type: 'PERCENTAGE',
              value: '20.00',
              min_order_value: '50.00',
              is_active: true
            });
            setError('');
            setModalOpen(true);
          }}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Discount Code</span>
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter coupon codes..."
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
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Value</th>
                <th className="py-3 px-4">Min Order</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-1 rounded bg-[#0a241b] text-[#bef264]">
                      <Tag className="w-3.5 h-3.5" />
                    </span>
                    <span>{d.code}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {d.discount_type === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                  </td>
                  <td className="py-4 px-4 font-extrabold text-emerald-700">
                    {d.discount_type === 'PERCENTAGE' ? `${d.value}%` : `$${d.value}`}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono">${d.min_order_value}</td>
                  <td className="py-4 px-4 text-slate-600 max-w-xs truncate">{d.description || 'General Discount'}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {d.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        title="Create Promotional Discount"
        subtitle="Offer instant percentage or fixed savings during customer checkout"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateDiscount} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">{error}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coupon Code (Uppercase)</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER25"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 font-mono uppercase text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Type</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Value</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Min Order Value ($)</label>
            <input
              type="number"
              step="0.01"
              value={formData.min_order_value}
              onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 25% Off Annual Growth Plans"
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
              Save Discount Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscountsManager;
