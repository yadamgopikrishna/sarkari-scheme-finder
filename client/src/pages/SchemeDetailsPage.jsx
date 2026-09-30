import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  PhoneCall,
  Calendar,
  Building,
  Bookmark,
  ArrowLeft,
  Share2,
  Check,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function SchemeDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated, requireAuth } = useAuth();
  const { t } = useLanguage();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/schemes/${id}`);
        if (res.data.success) {
          setScheme(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load scheme details.');
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!requireAuth('Bookmark / Save Scheme')) {
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/saved-schemes/${scheme._id}`);
        setIsSaved(false);
      } else {
        await api.post('/saved-schemes', { schemeId: scheme._id });
        setIsSaved(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update saved status.');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading scheme information and verified criteria...
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Scheme Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested scheme could not be located.'}</p>
        <Link to="/schemes" className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold">
          Back to Schemes Catalog
        </Link>
      </div>
    );
  }

  const elig = scheme.eligibilityCriteria || {};
  const verifiedDate = scheme.lastVerified
    ? new Date(scheme.lastVerified).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent Gazette Verification';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/schemes" className="flex items-center gap-1.5 hover:text-orange-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Schemes</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
          <button
            onClick={handleSaveToggle}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isSaved
                ? 'bg-orange-50 border-orange-300 text-orange-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              scheme.governmentLevel === 'Central'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {scheme.governmentLevel === 'Central' ? 'Central Government Scheme' : `${scheme.state || 'State'} Government`}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {scheme.category}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600">
            Code: {scheme.schemeCode}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
          {scheme.schemeName}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Building className="w-4 h-4 text-slate-400" />
          <span>{scheme.department}</span>
        </div>

        {/* Verification Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Information last verified on: {verifiedDate}</span>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {scheme.benefitAmount && (
              <div className="text-xs">
                <span className="text-slate-500">Sanctioned Assistance: </span>
                <span className="font-extrabold text-emerald-700 text-sm">{scheme.benefitAmount}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={scheme.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Apply on Official Website</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* External Portal Advisory Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official External Redirection Notice:</strong> Clicking "Apply on Official Website" redirects you securely to the official Government of India or State department portal. Sarkari Scheme Finder does not collect fees, credentials, or biometric details.
        </p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Scheme Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {scheme.description}
            </p>
          </div>

          {/* Scheme Benefits */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Key Benefits & Entitlements
            </h2>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
              {Array.isArray(scheme.benefits) ? (
                scheme.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{scheme.benefits}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Structured Eligibility Criteria */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Eligibility Guidelines
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Age Limits:</span>
                <span className="font-bold text-slate-800">
                  {elig.age?.min > 0 || elig.age?.max < 120
                    ? `${elig.age?.min || 0} to ${elig.age?.max || 120} Years`
                    : 'No specific age restrictions'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Annual Family Income Ceiling:</span>
                <span className="font-bold text-slate-800">
                  {elig.income?.max > 0
                    ? `Up to ₹${elig.income.max.toLocaleString('en-IN')} / Year`
                    : 'No strict income ceiling specified'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Eligible Genders:</span>
                <span className="font-bold text-slate-800">
                  {elig.genders?.join(', ') || 'All Genders'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Target Occupations:</span>
                <span className="font-bold text-slate-800">
                  {elig.occupations?.join(', ') || 'All Occupations'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Geographical Jurisdiction:</span>
                <span className="font-bold text-slate-800">
                  {scheme.state === 'All' ? 'All Indian States & UTs' : scheme.state}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Application Mode:</span>
                <span className="font-bold text-slate-800">{scheme.applicationMode}</span>
              </div>
            </div>
          </div>

          {/* Ineligibility Criteria ("Who cannot apply") */}
          {scheme.ineligibilityCriteria && scheme.ineligibilityCriteria.length > 0 && (
            <div className="bg-red-50/60 rounded-xl border border-red-200 p-6 space-y-3">
              <h2 className="text-base font-bold text-red-900 border-b border-red-200 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Who Cannot Apply (Ineligibility Conditions)
              </h2>
              <ul className="space-y-1.5 text-xs text-red-800">
                {scheme.ineligibilityCriteria.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step-by-Step Application Process */}
          {scheme.applicationProcess && scheme.applicationProcess.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Step-by-Step Application Process
              </h2>
              <ol className="space-y-3 text-xs sm:text-sm text-slate-700">
                {scheme.applicationProcess.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar (1 Col) */}
        <div className="space-y-6">
          {/* Required Documents Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-600" />
              Required Documents
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 ? (
                scheme.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{doc}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400">Standard KYC & Residence Documents</li>
              )}
            </ul>
          </div>

          {/* Official Helpline & Support */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              Helpline & Support
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Toll-Free Helpline:</span>
                <span className="font-extrabold text-emerald-700 text-sm">{scheme.helplineNumber || '1800-111-555'}</span>
              </div>
              {scheme.officialWebsite && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Official Portal:</span>
                  <a
                    href={scheme.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all font-medium flex items-center gap-1"
                  >
                    <span>{scheme.officialWebsite}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Check Your Personal Match CTA */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-6 text-white space-y-3 shadow-md">
            <h3 className="font-extrabold text-sm">Not sure if you are eligible?</h3>
            <p className="text-xs text-orange-100 leading-relaxed">
              Use our interactive 7-step engine to check your exact matching score for this scheme.
            </p>
            <Link
              to="/check-eligibility"
              className="inline-block w-full text-center px-4 py-2.5 bg-white text-orange-800 rounded-lg text-xs font-bold shadow hover:bg-orange-50 transition-colors"
            >
              Check My Eligibility
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
