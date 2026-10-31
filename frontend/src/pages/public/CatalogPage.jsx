import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Icon from '../../components/Icon';
import { 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Zap, 
  Filter, 
  Sparkles,
  Layers
} from 'lucide-react';

export const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const categories = ['All', 'Finance & Accounting', 'Human Resources', 'Supply Chain & Logistics', 'Education Technology', 'Retail & Commerce'];

  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prod.tagline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#f8faf8] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider">
            Proprietary Software Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 font-['Plus_Jakarta_Sans']">
            Enterprise Cloud Software Suite
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Browse our full suite of subscription-based software systems. Select a plan to start instant checkout or request a custom deployment.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search software products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0a241b] text-[#bef264] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-7 border border-slate-200 h-96 animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No software found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or choosing another category.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 bg-[#0a241b] text-[#bef264] rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const lowestPrice = product.plans && product.plans.length > 0
                ? Math.min(...product.plans.map(p => Number(p.price)))
                : 29;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl p-7 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#0a241b] text-[#bef264] flex items-center justify-center shadow-md">
                        <Icon name={product.icon} className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {product.badge && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {product.badge}
                          </span>
                        )}
                        <span className="flex items-center text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-current mr-0.5" />
                          {product.rating}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans'] group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                      {product.tagline}
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Category: {product.category}
                    </p>

                    <p className="text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Features checklist */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Included Capabilities</p>
                      {product.features?.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Available Plans Count */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                      <span>Available tiers:</span>
                      <span className="font-semibold text-slate-800">
                        {product.plans?.length || 6} plans (Monthly & Annual)
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Starts at</span>
                      <span className="text-2xl font-extrabold text-slate-900">${lowestPrice}</span>
                      <span className="text-xs text-slate-500 font-medium">/mo</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="bg-[#0a241b] hover:bg-[#133e30] text-[#bef264] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <span>Choose Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogPage;
