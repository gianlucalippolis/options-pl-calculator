import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="toggle-container" style={{ marginBottom: '1.5rem' }}>
      <button
        className={`toggle-btn ${language === 'it' ? 'active' : ''}`}
        onClick={toggleLanguage}
        style={{ flex: 1 }}
      >
        🇮🇹 IT
      </button>
      <button
        className={`toggle-btn ${language === 'en' ? 'active' : ''}`}
        onClick={toggleLanguage}
        style={{ flex: 1 }}
      >
        🇬🇧 EN
      </button>
    </div>
  );
};

export default LanguageSelector;
