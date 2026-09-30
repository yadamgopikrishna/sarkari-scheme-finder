import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  Compass,
  ArrowRight,
  Tractor,
  GraduationCap,
  HeartPulse,
  Home,
  Clock,
  Users,
  Briefcase,
  Store,
  Accessibility,
  ShieldCheck,
  Search,
  Sparkles,
  Award,
  Globe2,
  FileText,
  Building,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import SchemeCard from '../components/SchemeCard';
import api from '../services/api';

export default function HomePage() {
  const { t } = useLanguage();
  const { requireAuth } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSchemes: 23,
    centralSchemes: 14,
    stateSchemes: 9,
    activeSchemes: 23,
  });
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [schemesRes, catRes] = await Promise.all([
          api.get('/schemes/featured'),
          api.get('/categories'),
        ]);

        if (schemesRes.data.success) {
          setFeaturedSchemes(schemesRes.data.data);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }

        // Also fetch live scheme counts
        const allSchemesRes = await api.get('/schemes?limit=1');
        if (allSchemesRes.data.success) {
          setStats((prev) => ({ ...prev, totalSchemes: allSchemesRes.data.total }));
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'agriculture':
        return <Tractor className="w-5 h-5 text-emerald-600" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case 'healthcare':
        return <HeartPulse className="w-5 h-5 text-red-600" />;
      case 'housing':
        return <Home className="w-5 h-5 text-amber-600" />;
      case 'pension':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'women-child':
        return <Users className="w-5 h-5 text-pink-600" />;
      case 'employment-skills':
        return <Briefcase className="w-5 h-5 text-indigo-600" />;
      case 'msme-business':
        return <Store className="w-5 h-5 text-teal-600" />;
      case 'disability':
        return <Accessibility className="w-5 h-5 text-cyan-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-sarkari-navy to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          {/* Official Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Digital Citizen Welfare Portal of India | 28 States & 8 UTs</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-300 font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex items-center gap-2 border border-slate-200"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 px-2 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm shrink-0"
            >
              Search
            </button>
          </form>

          {/* Call-to-action Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/check-eligibility"
              onClick={(e) => {
                if (!requireAuth('7-Step Eligibility Wizard')) {
                  e.preventDefault();
                }
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{t('btnCheckMyEligibility')}</span>
            </Link>
            <Link
              to="/schemes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Compass className="w-5 h-5" />
              <span>{t('btnBrowseSchemes')}</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">23+</span>
              <span className="text-xs text-slate-400">{t('statTotalSchemes')}</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-400 block">14</span>
              <span className="text-xs text-slate-400">{t('statCentral')}</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 block">9</span>
              <span className="text-xs text-slate-400">{t('statState')}</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 block">36</span>
              <span className="text-xs text-slate-400">States & UTs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg">
              🔎
            </div>
            <span className="font-bold text-xs text-slate-800">Check Eligibility</span>
            <p className="text-[11px] text-slate-500">7-step questionnaire with dynamic rules</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              🏛
            </div>
            <span className="font-bold text-xs text-slate-800">Central & State</span>
            <p className="text-[11px] text-slate-500">All Indian States and Union Territories</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              🌐
            </div>
            <span className="font-bold text-xs text-slate-800">8 Indian Languages</span>
            <p className="text-[11px] text-slate-500">Telugu, Hindi, Tamil, Kannada, etc.</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
              🤖
            </div>
            <span className="font-bold text-xs text-slate-800">AI Scheme Assistant</span>
            <p className="text-[11px] text-slate-500">Grounded scheme advisor chatbot</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              📋
            </div>
            <span className="font-bold text-xs text-slate-800">Required Documents</span>
            <p className="text-[11px] text-slate-500">Official checklist for every scheme</p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
              🔗
            </div>
            <span className="font-bold text-xs text-slate-800">Official Apply Links</span>
            <p className="text-[11px] text-slate-500">Verified links to government portals</p>
          </div>
        </div>
      </section>

      {/* Scheme Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('categoriesTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Browse targeted welfare schemes curated across primary socio-economic categories.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/schemes?category=${encodeURIComponent(cat.name)}`}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all text-center group flex flex-col items-center justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors mb-2">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {cat.schemeCount || 2} Schemes
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works (4-Step Flow) */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Four simple steps from questionnaire to verified government application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('step1Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('step2Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('step3Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900">{t('step4Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Government Schemes</h2>
            <p className="text-xs text-slate-500">Popular central and state programs with verified guidelines</p>
          </div>
          <Link
            to="/schemes"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSchemes.map((sc) => (
            <SchemeCard key={sc._id} scheme={sc} />
          ))}
        </div>
      </section>

      {/* Call to action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-sarkari-navy to-slate-900 rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-xs font-bold font-mono uppercase">
              Free Citizen Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Discover Every Scheme You Qualify For in Under 3 Minutes
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No Aadhaar or sensitive documents required to check eligibility. Simply provide demographic and occupational details to get instant recommendations.
            </p>
          </div>
          <Link
            to="/check-eligibility"
            onClick={(e) => {
              if (!requireAuth('7-Step Eligibility Wizard')) {
                e.preventDefault();
              }
            }}
            className="px-8 py-3.5 rounded-xl font-extrabold text-sm text-slate-900 bg-white hover:bg-orange-50 transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Check My Eligibility Now</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </Link>
        </div>
      </section>
    </div>
  );
}
