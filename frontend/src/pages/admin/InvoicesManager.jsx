import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  FileText, 
  Plus, 
  Search, 
  Receipt, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  CreditCard,
  Printer
} from 'lucide-react';

export const InvoicesManager = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    subtotal: '100.00',
    tax_amount: '10.00',
    discount_amount: '0.00',
    status: 'UNPAID',
    notes: 'Standard enterprise invoice',
    description: 'Custom implementation service',
    quantity: 1,
    unit_price: '100.00'
  });
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    try {
      const [invRes, custRes] = await Promise.all([
        api.get('/invoices/'),
        api.get('/users/?role=CUSTOMER')
      ]);
      setInvoices(invRes.data);
      setCustomers(custRes.data);
      if (custRes.data.length > 0 && !formData.customer_id) {
        setFormData(prev => ({ ...prev, customer_id: custRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        customer_id: formData.customer_id,
        subtotal: formData.subtotal,
        tax_amount: formData.tax_amount,
        discount_amount: formData.discount_amount,
        status: formData.status,
        notes: formData.notes,
        items: [
          {
            description: formData.description,
            quantity: Number(formData.quantity),
            unit_price: formData.unit_price
          }
        ]
      };

      await api.post('/invoices/', payload);
      setCreateModalOpen(false);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create invoice.');
    }
  };

  const handleMarkPaid = async (inv) => {
    try {
      await api.post(`/invoices/${inv.id}/pay/`, { card_number: '4242' });
      fetchInvoices();
      alert(`Invoice ${inv.invoice_number} marked as PAID and payment recorded.`);
    } catch (err) {
      alert("Failed to record payment.");
    }
  };

  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_details?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Invoices & Billing Records
          </h2>
          <p className="text-xs text-slate-500">
            Track automated subscription billing invoices, customer receipts, and manual charges.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setCreateModalOpen(true);
          }}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Manual Invoice</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'PAID', 'UNPAID', 'OVERDUE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#0a241b] text-[#bef264]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product / Item</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div>{inv.customer_details?.first_name ? `${inv.customer_details.first_name} ${inv.customer_details.last_name || ''}` : inv.customer_details?.username}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{inv.customer_details?.company_name || 'Individual'}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-700">
                    {inv.items?.[0]?.description || inv.notes || 'Subscription Service'}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.issue_date}</td>
                  <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.due_date}</td>
                  <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">${inv.total_amount}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inv.status === 'OVERDUE'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setPreviewInvoice(inv)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                      title="View Receipt"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {inv.status !== 'PAID' && (
                      <button
                        onClick={() => handleMarkPaid(inv)}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[10px] font-bold"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Invoice Creation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Manual Invoice"
        subtitle="Issue an ad-hoc invoice for enterprise software customization or services"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
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
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Dedicated API Connector Module"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subtotal ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tax ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Terms</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Invoice Receipt Preview Modal */}
      <Modal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        title="Official Tax Invoice & Receipt"
        subtitle="MEMZO SaaS Subscription Billing Document"
        maxWidth="max-w-xl"
      >
        {previewInvoice && (
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-5">
              {/* Receipt Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900">MEMZO INC.</h3>
                  <p className="text-[10px] text-slate-500">Cloud Subscription Billing Operations</p>
                  <p className="text-[10px] text-slate-500">Tax ID: US-92817491-B</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-sm text-slate-900">{previewInvoice.invoice_number}</p>
                  <p className="text-[10px] text-slate-500">Issued: {previewInvoice.issue_date}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    previewInvoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {previewInvoice.status}
                  </span>
                </div>
              </div>

              {/* Billed To */}
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Billed To:</p>
                <p className="font-bold text-slate-900 text-xs">
                  {previewInvoice.customer_details?.first_name} {previewInvoice.customer_details?.last_name || previewInvoice.customer_details?.username}
                </p>
                <p className="text-xs text-slate-600">{previewInvoice.customer_details?.company_name || 'Individual Customer'}</p>
                <p className="text-xs text-slate-500">{previewInvoice.customer_details?.email}</p>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-200 text-xs">
                <div className="flex justify-between py-2 font-bold text-slate-600 uppercase text-[10px]">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                {previewInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2.5">
                    <span>{item.description} (x{item.quantity})</span>
                    <span className="font-semibold text-slate-900">${item.total}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${previewInvoice.subtotal}</span>
                </div>
                {Number(previewInvoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-${previewInvoice.discount_amount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Tax Amount</span>
                  <span>+${previewInvoice.tax_amount}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-emerald-700">${previewInvoice.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoicesManager;
