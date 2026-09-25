import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowUpDown,
  Compass,
  FileCheck,
} from 'lucide-react';
import SchemeCard from '../components/SchemeCard';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const resultsData = location.state?.resultsData;
  const initialInputs = location.state?.userInputs;

  const [schemes, setSchemes] = useState(resultsData?.eligibleSchemes || []);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match');
  const [categories, setCategories] = useState([]);
  const [comparedSchemes, setComparedSchemes] = useState([]);
  const [loadingFallback, setLoadingFallback] = useState(!resultsData);

  // If page loaded without navigation state (e.g. direct URL), fetch active schemes as fallback
  useEffect(() => {
    if (!resultsData) {
      const loadDefaultSchemes = async () => {
        try {
          setLoadingFallback(true);
          const res = await api.get('/schemes?limit=25');
          if (res.data.success) {
            setSchemes(res.data.data);
          }
        } catch (e) {
          console.error('Failed to load fallback schemes:', e.message);
        } finally {
          setLoadingFallback(false);
        }
      };
      loadDefaultSchemes();
    }
  }, [resultsData]);

  // Load categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // Filter & Sort schemes whenever filters change
  useEffect(() => {
    let result = [...schemes];

    if (levelFilter !== 'All') {
      result = result.filter((s) => s.governmentLevel === levelFilter);
    }

    if (categoryFilter !== 'All') {
      result = result.filter(
        (s) => (s.category || '').toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    if (modeFilter !== 'All') {
      result = result.filter((s) => s.applicationMode === modeFilter || s.applicationMode === 'Both');
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (s) =>
          s.schemeName.toLowerCase().includes(q) ||
          (s.category && s.category.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q)) ||
          (s.state && s.state.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'match') {
      result.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
    }

    setFilteredSchemes(result);
  }, [schemes, levelFilter, categoryFilter, modeFilter, searchFilter, sortBy]);

  // Compare scheme selection toggle
  const handleCompareToggle = (scheme) => {
    const id = scheme._id || scheme.schemeId;
    setComparedSchemes((prev) => {
      const exists = prev.some((s) => (s._id || s.schemeId) === id);
      if (exists) {
        return prev.filter((s) => (s._id || s.schemeId) !== id);
      } else {
        if (prev.length >= 4) {
          alert('You can compare up to 4 schemes at a time.');
          return prev;
        }
        return [...prev, scheme];
      }
    });
  };

  const handleOpenCompare = () => {
    navigate('/compare', { state: { selectedSchemes: comparedSchemes } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sarkari-navy via-slate-900 to-sarkari-navy rounded-2xl p-6 sm:p-10 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matching Recommendation Engine Results</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('eligibleHeader')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Based on your inputs, we calculated potential eligibility scores across active government welfare programs.
            </p>
          </div>

          <Link
            to="/check-eligibility"
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow shrink-0"
          >
            Modify Inputs
          </Link>
        </div>

        {/* Dynamic Summary Metric Pills */}
        <div className="flex items-center gap-3 flex-wrap pt-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Total Evaluated: </span>
            <span className="font-bold text-white">{filteredSchemes.length} Schemes</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">High Match (≥ 80%): </span>
            <span className="font-bold text-emerald-400">
              {filteredSchemes.filter((s) => (s.matchPercentage || 0) >= 80).length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Central Government: </span>
            <span className="font-bold text-blue-400">
              {filteredSchemes.filter((s) => s.governmentLevel === 'Central').length}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">State Specific: </span>
            <span className="font-bold text-emerald-400">
              {filteredSchemes.filter((s) => s.governmentLevel === 'State' || s.governmentLevel === 'UT').length}
            </span>
          </div>
        </div>
      </div>

      {/* Advisory Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Please Note: "You May Be Eligible" Status</span>
          <p className="leading-relaxed">
            The match scores below are algorithmically calculated based on current public eligibility criteria. Government department authorities hold sole discretion over sanctioning benefits. Please verify that your official certificates (such as Income, Caste, Land RoR, or Disability) are valid before submitting applications on the official portal.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search filtered results..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Government Level Segment Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto text-xs font-semibold">
            {['All', 'Central', 'State'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`flex-1 md:flex-initial px-3 py-1.5 rounded-md transition-all ${
                  levelFilter === lvl
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'All' ? 'All Levels' : `${lvl} Govt`}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-44 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="match">Sort: Highest Match %</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      {loadingFallback ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading matching schemes...</div>
      ) : filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
          <Compass className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No matching schemes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search terms or filters to view all available government programs.
          </p>
          <button
            onClick={() => {
              setSearchFilter('');
              setLevelFilter('All');
              setCategoryFilter('All');
              setModeFilter('All');
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((sc) => {
            const scId = sc._id || sc.schemeId;
            const isCompared = comparedSchemes.some((c) => (c._id || c.schemeId) === scId);

            return (
              <SchemeCard
                key={scId}
                scheme={sc}
                matchScore={sc.matchPercentage}
                matchedConditions={sc.matchedConditions || []}
                verificationConditions={sc.verificationConditions || []}
                unmetConditions={sc.unmetConditions || []}
                onCompareToggle={handleCompareToggle}
                isCompared={isCompared}
              />
            );
          })}
        </div>
      )}

      {/* Floating Comparison Action Drawer */}
      {comparedSchemes.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold">{comparedSchemes.length} Schemes Selected for Comparison</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenCompare}
              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
            >
              Compare Side-by-Side
            </button>
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
