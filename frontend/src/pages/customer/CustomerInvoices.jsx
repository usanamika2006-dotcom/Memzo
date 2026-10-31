import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { 
  FileText, 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Eye, 
  Printer, 
  Lock 
} from 'lucide-react';

export const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices/');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsProcessing(true);

    try {
      await api.post(`/invoices/${payingInvoice.id}/pay/`, {
        card_number: '4242'
      });
      setPayingInvoice(null);
      fetchInvoices();
      alert(`Payment for invoice ${payingInvoice.invoice_number} processed successfully!`);
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
          Invoices & Billing Receipts
        </h2>
        <p className="text-xs text-slate-500">
          Access official VAT tax invoices, check outstanding dues, and settle balances instantly.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No invoices generated yet.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">{inv.invoice_number}</td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {inv.items?.[0]?.description || inv.notes || 'Software Subscription'}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.issue_date}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono text-[11px]">{inv.due_date}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 text-sm">${inv.total_amount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>

                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-3 py-1.5 bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={!!payingInvoice}
        onClose={() => setPayingInvoice(null)}
        title="Settle Invoice Online"
        subtitle={`Invoice ${payingInvoice?.invoice_number} • Total: $${payingInvoice?.total_amount}`}
        maxWidth="max-w-md"
      >
        {payingInvoice && (
          <form onSubmit={handlePayInvoice} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{payingInvoice.items?.[0]?.description || 'Subscription'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Due:</span>
                <span className="font-extrabold text-slate-900">${payingInvoice.total_amount}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Simulated Card</label>
              <input
                type="text"
                disabled
                value="4242 •••• •••• 4242"
                className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl px-3 py-2.5 font-mono text-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Test card authorized automatically.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#0a241b] text-[#bef264] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Authorizing Payment...' : `Confirm Payment of $${payingInvoice.total_amount}`}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Invoice Receipt Modal */}
      <Modal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        title="Official Tax Receipt"
        subtitle="MEMZO SaaS Subscription Billing Document"
        maxWidth="max-w-lg"
      >
        {previewInvoice && (
          <div className="space-y-5">
            <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">MEMZO INC.</h4>
                  <p className="text-[10px] text-slate-500">Customer Subscription Billing</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold">{previewInvoice.invoice_number}</p>
                  <p className="text-[10px] text-slate-400">{previewInvoice.issue_date}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Billed To:</p>
                <p className="font-bold text-slate-900">{previewInvoice.customer_details?.username}</p>
                <p className="text-slate-500">{previewInvoice.customer_details?.company_name || 'Individual'}</p>
              </div>

              <div className="divide-y divide-slate-200">
                {previewInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <span>{item.description} (x{item.quantity})</span>
                    <span className="font-semibold">${item.total}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>${previewInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax Amount</span>
                  <span>+${previewInvoice.tax_amount}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Paid</span>
                  <span className="text-emerald-700">${previewInvoice.total_amount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setPreviewInvoice(null)}
                className="px-4 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerInvoices;
