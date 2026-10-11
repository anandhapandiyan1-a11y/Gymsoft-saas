import React, { useState } from 'react';

const BmiCalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');

  const calculateBmi = (e) => {
    e.preventDefault();
    if (!height || !weight) return;
    const heightInMeters = height / 100;
    const calculatedBmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(calculatedBmi);

    if (calculatedBmi < 18.5) setStatus('Underweight 🍃');
    else if (calculatedBmi >= 18.5 && calculatedBmi < 24.9) setStatus('Normal Weight 💪');
    else if (calculatedBmi >= 25 && calculatedBmi < 29.9) setStatus('Overweight ⚠️');
    else setStatus('Obese 🚨');
  };

  return (
    <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', color: '#fff', border: '1px solid #334155' }}>
      <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>⚡ Smart BMI & Fitness Calculator</h3>
      <form onSubmit={calculateBmi} style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <input type="number" placeholder="Height in cm (e.g., 175)" value={height} onChange={(e) => setHeight(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
        <input type="number" placeholder="Weight in kg (e.g., 75)" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ padding: '10px', borderRadius: '6px', background: '#0f172a', border: '1px solid #334155', color: '#fff', outline: 'none' }} required />
        <button type="submit" style={{ background: '#38bdf8', color: '#0f172a', padding: '10px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Calculate BMI</button>
      </form>
      {bmi && (
        <div style={{ marginTop: '15px', background: '#0f172a', padding: '10px', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>Your BMI: <strong style={{ color: '#34d399' }}>{bmi}</strong></p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Status: <b>{status}</b></p>
        </div>
      )}
    </div>
  );
};

export default BmiCalculator;