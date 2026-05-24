import React, { useState, useEffect } from 'react';
import { getPatients, getTasks } from '../api';
import { Users, CheckSquare, AlertTriangle, ChevronRight } from 'lucide-react';

function Dashboard({ onPatientSelect }) {
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, tasksRes] = await Promise.all([getPatients(), getTasks()]);
        setPatients(patientsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '3rem'}}>Loading...</div>;

  return (
    <div className="grid-2">
      <div className="glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
        <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <CheckSquare color="var(--accent)" /> Coordinator Tasks
        </h2>
        {tasks.length === 0 ? (
          <p style={{color: 'var(--text-secondary)'}}>No pending tasks. Great job!</p>
        ) : (
          <div style={{flex: 1, overflowY: 'auto'}}>
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.is_urgent ? 'urgent' : ''}`}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <h4 style={{fontSize: '1.05rem', marginBottom: '0.5rem'}}>{task.title}</h4>
                  {task.is_urgent && <span className="badge badge-high animate-pulse">Urgent</span>}
                </div>
                <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap'}}>{task.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{display: 'flex', flexDirection: 'column'}}>
        <h2 style={{marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <Users color="var(--primary)" /> My Patients
        </h2>
        {patients.length === 0 ? (
          <p style={{color: 'var(--text-secondary)'}}>No patients registered yet.</p>
        ) : (
          <div style={{flex: 1, overflowY: 'auto'}}>
            {patients.map(patient => (
              <div 
                key={patient.id} 
                className="task-item" 
                style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)'}}
                onClick={() => onPatientSelect(patient)}
              >
                <div>
                  <h4 style={{marginBottom: '0.25rem'}}>{patient.name}</h4>
                  <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{patient.age} years old • {patient.gestational_age_weeks} weeks</p>
                </div>
                <ChevronRight size={20} color="var(--text-secondary)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
