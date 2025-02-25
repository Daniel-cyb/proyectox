import React from 'react';

export default function MetricChart({ count }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f5f5f5', width: '300px' }}>
      <h2>Monthly Tweet Count</h2>
      <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#007bff' }}>
        {count}
      </div>
      <p>Tweets evaluated this month</p>
    </div>
  );
}
