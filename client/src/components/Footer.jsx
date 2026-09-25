import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, ExternalLink, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      {/* Tricolor Ribbon */}
      <div className="tricolor-strip w-full" />

      {/* Advisory & Important Disclaimer */}
      <div className="bg-slate-950/60 border-b border-slate-800/80 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3 text-xs text-slate-400">
          <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Legal Advisory & Portal Disclaimer:</strong> Sarkari Scheme Finder is an educational citizen welfare and eligibility guidance engine. All scheme guidelines, qualification criteria, benefits, and required documents are aggregated from published official Central & State Government portals. Calculations produced by this portal represent potential eligibility and do NOT constitute an official sanction, approval, or guarantee from any government department. Citizens must independently verify the current guidelines and apply directly on the verified official portal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About Portal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-sarkari-navy border border-orange-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-orange-400" />
              </div>
              <span className="font-extrabold text-base text-white">Sarkari Scheme Finder</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A comprehensive Government Scheme Eligibility and Recommendation Portal for Indian citizens across all 28 States and 8 Union Territories.
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Built for Digital India Initiative & Welfare Transparency.
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Quick Navigation</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-orange-400 transition-colors">All Central & State Schemes</Link>
              </li>
              <li>
                <Link to="/check-eligibility" className="hover:text-orange-400 transition-colors font-semibold text-orange-400">Check My Eligibility (7-Step)</Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-orange-400 transition-colors">Compare Schemes</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">Citizen Login</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-orange-400 transition-colors">Admin Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: National Portals Directory */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Official Portals</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <a href="https://www.india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  National Portal of India <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://www.mygov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  MyGov India <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://dbtbharat.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  DBT Bharat Portal <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://pmkisan.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  PM-KISAN Portal <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a href="https://nha.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  National Health Authority <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Key National Helplines */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              National Helplines
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Kisan Call Centre (Farmers):</span>
                <span className="font-bold text-emerald-400">1800-180-1551 / 155261</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Ayushman Bharat (Health):</span>
                <span className="font-bold text-emerald-400">14555 / 1800-111-565</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">AP GSWS Spandana (Andhra Pradesh):</span>
                <span className="font-bold text-emerald-400">1902</span>
              </div>
              <div className="bg-slate-800/60 p-2 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">National Emergency Number:</span>
                <span className="font-bold text-orange-400">112</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Verification Stamp */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Sarkari Scheme Finder. All rights reserved. MERN Stack Citizen Portal.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>No Aadhaar data stored</span>
            <span>•</span>
            <span>256-bit SSL Standard</span>
            <span>•</span>
            <span>Open Verified Rules</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
