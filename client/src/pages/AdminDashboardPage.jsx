import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Search,
  Check,
  Calendar,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('schemes'); // 'schemes', 'users', 'analytics'
  const [analytics, setAnalytics] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Add / Edit Scheme Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [formData, setFormData] = useState(getBlankScheme());
  const [savingScheme, setSavingScheme] = useState(false);

  function getBlankScheme() {
    return {
      schemeName: '',
      schemeCode: '',
      category: 'Agriculture',
      governmentLevel: 'Central',
      state: 'All',
      department: '',
      benefitAmount: '',
      description: '',
      benefits: '',
      ineligibilityCriteria: '',
      requiredDocuments: '',
      applicationProcess: '',
      applicationMode: 'Online',
      officialWebsite: '',
      applicationLink: '',
      helplineNumber: '',
      eligibilityCriteria: {
        age: { min: 18, max: 70 },
        income: { max: 250000 },
        genders: ['All'],
        occupations: ['All'],
        states: ['All'],
      },
    };
  }

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, schemesRes, usersRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/schemes?limit=100&status=All'),
        api.get('/admin/users'),
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (schemesRes.data.success) setSchemes(schemesRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingScheme(null);
    setFormData(getBlankScheme());
    setModalOpen(true);
  };

  const handleOpenEdit = (scheme) => {
    setEditingScheme(scheme);
    setFormData({
      ...scheme,
      benefits: Array.isArray(scheme.benefits) ? scheme.benefits.join('\n') : scheme.benefits,
      requiredDocuments: Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.join('\n') : scheme.requiredDocuments,
      ineligibilityCriteria: Array.isArray(scheme.ineligibilityCriteria) ? scheme.ineligibilityCriteria.join('\n') : scheme.ineligibilityCriteria,
      applicationProcess: Array.isArray(scheme.applicationProcess) ? scheme.applicationProcess.join('\n') : scheme.applicationProcess,
    });
    setModalOpen(true);
  };

  const handleVerifyStamp = async (schemeId) => {
    try {
      await api.put(`/admin/schemes/${schemeId}`, { setVerified: true });
      loadData();
    } catch (err) {
      alert('Failed to update verification timestamp.');
    }
  };

  const handleToggleActive = async (scheme) => {
    try {
      const newStatus = scheme.status === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/admin/schemes/${scheme._id}`, { status: newStatus });
      loadData();
    } catch (err) {
      alert('Failed to update scheme status.');
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this scheme?')) return;
    try {
      await api.delete(`/admin/schemes/${schemeId}?permanent=true`);
      loadData();
    } catch (err) {
      alert('Failed to delete scheme.');
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setSavingScheme(true);

    try {
      const payload = {
        ...formData,
        benefits: typeof formData.benefits === 'string' ? formData.benefits.split('\n').filter(Boolean) : formData.benefits,
        requiredDocuments: typeof formData.requiredDocuments === 'string' ? formData.requiredDocuments.split('\n').filter(Boolean) : formData.requiredDocuments,
        ineligibilityCriteria: typeof formData.ineligibilityCriteria === 'string' ? formData.ineligibilityCriteria.split('\n').filter(Boolean) : formData.ineligibilityCriteria,
        applicationProcess: typeof formData.applicationProcess === 'string' ? formData.applicationProcess.split('\n').filter(Boolean) : formData.applicationProcess,
      };

      if (editingScheme) {
        await api.put(`/admin/schemes/${editingScheme._id}`, payload);
      } else {
        await api.post('/admin/schemes', payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save scheme.');
    } finally {
      setSavingScheme(false);
    }
  };

  const filteredSchemes = schemes.filter(
    (s) =>
      s.schemeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.schemeCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.state && s.state.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Central Portal Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Sarkari Scheme Finder — Admin Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage scheme catalog, structured rules, official verification timestamps, and citizen accounts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Scheme</span>
        </button>
      </div>

      {/* Analytics KPI Ribbon */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Schemes</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{analytics.totalSchemes}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-500 uppercase">Central Gov</span>
            <span className="text-2xl font-extrabold text-blue-700 block">{analytics.centralSchemes}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-500 uppercase">State Gov</span>
            <span className="text-2xl font-extrabold text-emerald-700 block">{analytics.stateSchemes}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Active Status</span>
            <span className="text-2xl font-extrabold text-emerald-700 block">{analytics.activeSchemes}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-500 uppercase">Registered Citizens</span>
            <span className="text-2xl font-extrabold text-purple-700 block">{analytics.totalCitizens}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-orange-500 uppercase">Eligibility Checks</span>
            <span className="text-2xl font-extrabold text-orange-700 block">{analytics.totalEligibilityChecks}</span>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'schemes'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Scheme Catalog ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Citizen Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Portal Analytics
        </button>
      </div>

      {/* TAB 1: SCHEME MANAGEMENT */}
      {activeTab === 'schemes' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search schemes by name, code or state..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="p-3">Scheme Name & Code</th>
                  <th className="p-3">Level & State</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Verified</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSchemes.map((sc) => (
                  <tr key={sc._id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block line-clamp-1">{sc.schemeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sc.schemeCode}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-slate-700 block">{sc.governmentLevel}</span>
                      <span className="text-[10px] text-slate-500">{sc.state}</span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{sc.category}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(sc)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sc.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sc.status}
                      </button>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(sc.lastVerified || sc.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleVerifyStamp(sc._id)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px]"
                        title="Update verification date to today"
                      >
                        Verify Today
                      </button>
                      <button
                        onClick={() => handleOpenEdit(sc)}
                        className="p-1 text-slate-500 hover:text-orange-600 rounded"
                        title="Edit Scheme"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteScheme(sc._id)}
                        className="p-1 text-slate-500 hover:text-red-600 rounded"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN ACCOUNTS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="p-3">Citizen Name</th>
                  <th className="p-3">Email & Mobile</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{u.fullName}</td>
                    <td className="p-3 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-400">{u.mobileNumber}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      {u.state}, {u.district}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 font-mono">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u._id)}
                          className="px-2 py-1 text-[11px] font-bold rounded border border-slate-300 hover:bg-slate-100"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PORTAL ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Schemes by Category
            </h3>
            <div className="space-y-2">
              {analytics.categoryDistribution?.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{cat.category}</span>
                  <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {cat.count} schemes
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Queried States in Eligibility Checks */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Top Queried States by Citizens
            </h3>
            <div className="space-y-2">
              {analytics.topQueriedStates?.map((st) => (
                <div key={st.state} className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{st.state}</span>
                  <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {st.count} queries
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT SCHEME MODAL WITH STRUCTURED RULE BUILDER */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingScheme ? 'Edit Scheme & Update Eligibility Rules' : 'Add New Government Scheme'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.schemeName}
                    onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Scheme Code (Unique) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingScheme}
                    value={formData.schemeCode}
                    onChange={(e) => setFormData({ ...formData, schemeCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Agriculture">Agriculture</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Housing">Housing</option>
                    <option value="Pension">Pension</option>
                    <option value="Women & Child Welfare">Women & Child Welfare</option>
                    <option value="Employment & Skill Development">Employment & Skill Development</option>
                    <option value="MSME & Entrepreneurship">MSME & Entrepreneurship</option>
                    <option value="Disability Welfare">Disability Welfare</option>
                    <option value="Social Security">Social Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Government Level *</label>
                  <select
                    value={formData.governmentLevel}
                    onChange={(e) => setFormData({ ...formData, governmentLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Central">Central</option>
                    <option value="State">State</option>
                    <option value="UT">Union Territory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="All or specific state like Andhra Pradesh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Structured Rules Group */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-800 block text-xs">Structured Eligibility Criteria:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={formData.eligibilityCriteria?.age?.min || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eligibilityCriteria: {
                            ...formData.eligibilityCriteria,
                            age: { ...formData.eligibilityCriteria.age, min: parseInt(e.target.value, 10) },
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Max Age</label>
                    <input
                      type="number"
                      value={formData.eligibilityCriteria?.age?.max || 100}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eligibilityCriteria: {
                            ...formData.eligibilityCriteria,
                            age: { ...formData.eligibilityCriteria.age, max: parseInt(e.target.value, 10) },
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Max Income (₹)</label>
                    <input
                      type="number"
                      value={formData.eligibilityCriteria?.income?.max || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          eligibilityCriteria: {
                            ...formData.eligibilityCriteria,
                            income: { max: parseInt(e.target.value, 10) },
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Assistance Amount</label>
                    <input
                      type="text"
                      value={formData.benefitAmount}
                      onChange={(e) => setFormData({ ...formData, benefitAmount: e.target.value })}
                      placeholder="e.g. ₹6,000 / Year"
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Key Benefits (one per line)</label>
                  <textarea
                    rows="3"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required Documents (one per line)</label>
                  <textarea
                    rows="3"
                    value={formData.requiredDocuments}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Application Link *</label>
                  <input
                    type="url"
                    required
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Helpline Number</label>
                  <input
                    type="text"
                    value={formData.helplineNumber}
                    onChange={(e) => setFormData({ ...formData, helplineNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingScheme}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold"
                >
                  {savingScheme ? 'Saving...' : 'Save Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
