import React from 'react';

function App() {
  console.log('App component is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      minHeight: '100vh',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Anima Insights</h1>
      <p>Dream Journal & Interpretation</p>
      <p>If you can see this, React is working!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

export default App;