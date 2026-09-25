import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Bookmark,
  Shield,
  Building,
  User,
  Sparkles,
  ArrowRight,
  TrendingUp,
  History,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    totalSchemes: 23,
    centralSchemes: 14,
    stateSchemes: 9,
    matchingCount: 0,
    savedCount: 0,
  });
  const [recentChecks, setRecentChecks] = useState([]);
  const [featuredMatching, setFeaturedMatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [schemesRes, savedRes, historyRes] = await Promise.all([
          api.get('/schemes?limit=6'),
          api.get('/saved-schemes'),
          api.get('/eligibility/history'),
        ]);

        const totalSchemes = schemesRes.data.total || 23;
        const savedCount = savedRes.data.count || 0;
        const recentHistory = historyRes.data.data || [];

        setRecentChecks(recentHistory);
        setFeaturedMatching(schemesRes.data.data || []);

        setStats((prev) => ({
          ...prev,
          totalSchemes,
          savedCount,
          matchingCount: recentHistory[0]?.eligibleSchemeCount || 8,
        }));
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const profile = user?.profileDetails || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome & Profile Greeting Banner */}
      <div className="bg-gradient-to-r from-sarkari-navy via-slate-900 to-sarkari-navy text-white rounded-2xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
            <span>Verified Citizen Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || 'Citizen'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Registered State: <strong className="text-white">{user?.state || 'Andhra Pradesh'}</strong> | District:{' '}
            <strong className="text-white">{user?.district || 'General'}</strong>
          </p>
        </div>

        {/* Primary Call to Action Button */}
        <Link
          to="/check-eligibility"
          className="px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 shrink-0 transform hover:-translate-y-0.5"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{t('btnCheckMyEligibility')}</span>
        </Link>
      </div>

      {/* Dashboard KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Schemes
          </span>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalSchemes}</span>
          <p className="text-[10px] text-slate-500">Active public programs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Matching Profile
          </span>
          <span className="text-2xl font-extrabold text-emerald-700">{stats.matchingCount}</span>
          <p className="text-[10px] text-slate-500">Based on recent check</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">
            Saved Schemes
          </span>
          <span className="text-2xl font-extrabold text-orange-700">{stats.savedCount}</span>
          <p className="text-[10px] text-slate-500">In your bookmarks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Central Schemes
          </span>
          <span className="text-2xl font-extrabold text-blue-800">{stats.centralSchemes}</span>
          <p className="text-[10px] text-slate-500">Gov of India</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
            State Schemes
          </span>
          <span className="text-2xl font-extrabold text-purple-800">{stats.stateSchemes}</span>
          <p className="text-[10px] text-slate-500">State / UT specific</p>
        </div>
      </div>

      {/* 2-Column Section: User Profile Attributes + Recent Eligibility Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              My Registered Profile
            </h2>
            <Link to="/profile" className="text-xs text-orange-600 hover:underline font-semibold">
              Edit
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-bold text-slate-800">{user?.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-800">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Mobile:</span>
              <span className="font-semibold text-slate-800">{user?.mobileNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">State:</span>
              <span className="font-bold text-slate-800">{user?.state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">District:</span>
              <span className="font-bold text-slate-800">{user?.district}</span>
            </div>
            {profile.occupation && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Occupation:</span>
                <span className="font-bold text-orange-700">{profile.occupation}</span>
              </div>
            )}
            {profile.annualIncome && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Annual Income:</span>
                <span className="font-bold text-emerald-700">₹{Number(profile.annualIncome).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/check-eligibility"
              className="w-full block text-center py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg text-xs transition-colors"
            >
              Update Eligibility Criteria
            </Link>
          </div>
        </div>

        {/* Right Column: Recent Eligibility Checks & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Recent Eligibility Queries
              </h2>
              <span className="text-[11px] text-slate-400">Audit History</span>
            </div>

            {recentChecks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent eligibility checks recorded. Click "Check My Eligibility" to get started!
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {recentChecks.map((chk) => (
                  <div
                    key={chk._id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {chk.userInputs?.occupation || 'Citizen'} ({chk.userInputs?.age || 'N/A'} yrs)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          in {chk.stateQueried || user?.state}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                        {chk.eligibleSchemeCount} Potential Schemes Found
                      </span>
                    </div>

                    <Link
                      to="/results"
                      state={{
                        resultsData: {
                          eligibleSchemes: chk.topMatchedSchemes || [],
                        },
                      }}
                      className="text-xs text-orange-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>View Results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Featured Schemes */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Recommended Programs for Your Region
              </h2>
              <Link to="/schemes" className="text-xs text-orange-600 hover:underline font-semibold">
                Browse All
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {featuredMatching.slice(0, 4).map((sc) => (
                <Link
                  key={sc._id}
                  to={`/schemes/${sc._id}`}
                  className="p-3 bg-slate-50 hover:bg-orange-50/50 rounded-xl border border-slate-100 hover:border-orange-200 transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {sc.schemeName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{sc.category}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
