import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import Icon from '../../components/Icon';
import Modal from '../../components/Modal';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Star, 
  Search,
  AlertCircle
} from 'lucide-react';

export const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [targetProductForPlan, setTargetProductForPlan] = useState(null);

  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'Finance & Accounting',
    icon: 'Package',
    badge: 'Popular',
    rating: '4.9',
    features: '',
    is_active: true
  });

  // Plan form state
  const [planFormData, setPlanFormData] = useState({
    name: 'Standard',
    billing_cycle: 'MONTHLY',
    price: '49.00',
    trial_days: 14,
    features: 'Up to 10 users\nPriority support\nAPI access',
    is_popular: false
  });

  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      category: 'Finance & Accounting',
      icon: 'Package',
      badge: '',
      rating: '4.9',
      features: 'Cloud backup\nUnlimited transactions\n24/7 Support',
      is_active: true
    });
    setError('');
    setProductModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      slug: prod.slug,
      tagline: prod.tagline || '',
      description: prod.description || '',
      category: prod.category || 'Business Software',
      icon: prod.icon || 'Package',
      badge: prod.badge || '',
      rating: String(prod.rating || '4.9'),
      features: Array.isArray(prod.features) ? prod.features.join('\n') : '',
      is_active: prod.is_active
    });
    setError('');
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        features: formData.features.split('\n').filter(Boolean),
        rating: Number(formData.rating)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}/`, payload);
      } else {
        await api.post('/products/', payload);
      }
      setProductModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this software product? All associated plans will also be removed.")) return;
    try {
      await api.delete(`/products/${id}/`);
      fetchProducts();
    } catch (err) {
      alert("Failed to delete product.");
    }
  };

  const openAddPlanModal = (prod) => {
    setTargetProductForPlan(prod);
    setPlanFormData({
      name: 'Professional',
      billing_cycle: 'MONTHLY',
      price: '59.00',
      trial_days: 14,
      features: 'Full platform access\nPriority email support\nDedicated dashboard',
      is_popular: false
    });
    setError('');
    setPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    if (!targetProductForPlan) return;
    setError('');

    try {
      const payload = {
        product: targetProductForPlan.id,
        name: planFormData.name,
        billing_cycle: planFormData.billing_cycle,
        price: Number(planFormData.price),
        trial_days: Number(planFormData.trial_days),
        features: planFormData.features.split('\n').filter(Boolean),
        is_popular: planFormData.is_popular,
        is_active: true
      };

      await api.post('/plans/', payload);
      setPlanModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add subscription plan.');
    }
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-['Plus_Jakarta_Sans']">
            Software Products & Subscription Plans
          </h2>
          <p className="text-xs text-slate-500">
            Create, edit, and configure proprietary software products and pricing tiers.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Software Product</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Tiers / Plans</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0a241b] text-[#bef264] flex items-center justify-center font-bold shrink-0">
                      <Icon name={prod.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <span>{prod.name}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{prod.tagline}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">{prod.category}</td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-slate-900">{prod.plans?.length || 0} plans</span>
                    <button
                      onClick={() => openAddPlanModal(prod)}
                      className="ml-2 text-[10px] text-emerald-700 font-bold hover:underline"
                    >
                      + Add Tier
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <span className="flex items-center text-amber-500 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      {prod.rating}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {prod.is_active ? 'Active / Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
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

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? "Edit Software Product" : "Add New Software Product"}
        subtitle="Manage product details visible across public and dashboard catalogues"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleProductSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. BrightBooks"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="brightbooks"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Automated Cloud Accounting & Financial Automation"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Finance, HR, Logistics, Education, Retail"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Badge Tag</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Most Popular, Enterprise"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Comprehensive software description..."
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Features (One per line)</label>
            <textarea
              rows={3}
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="Real-time multi-currency&#10;Automated invoices&#10;Bank feeds sync"
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold hover:bg-[#133e30]"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Plan Add Modal */}
      <Modal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        title={`Add Subscription Tier to ${targetProductForPlan?.name}`}
        subtitle="Create a new pricing plan tier for this software product"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                placeholder="Starter, Growth, Enterprise"
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Billing Cycle</label>
              <select
                value={planFormData.billing_cycle}
                onChange={(e) => setPlanFormData({ ...planFormData, billing_cycle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={planFormData.price}
                onChange={(e) => setPlanFormData({ ...planFormData, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Trial Days</label>
              <input
                type="number"
                value={planFormData.trial_days}
                onChange={(e) => setPlanFormData({ ...planFormData, trial_days: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tier Features (One per line)</label>
            <textarea
              rows={3}
              value={planFormData.features}
              onChange={(e) => setPlanFormData({ ...planFormData, features: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-800"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={planFormData.is_popular}
                onChange={(e) => setPlanFormData({ ...planFormData, is_popular: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 border-slate-300"
              />
              <span className="font-semibold">Mark as 'Most Popular' highlight</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setPlanModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-bold"
            >
              Save Plan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsManager;
