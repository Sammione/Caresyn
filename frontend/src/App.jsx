import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import PatientCard from './components/PatientCard';
import { Activity, Plus, LayoutDashboard } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, add-patient, patient-detail
  const [selectedPatient, setSelectedPatient] = useState(null);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onPatientSelect={(p) => { setSelectedPatient(p); setCurrentView('patient-detail'); }} />;
      case 'add-patient':
        return <PatientForm onComplete={() => setCurrentView('dashboard')} />;
      case 'patient-detail':
        return <PatientCard patient={selectedPatient} onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo" onClick={() => setCurrentView('dashboard')} style={{cursor: 'pointer'}}>
          <Activity size={32} color="#8b5cf6" />
          CareSyn
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button className="btn" onClick={() => setCurrentView('dashboard')} style={{ backgroundColor: currentView === 'dashboard' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: 'var(--text-primary)' }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="btn btn-primary" onClick={() => setCurrentView('add-patient')}>
            <Plus size={18} /> New Patient
          </button>
        </div>
      </header>

      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;
