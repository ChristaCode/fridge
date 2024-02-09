import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AdminComponent from './AdminComponent';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <React.StrictMode>
      <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin" element={<AdminComponent />} />
        </Routes>
    </React.StrictMode>
  </Router>
);

reportWebVitals();
