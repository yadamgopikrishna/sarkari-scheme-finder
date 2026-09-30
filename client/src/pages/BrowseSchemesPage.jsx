import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  Compass,
  Building2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function BrowseSchemesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();

  const [schemes, setSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [comparedSchemes, setComparedSchemes] = useState([]);

  // URL state sync
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';
  const state = searchParams.get('state') || 'All';
  const governmentLevel = searchParams.get('governmentLevel') || 'All';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, stateRes] = await Promise.all([
          api.get('/categories'),
          api.get('/meta/states'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data);
        if (stateRes.data.success) setStatesList(stateRes.data.data);
      } catch (err) {
        console.error('Failed to load metadata:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch schemes when filters change
  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          search,
          category,
          state,
          governmentLevel,
          sortBy,
          page: page.toString(),
          limit: '9',
        });

        const res = await api.get(`/schemes?${queryParams.toString()}`);
        if (res.data.success) {
          setSchemes(res.data.data);
          setTotalCount(res.data.total);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Failed to load schemes:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [search, category, state, governmentLevel, sortBy, page]);

  const updateParam = (key, val) => {
    const newParams = new URLSearchParams(searchParams);
    if (val === 'All' || !val) {
      newParams.delete(key);
    } else {
      newParams.set(key, val);
    }
    // Only reset to page 1 if a filter/search changed, NOT when changing page
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleCompareToggle = (scheme) => {
    const id = scheme._id;
    setComparedSchemes((prev) => {
      const exists = prev.some((s) => s._id === id);
      if (exists) {
        return prev.filter((s) => s._id !== id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 schemes at a time.');
          return prev;
        }
        return [...prev, scheme];
      }
    });
  };

  const quickSearchTags = [
    'Farmer',
    'Pension',
    'Andhra Pradesh',
    'Scholarship',
    'Housing',
    'Health insurance',
    'Street vendor',
    'Women schemes',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Government Schemes Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Explore verified Central and State welfare initiatives, qualification criteria, and official application portals.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search by keyword, scheme name, or benefits (e.g. Kisan, Awas, Vidya)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
          />
        </form>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Popular Searches:</span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              onClick={() => updateParam('search', tag)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-[11px] font-medium transition-colors border border-slate-200"
            >
              {tag}
            </button>
          ))}
          {search && (
            <button
              onClick={() => updateParam('search', '')}
              className="text-xs text-red-600 hover:underline flex items-center gap-1 font-semibold ml-2"
            >
              <RotateCcw className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Main Filter & Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-orange-600" />
                Filter Schemes
              </span>
              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="text-[11px] text-orange-600 hover:underline font-semibold"
              >
                Reset All
              </button>
            </div>

            {/* Government Level Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Government Level</label>
              <div className="space-y-1 text-xs">
                {['All', 'Central', 'State'].map((lvl) => (
                  <label
                    key={lvl}
                    className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    <input
                      type="radio"
                      name="govLevel"
                      checked={governmentLevel === lvl}
                      onChange={() => updateParam('governmentLevel', lvl)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span>{lvl === 'All' ? 'All Governments' : `${lvl} Government`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* State / UT Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">State / Union Territory</label>
              <select
                value={state}
                onChange={(e) => updateParam('state', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All States & UTs</option>
                {statesList.map((s) => (
                  <option key={s.code} value={s.stateName}>
                    {s.stateName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Scheme Category</label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name} ({c.schemeCount || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scheme Cards Grid & Sorting Bar */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{schemes.length}</strong> of{' '}
              <strong className="text-slate-900">{totalCount}</strong> verified schemes
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 whitespace-nowrap">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
              >
                <option value="newest">Newest Added</option>
                <option value="popular">Most Popular / Viewed</option>
                <option value="verified">Recently Verified</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-xs text-slate-500">Loading verified schemes...</div>
          ) : schemes.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <Compass className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-800">No schemes found matching criteria</h3>
              <p className="text-xs text-slate-500">Try changing or clearing your filters above.</p>
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schemes.map((sc) => {
                const isCompared = comparedSchemes.some((c) => c._id === sc._id);
                return (
                  <SchemeCard
                    key={sc._id}
                    scheme={sc}
                    onCompareToggle={handleCompareToggle}
                    isCompared={isCompared}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-bold transition-all ${
                        p === page
                          ? 'bg-orange-600 text-white shadow-sm ring-2 ring-orange-500/20'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return (
                    <span key={p} className="px-1 text-xs text-slate-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Action Bar */}
      {comparedSchemes.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold">{comparedSchemes.length} Schemes Selected for Comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/compare"
              state={{ selectedSchemes: comparedSchemes }}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
            >
              Compare Now
            </Link>
            <button
              onClick={() => setComparedSchemes([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
