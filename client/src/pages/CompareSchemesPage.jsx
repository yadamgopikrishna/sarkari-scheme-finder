import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Layers, X, ExternalLink, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import api from '../services/api';

export default function CompareSchemesPage() {
  const location = useLocation();
  const [selectedSchemes, setSelectedSchemes] = useState(
    location.state?.selectedSchemes || []
  );
  const [allSchemes, setAllSchemes] = useState([]);
  const [addingSchemeId, setAddingSchemeId] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await api.get('/schemes?limit=50');
        if (res.data.success) {
          setAllSchemes(res.data.data);
          // If none provided initially, select 2 featured schemes by default
          if (selectedSchemes.length === 0 && res.data.data.length >= 2) {
            setSelectedSchemes([res.data.data[0], res.data.data[1]]);
          }
        }
      } catch (err) {
        console.error('Failed to load schemes for comparison:', err.message);
      }
    };
    fetchAll();
  }, []);

  const handleRemoveScheme = (id) => {
    setSelectedSchemes((prev) => prev.filter((s) => (s._id || s.schemeId) !== id));
  };

  const handleAddScheme = () => {
    if (!addingSchemeId) return;
    const found = allSchemes.find((s) => s._id === addingSchemeId);
    if (found && !selectedSchemes.some((s) => (s._id || s.schemeId) === found._id)) {
      if (selectedSchemes.length >= 4) {
        alert('You can compare up to 4 schemes at a time.');
        return;
      }
      setSelectedSchemes((prev) => [...prev, found]);
      setAddingSchemeId('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Scheme Comparative Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Compare Government Schemes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Evaluate benefits, eligibility rules, and documentation across up to 4 Central and State schemes side-by-side.
          </p>
        </div>

        {/* Add Scheme Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={addingSchemeId}
            onChange={(e) => setAddingSchemeId(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">+ Add scheme to comparison</option>
            {allSchemes
              .filter((s) => !selectedSchemes.some((sel) => (sel._id || sel.schemeId) === s._id))
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.schemeName}
                </option>
              ))}
          </select>
          <button
            onClick={handleAddScheme}
            disabled={!addingSchemeId}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {selectedSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <Layers className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No schemes selected for comparison</h3>
          <p className="text-xs text-slate-500">
            Select schemes from the dropdown above or click "Compare" on any scheme card.
          </p>
          <Link
            to="/schemes"
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold"
          >
            Browse All Schemes
          </Link>
        </div>
      ) : (
        /* Comparison Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white border-b border-slate-800">
                  <th className="p-4 w-48 font-extrabold uppercase tracking-wider text-[11px] text-slate-400">
                    Scheme Parameter
                  </th>
                  {selectedSchemes.map((sc) => {
                    const id = sc._id || sc.schemeId;
                    return (
                      <th key={id} className="p-4 min-w-[240px] align-top">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-sm text-white line-clamp-2">
                            {sc.schemeName}
                          </span>
                          <button
                            onClick={() => handleRemoveScheme(id)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-orange-400">
                          {sc.governmentLevel} Govt
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Category */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Category</td>
                  {selectedSchemes.map((sc) => (
                    <td key={sc._id || sc.schemeId} className="p-4 font-semibold text-slate-800">
                      {sc.category}
                    </td>
                  ))}
                </tr>

                {/* Assistance / Benefit */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Assistance / Benefit</td>
                  {selectedSchemes.map((sc) => (
                    <td key={sc._id || sc.schemeId} className="p-4 text-emerald-800 font-extrabold">
                      {sc.benefitAmount || (sc.benefits ? sc.benefits[0] : 'Direct welfare support')}
                    </td>
                  ))}
                </tr>

                {/* Age Criteria */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Age Requirement</td>
                  {selectedSchemes.map((sc) => {
                    const elig = sc.eligibilityCriteria || {};
                    const min = elig.age?.min ?? 0;
                    const max = elig.age?.max ?? 120;
                    return (
                      <td key={sc._id || sc.schemeId} className="p-4 text-slate-700">
                        {min > 0 || max < 120 ? `${min} to ${max} Years` : 'No specific age limit'}
                      </td>
                    );
                  })}
                </tr>

                {/* Income Criteria */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Annual Income Ceiling</td>
                  {selectedSchemes.map((sc) => {
                    const elig = sc.eligibilityCriteria || {};
                    const maxInc = elig.income?.max ?? 0;
                    return (
                      <td key={sc._id || sc.schemeId} className="p-4 text-slate-700">
                        {maxInc > 0 ? `Up to ₹${maxInc.toLocaleString('en-IN')}` : 'No income ceiling'}
                      </td>
                    );
                  })}
                </tr>

                {/* State Jurisdiction */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Applicable Jurisdiction</td>
                  {selectedSchemes.map((sc) => (
                    <td key={sc._id || sc.schemeId} className="p-4 text-slate-700 font-medium">
                      {sc.state === 'All' ? 'All Indian States & UTs' : sc.state}
                    </td>
                  ))}
                </tr>

                {/* Target Occupation */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Target Occupation</td>
                  {selectedSchemes.map((sc) => {
                    const occs = sc.eligibilityCriteria?.occupations || ['All'];
                    return (
                      <td key={sc._id || sc.schemeId} className="p-4 text-slate-700">
                        {occs.join(', ')}
                      </td>
                    );
                  })}
                </tr>

                {/* Required Documents */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Required Documents</td>
                  {selectedSchemes.map((sc) => (
                    <td key={sc._id || sc.schemeId} className="p-4 text-slate-600">
                      <ul className="space-y-1 list-disc list-inside">
                        {(sc.requiredDocuments || []).slice(0, 4).map((d, i) => (
                          <li key={i} className="line-clamp-1">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                {/* Application Mode */}
                <tr className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-700 bg-slate-50/70">Application Mode</td>
                  {selectedSchemes.map((sc) => (
                    <td key={sc._id || sc.schemeId} className="p-4 font-semibold text-slate-800">
                      {sc.applicationMode || 'Online'}
                    </td>
                  ))}
                </tr>

                {/* Action Links */}
                <tr className="bg-slate-50">
                  <td className="p-4 font-bold text-slate-700">Official Links</td>
                  {selectedSchemes.map((sc) => {
                    const id = sc._id || sc.schemeId;
                    return (
                      <td key={id} className="p-4 space-y-2">
                        <Link
                          to={`/schemes/${id}`}
                          className="block text-center py-1.5 px-3 rounded-lg bg-sarkari-navy hover:bg-slate-800 text-white font-bold"
                        >
                          View Full Details
                        </Link>
                        {sc.applicationLink && (
                          <a
                            href={sc.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center gap-1"
                          >
                            <span>Apply on Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
