import React from 'react';

const OptionsForm = ({ data, onChange }) => {
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
            Call
          </button>
          <button
            className={`toggle-btn ${data.type === 'put' ? 'active' : ''}`}
            onClick={() => handleChange('type', 'put')}
          >
            Put
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="currentPrice">Current Stock Price ($)</label>
          <input
            id="currentPrice"
            type="number"
            value={data.currentPrice}
            onChange={(e) => handleChange('currentPrice', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="strikePrice">Strike Price ($)</label>
          <input
            id="strikePrice"
            type="number"
            value={data.strikePrice}
            onChange={(e) => handleChange('strikePrice', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="premium">Premium ($)</label>
          <input
            id="premium"
            type="number"
            value={data.premium}
            onChange={(e) => handleChange('premium', parseFloat(e.target.value))}
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="multiplier">Multiplier (Shares/Contract)</label>
          <input
            id="multiplier"
            type="number"
            value={data.multiplier}
            onChange={(e) => handleChange('multiplier', parseFloat(e.target.value))}
            step="1"
          />
        </div>
        <div>
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            value={data.currency}
            onChange={(e) => handleChange('currency', e.target.value)}
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default OptionsForm;
