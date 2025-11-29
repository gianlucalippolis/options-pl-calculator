import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const DisclaimerModal = ({ onAccept }) => {
  const { t } = useLanguage();

  return (
    <div className="modal-overlay">
      <div className="modal-content card">
        <h2 style={{ color: 'var(--danger)', marginTop: 0 }}>{t('disclaimerTitle')}</h2>
        <div className="disclaimer-text">
          <p>{t('disclaimerText1')}</p>
          <p>{t('disclaimerText2')}</p>
          <p><strong>{t('disclaimerText3')}</strong></p>
        </div>
        <button className="accept-btn" onClick={onAccept}>
          {t('iUnderstand')}
        </button>
      </div>
    </div>
  );
};

export default DisclaimerModal;
