import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const OptionsForm = ({ data, onChange }) => {
  const { t } = useLanguage();
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div className="toggle-container">
          <button
            className={`toggle-btn ${data.type === 'call' ? 'active' : ''}`}
            onClick={() => handleChange('type', 'call')}
          >
            {t('call')}
          </button>
          <button
            className={`toggle-btn ${data.type === 'put' ? 'active' : ''}`}
            onClick={() => handleChange('type', 'put')}
          >
            {t('put')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="currentPrice">{t('currentStockPrice')}</label>
          <input
            id="currentPrice"
            type="number"
            value={data.currentPrice}
            onChange={(e) => handleChange('currentPrice', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="strikePrice">{t('strikePrice')}</label>
          <input
            id="strikePrice"
            type="number"
            value={data.strikePrice}
            onChange={(e) => handleChange('strikePrice', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="premium">{t('premium')}</label>
          <input
            id="premium"
            type="number"
            value={data.premium}
            onChange={(e) => handleChange('premium', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="multiplier">{t('multiplier')}</label>
          <input
            id="multiplier"
            type="number"
            value={data.multiplier}
            onChange={(e) => handleChange('multiplier', parseFloat(e.target.value))}
            step="1"
          />
        </div>
        <div>
          <label htmlFor="currency">{t('currency')}</label>
          <select
            id="currency"
            value={data.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="EUR">{t('currencyEUR')}</option>
            <option value="USD">{t('currencyUSD')}</option>
            <option value="GBP">{t('currencyGBP')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="targetPrice">{t('targetPrice')}</label>
          <input
            id="targetPrice"
            type="number"
            value={data.targetPrice || ''}
            onChange={(e) => handleChange('targetPrice', e.target.value ? parseFloat(e.target.value) : null)}
            step="0.01"
            placeholder="--"
          />
        </div>
        <div>
          <label htmlFor="quantity">{t('quantity')}</label>
          <input
            id="quantity"
            type="number"
            value={data.quantity}
            onChange={(e) => handleChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
            step="1"
            min="1"
          />
        </div>
      </div>
    </div>
  );
};

export default OptionsForm;
