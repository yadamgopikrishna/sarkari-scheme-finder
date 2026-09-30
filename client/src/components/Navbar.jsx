import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';
import {
  Menu,
  X,
  Shield,
  Bookmark,
  CheckCircle2,
  Grid,
  User,
  LogOut,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, requireAuth } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Tricolor Accent Header Strip */}
      <div className="tricolor-strip w-full" />

      {/* Top Banner with Gov of India / Digital India Motif */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Official Citizen Welfare & Government Schemes Portal | भारत सरकार</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/schemes" className="hover:text-white transition-colors hidden sm:inline">
            Central & State Schemes
          </Link>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <a
            href="https://www.india.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            National Portal (india.gov.in)
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-white to-emerald-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-sarkari-navy rounded-[7px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                  Sarkari Scheme <span className="text-orange-600">Finder</span>
                </span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded font-mono uppercase tracking-wider">
                  Citizen
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight line-clamp-1">
                {t('portalSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                isActive('/') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('navHome')}
            </Link>
            <Link
              to="/schemes"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                isActive('/schemes') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {t('navSchemes')}
            </Link>
            <Link
              to="/check-eligibility"
              onClick={(e) => {
                if (!requireAuth('7-Step Eligibility Wizard')) {
                  e.preventDefault();
                }
              }}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('navCheckEligibility')}
            </Link>
            <Link
              to="/compare"
              onClick={(e) => {
                if (!requireAuth('Scheme Comparison Tool')) {
                  e.preventDefault();
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                isActive('/compare') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {t('navCompare')}
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/saved-schemes"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${
                    isActive('/saved-schemes') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {t('navSaved')}
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive('/dashboard') ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t('navDashboard')}
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-1"
              >
                <Shield className="w-3 h-3 text-purple-600" />
                {t('navAdmin')}
              </Link>
            )}
          </nav>

          {/* Right Action Controls: Language, Notifications, Auth */}
          <div className="hidden sm:flex items-center gap-2">
            <LanguageSelector />
            <NotificationDropdown />

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="My Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.fullName?.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title={t('navLogout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSelector />
            <NotificationDropdown />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
          >
            {t('navHome')}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
          >
            {t('navSchemes')}
          </Link>
          <Link
            to="/check-eligibility"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (!requireAuth('7-Step Eligibility Wizard')) {
                e.preventDefault();
              }
            }}
            className="block px-3 py-2 text-sm font-bold rounded-md bg-orange-50 text-orange-600 hover:bg-orange-100"
          >
            {t('navCheckEligibility')}
          </Link>
          <Link
            to="/compare"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (!requireAuth('Scheme Comparison Tool')) {
                e.preventDefault();
              }
            }}
            className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
          >
            {t('navCompare')}
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/saved-schemes"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
              >
                {t('navSaved')}
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
              >
                {t('navDashboard')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold rounded-md text-slate-800 hover:bg-slate-100"
              >
                {t('navProfile')}
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-bold text-purple-700 bg-purple-50 rounded-md"
            >
              {t('navAdmin')}
            </Link>
          )}
          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> {t('navLogout')}
              </button>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg border border-slate-300"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-bold text-white bg-orange-600 rounded-lg"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
