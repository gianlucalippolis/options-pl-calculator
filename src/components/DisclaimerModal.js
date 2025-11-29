import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const DisclaimerModal = ({ onAccept, onClose, skipToTypeSelection = false, currentType = null }) => {
  const { t, language, setLanguage } = useLanguage();
  const [step, setStep] = React.useState(skipToTypeSelection ? 3 : 1);
  const [selectedType, setSelectedType] = React.useState(currentType);

  React.useEffect(() => {
    if (skipToTypeSelection) {
      setStep(3);
    }
  }, [skipToTypeSelection]);

  React.useEffect(() => {
    setSelectedType(currentType);
  }, [currentType]);

  const handleLanguageSelect = (lang) => {
    setLanguage(lang);
    setStep(2);
  };

  const handleAcceptDisclaimer = () => {
    setStep(3);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    onAccept(type);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={skipToTypeSelection ? handleClose : undefined}>
      <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
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
        ) : step === 2 ? (
          <>
            <h2 style={{ color: 'var(--danger)', marginTop: 0 }}>{t('disclaimerTitle')}</h2>
            <div className="disclaimer-text">
              <p>{t('disclaimerText1')}</p>
              <p>{t('disclaimerText2')}</p>
              <p><strong>{t('disclaimerText3')}</strong></p>
            </div>
            <button className="accept-btn" onClick={handleAcceptDisclaimer}>
              {t('iUnderstand')}
            </button>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>{t('selectOptionType') || 'Select Option Type'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className={`accept-btn ${selectedType === 'call' ? 'active' : ''}`}
                onClick={() => handleTypeSelect('call')}
                style={{ 
                  backgroundColor: selectedType === 'call' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: `2px solid ${selectedType === 'call' ? 'var(--accent-primary)' : 'var(--border-color)'}`
                }}
              >
                {t('call')}
              </button>
              <button 
                className={`accept-btn ${selectedType === 'put' ? 'active' : ''}`}
                onClick={() => handleTypeSelect('put')}
                style={{ 
                  backgroundColor: selectedType === 'put' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                  border: `2px solid ${selectedType === 'put' ? 'var(--accent-primary)' : 'var(--border-color)'}`
                }}
              >
                {t('put')}
              </button>
            </div>
            {skipToTypeSelection && (
              <button 
                className="accept-btn" 
                onClick={handleClose}
                style={{ 
                  marginTop: '1rem', 
                  background: 'var(--bg-tertiary)', 
                  color: 'var(--text-secondary)'
                }}
              >
                {t('cancel') || 'Cancel'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DisclaimerModal;
