import React, { useState } from 'react';
import { ArrowLeft, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { analyzePatient } from '../api';

function PatientCard({ patient, onBack }) {
  const [symptoms, setSymptoms] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!patient) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await analyzePatient({
        patient_id: patient.id,
        symptoms: symptoms
      });
      setAssessment(res.data);
      setSymptoms('');
    } catch (err) {
      console.error(err);
      alert('Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className="btn" onClick={onBack} style={{marginBottom: '2rem', padding: '0.5rem 1rem'}}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="grid-2">
        <div className="glass-panel">
          <h2 style={{marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem'}}>
            Patient Profile: {patient.name}
          </h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gestational Age:</strong> {patient.gestational_age_weeks} weeks</p>
            <p><strong>First Pregnancy:</strong> {patient.is_first_pregnancy ? 'Yes' : 'No'}</p>
            <p><strong>History:</strong> {patient.medical_history || 'None reported'}</p>
            <p style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <strong>SMS Language:</strong>
              <span style={{backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, border: '1px solid rgba(139,92,246,0.4)'}}>
                🌐 {patient.preferred_language || 'English'}
              </span>
            </p>
          </div>

          <div style={{marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem'}}>
            <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Stethoscope color="var(--primary)" /> Log Symptoms & Agent Analysis
            </h3>
            <form onSubmit={handleAnalyze}>
              <textarea 
                className="form-textarea" 
                rows="4" 
                placeholder="e.g. Patient reports swelling in hands and face, accompanied by a severe headache..."
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary" style={{marginTop: '1rem'}} disabled={loading}>
                {loading ? 'Agent Analyzing...' : 'Run AI Analysis'}
              </button>
            </form>
          </div>
        </div>

        {assessment && (
          <div className="glass-panel" style={{animation: 'pulse 0.5s ease-out 1'}}>
            <h2 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: assessment.risk_level === 'High' ? 'var(--danger)' : 'var(--accent)'}}>
              {assessment.risk_level === 'High' ? <AlertCircle /> : <CheckCircle />}
              Agent Assessment Report
            </h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              <div>
                <span className="form-label">Risk Level</span>
                <span className={`badge ${assessment.risk_level === 'High' ? 'badge-high' : assessment.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {assessment.risk_level}
                </span>
              </div>
              
              <div>
                <span className="form-label">Detected Risks</span>
                <p style={{backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px'}}>{assessment.detected_risks}</p>
              </div>

              <div>
                <span className="form-label">Recommendations</span>
                <p style={{backgroundColor: 'rgba(15, 23, 42, 0.4)', padding: '0.75rem', borderRadius: '8px'}}>{assessment.recommendations}</p>
              </div>

              {assessment.draft_sms && (
                <div style={{marginTop: '0.5rem', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.35)'}}>
                  <p style={{fontSize: '0.78rem', color: '#a78bfa', fontWeight: 600, marginBottom: '0.5rem'}}>
                    📱 Draft SMS — {patient.preferred_language || 'English'}
                  </p>
                  <p style={{fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)'}}>{assessment.draft_sms}</p>
                </div>
              )}

              <div style={{marginTop: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.25)'}}>
                <p style={{fontSize: '0.82rem', color: 'var(--text-secondary)'}}>
                  ✅ A follow-up task has been automatically created in the dashboard based on this assessment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientCard;
