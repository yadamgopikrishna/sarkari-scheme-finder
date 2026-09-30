import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiAssistantModal from './components/AiAssistantModal';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import HomePage from './pages/HomePage';
import BrowseSchemesPage from './pages/BrowseSchemesPage';
import SchemeDetailsPage from './pages/SchemeDetailsPage';
import EligibilityFormPage from './pages/EligibilityFormPage';
import ResultsPage from './pages/ResultsPage';
import CompareSchemesPage from './pages/CompareSchemesPage';
import SavedSchemesPage from './pages/SavedSchemesPage';
import DashboardPage from './pages/DashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schemes" element={<BrowseSchemesPage />} />
          <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
          <Route
            path="/check-eligibility"
            element={
              <ProtectedRoute>
                <EligibilityFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <CompareSchemesPage />
              </ProtectedRoute>
            }
          />

          {/* Citizen Protected Routes */}
          <Route
            path="/saved-schemes"
            element={
              <ProtectedRoute>
                <SavedSchemesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Protected Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global AI Assistant Floating Widget */}
      <AiAssistantModal />

      <Footer />
    </div>
  );
}
