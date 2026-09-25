import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="space-y-4 max-w-md">
        <Compass className="w-16 h-16 text-orange-500 mx-auto animate-spin" />
        <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-base font-bold text-slate-700">Page Not Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          The government scheme or portal page you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sarkari-navy text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
