
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import LiveTrafficPage from './pages/LiveTrafficPage';
import ClassificationAlertsPage from './pages/ClassificationAlertsPage';
import IncidentHistoryPage from './pages/IncidentHistoryPage';
import ModelMetricsPage from './pages/ModelMetricsPage';
import UploadCsvPage from './pages/UploadCsvPage';

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-dark-bg text-dark-text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/traffic" element={<LiveTrafficPage />} />
            <Route path="/classification" element={<ClassificationAlertsPage />} />
            <Route path="/history" element={<IncidentHistoryPage />} />
            <Route path="/metrics" element={<ModelMetricsPage />} />
            <Route path="/upload" element={<UploadCsvPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
    