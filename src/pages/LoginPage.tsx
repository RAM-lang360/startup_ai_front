import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/features/auth/AuthForm';
import { AnimatedPage } from '../components/layout/AnimatedPage';

export const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    </AnimatedPage>
  );
};
