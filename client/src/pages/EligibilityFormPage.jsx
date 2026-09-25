import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  IndianRupee,
  GraduationCap,
  Briefcase,
  Award,
  Tractor,
  Home,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function EligibilityFormPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [statesList, setStatesList] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form State initialized with defaults or saved user profile details
  const [formData, setFormData] = useState({
    // Step 1: Basic
    age: user?.profileDetails?.age || 35,
    gender: user?.profileDetails?.gender || 'Male',
    maritalStatus: user?.profileDetails?.maritalStatus || 'Married',
    state: user?.state || 'Andhra Pradesh',
    district: user?.district || '',
    ruralUrban: user?.profileDetails?.ruralUrban || 'Rural',

    // Step 2: Economic
    annualIncome: user?.profileDetails?.annualIncome || 120000,
    bplStatus: user?.profileDetails?.bplStatus || 'No',
    rationCardCategory: user?.profileDetails?.rationCardCategory || 'White',
    employmentStatus: user?.profileDetails?.employmentStatus || 'Employed',

    // Step 3: Education
    studentStatus: user?.profileDetails?.studentStatus || 'No',
    educationLevel: user?.profileDetails?.educationLevel || '12th Pass',
    course: user?.profileDetails?.course || '',
    institutionType: user?.profileDetails?.institutionType || 'Government',

    // Step 4: Occupation
    occupation: user?.profileDetails?.occupation || 'Farmer',

    // Step 5: Special Categories
    hasDisability: user?.profileDetails?.hasDisability || 'No',
    disabilityPercentage: user?.profileDetails?.disabilityPercentage || 40,
    isPregnant: user?.profileDetails?.isPregnant || false,
    specialCategories: user?.profileDetails?.specialCategories || [],

    // Step 6: Agriculture (Conditional if Farmer)
    landOwnership: user?.profileDetails?.landOwnership || 'Own land',
    landSize: user?.profileDetails?.landSize || 2.0,
    cropType: user?.profileDetails?.cropType || 'Food grains (Paddy/Wheat)',
    irrigationType: user?.profileDetails?.irrigationType || 'Borewell',
    farmerCategory: user?.profileDetails?.farmerCategory || 'Small (2.5 - 5 acres)',

    // Step 7: Housing & Family
    ownHouse: user?.profileDetails?.ownHouse || 'No',
    housingCondition: user?.profileDetails?.housingCondition || 'Kutcha',
    familySize: user?.profileDetails?.familySize || 4,
    numberOfChildren: user?.profileDetails?.numberOfChildren || 2,
    electricityAvailability: user?.profileDetails?.electricityAvailability || 'Yes',
    toiletAvailability: user?.profileDetails?.toiletAvailability || 'Yes',
  });

  // Fetch States and Districts list from backend metadata
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/meta/states');
        if (res.data.success) {
          setStatesList(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load states list:', err.message);
      }
    };
    fetchStates();
  }, []);

  // Sync available districts whenever state changes
  useEffect(() => {
    if (formData.state && statesList.length > 0) {
      const selected = statesList.find(
        (s) => s.stateName.toLowerCase() === formData.state.toLowerCase()
      );
      if (selected && selected.districts) {
        setAvailableDistricts(selected.districts);
        if (!selected.districts.includes(formData.district)) {
          setFormData((prev) => ({ ...prev, district: selected.districts[0] || '' }));
        }
      } else {
        setAvailableDistricts([]);
      }
    }
  }, [formData.state, statesList]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSpecialCategoryToggle = (cat) => {
    setFormData((prev) => {
      const exists = prev.specialCategories.includes(cat);
      return {
        ...prev,
        specialCategories: exists
          ? prev.specialCategories.filter((c) => c !== cat)
          : [...prev.specialCategories, cat],
      };
    });
  };

  const isFarmer =
    formData.occupation === 'Farmer' || formData.occupation === 'Agricultural worker';

  const totalSteps = isFarmer ? 7 : 6;

  // Next / Back handlers
  const handleNext = () => {
    if (currentStep === 5 && !isFarmer) {
      // Skip Agriculture step if citizen is not a farmer
      setCurrentStep(7);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (currentStep === 7 && !isFarmer) {
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Map user form fields to engine structure
      const payload = {
        ...formData,
        isFarmer,
        isStudent: formData.studentStatus === 'Yes',
        isBpl: formData.bplStatus === 'Yes',
        isDisability: formData.hasDisability === 'Yes',
      };

      const res = await api.post('/eligibility/check', payload);

      if (res.data.success) {
        // Navigate to results page passing calculations and inputs in state
        navigate('/results', {
          state: {
            resultsData: res.data,
            userInputs: payload,
          },
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to calculate eligibility. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step definitions
  const stepsConfig = [
    { num: 1, label: 'Basic Info', icon: User },
    { num: 2, label: 'Economic', icon: IndianRupee },
    { num: 3, label: 'Education', icon: GraduationCap },
    { num: 4, label: 'Occupation', icon: Briefcase },
    { num: 5, label: 'Special Categories', icon: Award },
    ...(isFarmer ? [{ num: 6, label: 'Agriculture', icon: Tractor }] : []),
    { num: 7, label: 'Housing & Family', icon: Home },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>7-Step Citizen Eligibility Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Check Government Scheme Eligibility
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Please answer the questions below. We compare your profile with verified Central and State scheme databases without storing sensitive identity documents.
        </p>
      </div>

      {/* Step Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
          {stepsConfig.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-orange-600 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{s.label}</span>
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-600" />
                  Step 1 — Basic Information
                </h2>
                <p className="text-xs text-slate-500">Demographic & location details for state-level matching.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Age (in years) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="115"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Marital Status *
                  </label>
                  <select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Single">Single / Unmarried</option>
                    <option value="Married">Married</option>
                    <option value="Widow">Widow / Widower</option>
                    <option value="Divorced">Divorced / Separated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Area of Residence *
                  </label>
                  <select
                    name="ruralUrban"
                    value={formData.ruralUrban}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Rural">Rural (Village / Gram Panchayat)</option>
                    <option value="Urban">Urban (Municipality / Corporation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    State / Union Territory *
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {statesList.map((s) => (
                      <option key={s.code} value={s.stateName}>
                        {s.stateName} ({s.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    District *
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {availableDistricts.length > 0 ? (
                      availableDistricts.map((d, i) => (
                        <option key={i} value={d}>
                          {d}
                        </option>
                      ))
                    ) : (
                      <option value="">General District</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ECONOMIC INFORMATION */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                  Step 2 — Economic Information
                </h2>
                <p className="text-xs text-slate-500">Income and social security eligibility criteria.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Annual Family Income (in ₹) *
                  </label>
                  <input
                    type="number"
                    name="annualIncome"
                    min="0"
                    step="5000"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Combined total earnings of all family members per year.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Below Poverty Line (BPL) Status *
                  </label>
                  <select
                    name="bplStatus"
                    value={formData.bplStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Hold BPL Certificate or Card)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ration Card Category *
                  </label>
                  <select
                    name="rationCardCategory"
                    value={formData.rationCardCategory}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="White">White / Rice Card (Priority Household)</option>
                    <option value="BPL">BPL Card (Yellow / Pink / Green)</option>
                    <option value="AAY">Antyodaya Anna Yojana (AAY - Poorest of Poor)</option>
                    <option value="APL">APL (Above Poverty Line)</option>
                    <option value="None">None / Do not have a ration card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Employment Status *
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Employed">Employed (Private / Informal sector)</option>
                    <option value="Self-employed">Self-employed / Small trader</option>
                    <option value="Daily wage">Daily wage worker / Labourer</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired / Senior Citizen</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EDUCATION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Step 3 — Education & Student Details
                </h2>
                <p className="text-xs text-slate-500">Educational level and scholarship qualification.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Are you currently an active student? *
                  </label>
                  <select
                    name="studentStatus"
                    value={formData.studentStatus}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Enrolled in School / College / ITI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Highest Education Completed / Pursuing *
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="No Formal Education">No Formal Education</option>
                    <option value="Primary School">Primary School (Class 1-5)</option>
                    <option value="8th Pass">8th Pass</option>
                    <option value="10th Pass">10th Pass (SSC / Matric)</option>
                    <option value="12th Pass">12th Pass (Intermediate / HSC)</option>
                    <option value="ITI / Diploma">ITI / Polytechnic Diploma</option>
                    <option value="Graduate">Undergraduate (BA, BSc, BTech, etc.)</option>
                    <option value="Post Graduate">Postgraduate (MA, MSc, MTech, etc.)</option>
                    <option value="Doctorate">Doctorate / Ph.D.</option>
                  </select>
                </div>

                {formData.studentStatus === 'Yes' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Current Course / Stream
                      </label>
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="e.g. B.Sc Agriculture, Diploma, Class 10"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Institution Type
                      </label>
                      <select
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      >
                        <option value="Government">Government Institution</option>
                        <option value="Government Aided">Government Aided Institution</option>
                        <option value="Private Recognized">Private Recognized College</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: OCCUPATION */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Step 4 — Primary Occupation
                </h2>
                <p className="text-xs text-slate-500">Occupation determines sector-specific benefits.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Farmer',
                  'Agricultural worker',
                  'Student',
                  'Daily wage worker',
                  'Self-employed',
                  'Business owner',
                  'Employee',
                  'Homemaker',
                  'Unemployed',
                  'Other',
                ].map((occ) => (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, occupation: occ }))}
                    className={`p-4 rounded-xl border text-left text-xs font-bold transition-all flex flex-col justify-between gap-2 ${
                      formData.occupation === occ
                        ? 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/20 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{occ}</span>
                    {formData.occupation === occ && (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 self-end" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: SPECIAL CATEGORIES */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-pink-600" />
                  Step 5 — Special Categories & Vulnerabilities
                </h2>
                <p className="text-xs text-slate-500">Identify specialized affirmative action welfare schemes.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Person with Benchmark Disability (PwD)? *
                  </label>
                  <select
                    name="hasDisability"
                    value={formData.hasDisability}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes (Hold UDID / Medical Certificate)</option>
                  </select>
                </div>

                {formData.hasDisability === 'Yes' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Disability Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="disabilityPercentage"
                      min="40"
                      max="100"
                      value={formData.disabilityPercentage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select all other applicable categories:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    'Widow',
                    'Orphan',
                    'Pregnant woman',
                    'Single parent',
                    'Senior citizen',
                    'Veteran / Ex-serviceman',
                    'Street vendor',
                    'Artisan/Craftsperson',
                  ].map((cat) => (
                    <label
                      key={cat}
                      className={`p-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                        formData.specialCategories.includes(cat)
                          ? 'border-orange-500 bg-orange-50 text-orange-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialCategories.includes(cat)}
                        onChange={() => handleSpecialCategoryToggle(cat)}
                        className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: AGRICULTURE INFORMATION (Conditional) */}
          {currentStep === 6 && isFarmer && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Tractor className="w-4 h-4 text-emerald-600" />
                  Step 6 — Agriculture & Land Details
                </h2>
                <p className="text-xs text-slate-500">Evaluates PM-KISAN, state farmer aids & Rythu Bharosa.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Land Ownership Status *
                  </label>
                  <select
                    name="landOwnership"
                    value={formData.landOwnership}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Own land">Pattadar / Own Landholding</option>
                    <option value="Tenant farmer">Tenant Farmer (CCRC card)</option>
                    <option value="Leased land">Leased Agricultural Land</option>
                    <option value="Landless">Landless Agricultural Labourer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Total Cultivable Land Size (in Acres) *
                  </label>
                  <input
                    type="number"
                    name="landSize"
                    min="0"
                    step="0.5"
                    value={formData.landSize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    e.g. 2.5 acres (1 Hectare = 2.47 Acres)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Primary Crop Type
                  </label>
                  <select
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Food grains (Paddy/Wheat)">Food grains (Paddy / Wheat / Millets)</option>
                    <option value="Pulses">Pulses & Legumes</option>
                    <option value="Oilseeds">Oilseeds (Groundnut / Mustard)</option>
                    <option value="Commercial / Cotton">Commercial (Cotton / Sugarcane)</option>
                    <option value="Horticulture">Horticulture & Vegetables</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Irrigation Availability
                  </label>
                  <select
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Canal">Canal Irrigation</option>
                    <option value="Borewell">Borewell / Tube well</option>
                    <option value="Rainfed">Rainfed / Dryland</option>
                    <option value="Drip/Sprinkler">Drip / Micro-irrigation</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: HOUSING & FAMILY INFORMATION */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-600" />
                  Step {isFarmer ? '7' : '6'} — Housing & Family Information
                </h2>
                <p className="text-xs text-slate-500">Evaluates PMAY housing subsidies and social security.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Do you or your family own a pucca/permanent house? *
                  </label>
                  <select
                    name="ownHouse"
                    value={formData.ownHouse}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="No">No (Live in kutcha house, rented or homeless)</option>
                    <option value="Yes">Yes (Own a pucca concrete house)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current Housing Condition *
                  </label>
                  <select
                    name="housingCondition"
                    value={formData.housingCondition}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Kutcha">Kutcha / Thatched / Mud House</option>
                    <option value="Semi-Pucca">Semi-Pucca (Asbestos/Tin sheet)</option>
                    <option value="Pucca">Pucca (Reinforced concrete)</option>
                    <option value="Homeless">Homeless / Temporary shelter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Total Family Members *
                  </label>
                  <input
                    type="number"
                    name="familySize"
                    min="1"
                    max="20"
                    value={formData.familySize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Number of Children
                  </label>
                  <input
                    type="number"
                    name="numberOfChildren"
                    min="0"
                    max="10"
                    value={formData.numberOfChildren}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions (Back / Next / Submit) */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('btnBack')}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>{t('btnNext')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-emerald-600 hover:from-orange-700 hover:to-emerald-700 text-white text-sm font-extrabold flex items-center gap-2 transition-all shadow-lg hover:shadow-orange-500/25 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Evaluating Schemes...' : t('btnSubmit')}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
