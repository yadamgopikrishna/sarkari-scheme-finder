import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine friendly feature name based on path
    let featureName = 'this protected section';
    if (location.pathname.includes('eligibility')) featureName = '7-Step Eligibility Wizard';
    else if (location.pathname.includes('compare')) featureName = 'Scheme Comparison Matrix';
    else if (location.pathname.includes('saved')) featureName = 'Saved Schemes';
    else if (location.pathname.includes('dashboard')) featureName = 'Citizen Dashboard';
    else if (location.pathname.includes('results')) featureName = 'Eligibility Results';

    return <Navigate to="/login" state={{ from: location.pathname, feature: featureName }} replace />;
  }

  return children;
}
