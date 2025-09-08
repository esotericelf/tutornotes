import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import { reportWebVitals } from './utils/performance';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring - temporarily disabled to prevent getCLS errors
// reportWebVitals((metric) => {
//   console.log('Web Vitals:', metric);
//   // You can send metrics to analytics service here
//   // Example: analytics.track('web_vitals', metric);
// });
