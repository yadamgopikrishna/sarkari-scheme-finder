import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function SchemeCard({
  scheme,
  matchScore,
  matchedConditions = [],
  verificationConditions = [],
  unmetConditions = [],
  isSavedInitial = false,
  onCompareToggle,
  isCompared = false,
}) {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const schemeId = scheme._id || scheme.schemeId;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in or register to bookmark schemes to your profile.');
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        await api.delete(`/saved-schemes/${schemeId}`);
        setIsSaved(false);
      } else {
        await api.post('/saved-schemes', {
          schemeId,
          matchPercentage: matchScore || scheme.matchPercentage || 0,
        });
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update saved scheme.');
    } finally {
      setSaving(false);
    }
  };

  // Color styling based on match percentage
  const score = matchScore !== undefined ? matchScore : scheme.matchPercentage;
  const getScoreBadge = () => {
    if (score === undefined || score === null) return null;
    if (score >= 80) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{score}% Match</span>
        </div>
      );
    }
    if (score >= 60) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold border border-blue-300">
          <span>{score}% Match</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-300">
        <span>{score}% Match</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                scheme.governmentLevel === 'Central'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {scheme.governmentLevel === 'Central' ? 'Central Scheme' : `${scheme.state || 'State'} Scheme`}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
              {scheme.category}
            </span>
          </div>
          {getScoreBadge()}
        </div>

        {/* Scheme Name */}
        <Link to={`/schemes/${schemeId}`}>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug mb-1">
            {scheme.schemeName}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 font-medium mb-3 line-clamp-1">
          {scheme.department}
        </p>

        {/* Benefits Highlight */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-3 text-xs">
          <span className="font-bold text-slate-700 block mb-1">Key Benefit:</span>
          <p className="text-slate-600 line-clamp-2 leading-relaxed">
            {Array.isArray(scheme.benefits) && scheme.benefits.length > 0
              ? scheme.benefits[0]
              : scheme.benefits || 'Financial & institutional support to eligible beneficiaries.'}
          </p>
          {scheme.benefitAmount && (
            <span className="inline-block mt-1 font-extrabold text-emerald-700 text-[11px]">
              Assistance: {scheme.benefitAmount}
            </span>
          )}
        </div>

        {/* Eligibility Conditions Breakdown (if results check passed) */}
        {(matchedConditions.length > 0 || verificationConditions.length > 0) && (
          <div className="space-y-1 text-[11px] mb-3 border-t border-slate-100 pt-2.5">
            {matchedConditions.slice(0, 3).map((cond, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-emerald-700">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                <span className="line-clamp-1">{cond}</span>
              </div>
            ))}
            {verificationConditions.slice(0, 2).map((v, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                <span className="line-clamp-1">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {onCompareToggle && (
            <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isCompared}
                onChange={() => onCompareToggle(scheme)}
                className="w-3.5 h-3.5 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
              />
              <span className="hidden sm:inline">Compare</span>
            </label>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`p-1.5 rounded-md border text-xs font-semibold flex items-center gap-1 transition-colors ${
              isSaved
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save scheme'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`} />
            <span className="text-[11px]">{isSaved ? t('btnSaved') : t('btnSaveScheme')}</span>
          </button>
        </div>

        <Link
          to={`/schemes/${schemeId}`}
          className="px-3 py-1.5 text-xs font-bold text-white bg-sarkari-navy hover:bg-slate-800 rounded-lg flex items-center gap-1 transition-all shadow-sm"
        >
          <span>{t('btnViewDetails')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
