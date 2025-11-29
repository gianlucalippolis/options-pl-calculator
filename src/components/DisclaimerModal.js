import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const DisclaimerModal = ({ onAccept }) => {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = React.useState(1);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep(2);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        {step === 1 ? (
          <>
            <h2 style={{ marginTop: 0 }}>Select Language / Seleziona Lingua</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="accept-btn"
                onClick={() => handleLanguageSelect('it')}
              >
                🇮🇹 Italiano
              </button>
              <button 
                className="accept-btn"
                onClick={() => handleLanguageSelect('en')}
              >
                🇬🇧 English
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ color: 'var(--danger)', marginTop: 0 }}>{t('disclaimerTitle')}</h2>
            <div className="disclaimer-text">
              <p>{t('disclaimerText1')}</p>
              <p>{t('disclaimerText2')}</p>
              <p><strong>{t('disclaimerText3')}</strong></p>
            </div>
            <button className="accept-btn" onClick={onAccept}>
              {t('iUnderstand')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DisclaimerModal;
