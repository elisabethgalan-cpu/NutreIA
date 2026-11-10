import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/app/providers/AuthProvider';
import { Navbar } from '@/components/shared/Navbar';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { NutritionOverviewPage } from '@/features/nutrition/NutritionOverviewPage';
import { TrainingOverviewPage } from '@/features/training/TrainingOverviewPage';
import { FamilyManagementPage } from '@/features/family/FamilyManagementPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/nutrition" element={<NutritionOverviewPage />} />
              <Route path="/training" element={<TrainingOverviewPage />} />
              <Route path="/family" element={<FamilyManagementPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
              NutreIA • Asistente Familiar de Alimentación y Entrenamiento • Diseñado para Supabase y Vercel
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};
