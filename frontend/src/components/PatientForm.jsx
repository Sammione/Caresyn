import React, { useState } from 'react';
import { createPatient } from '../api';

function PatientForm({ onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gestational_age_weeks: '',
    is_first_pregnancy: true,
    medical_history: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPatient({
        ...formData,
        age: parseInt(formData.age),
        gestational_age_weeks: parseInt(formData.gestational_age_weeks)
      });
      onComplete();
    } catch (err) {
      console.error(err);
      alert('Error creating patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{maxWidth: '600px', margin: '0 auto'}}>
      <h2 style={{marginBottom: '2rem'}}>Register New Patient</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" />
        </div>
        
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Age</label>
            <input required type="number" className="form-input" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} placeholder="e.g. 25" />
          </div>
          <div className="form-group">
            <label className="form-label">Gestational Age (weeks)</label>
            <input required type="number" className="form-input" value={formData.gestational_age_weeks} onChange={e => setFormData({...formData, gestational_age_weeks: e.target.value})} placeholder="e.g. 12" />
          </div>
        </div>

        <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <input type="checkbox" id="first_preg" checked={formData.is_first_pregnancy} onChange={e => setFormData({...formData, is_first_pregnancy: e.target.checked})} style={{width: '18px', height: '18px'}} />
          <label htmlFor="first_preg" className="form-label" style={{marginBottom: 0}}>First Pregnancy?</label>
        </div>

        <div className="form-group">
          <label className="form-label">Medical History (Optional)</label>
          <textarea className="form-textarea" rows="3" value={formData.medical_history} onChange={e => setFormData({...formData, medical_history: e.target.value})} placeholder="Any relevant past conditions..." />
        </div>

        <button type="submit" className="btn btn-primary" style={{width: '100%', justifyContent: 'center', marginTop: '1rem'}} disabled={loading}>
          {loading ? 'Saving...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
}

export default PatientForm;
