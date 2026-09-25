import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink, ChevronRight, Layers, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function SavedSchemesPage() {
  const { t } = useLanguage();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/saved-schemes');
      if (res.data.success) {
        setSavedList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load saved schemes:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (schemeId) => {
    try {
      await api.delete(`/saved-schemes/${schemeId}`);
      setSavedList((prev) => prev.filter((item) => item.schemeId?._id !== schemeId && item._id !== schemeId));
    } catch (err) {
      alert('Failed to remove scheme from bookmarks.');
    }
  };

  const handleToggleCompare = (scheme) => {
    const id = scheme._id;
    setSelectedForCompare((prev) => {
      const exists = prev.some((s) => s._id === id);
      if (exists) return prev.filter((s) => s._id !== id);
      if (prev.length >= 4) {
        alert('You can compare up to 4 schemes at a time.');
        return prev;
      }
      return [...prev, scheme];
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
            <span>Citizen Bookmarks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Saved Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Keep track of schemes you are interested in and compare them before applying on official portals.
          </p>
        </div>

        {selectedForCompare.length >= 2 && (
          <Link
            to="/compare"
            state={{ selectedSchemes: selectedForCompare }}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
          >
            <Layers className="w-4 h-4" />
            <span>Compare Selected ({selectedForCompare.length})</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading your saved schemes...</div>
      ) : savedList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You have no saved schemes yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Browse our catalog or use the 7-step Eligibility Engine to bookmark schemes you qualify for.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/check-eligibility"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow"
            >
              Check Eligibility
            </Link>
            <Link
              to="/schemes"
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold border border-slate-300"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((item) => {
            const sc = item.schemeId;
            if (!sc) return null;

            const isCompared = selectedForCompare.some((s) => s._id === sc._id);

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sc.governmentLevel === 'Central'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sc.governmentLevel} Govt
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {sc.category}
                    </span>
                  </div>

                  <Link to={`/schemes/${sc._id}`}>
                    <h3 className="font-bold text-slate-900 text-sm hover:text-orange-600 transition-colors line-clamp-2">
                      {sc.schemeName}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-1">{sc.department}</p>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Assistance:</span>
                    <p className="text-emerald-700 font-extrabold line-clamp-1">
                      {sc.benefitAmount || 'Direct financial / welfare benefit'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => handleToggleCompare(sc)}
                      className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />
                    <span>Compare</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(sc._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/schemes/${sc._id}`}
                      className="px-3 py-1.5 rounded-lg bg-sarkari-navy hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
