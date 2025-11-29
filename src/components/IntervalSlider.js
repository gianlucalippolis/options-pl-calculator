import React from 'react';

const IntervalSlider = ({ value, onChange, currency, min = 0.1, max = 2.0, step = 0.1 }) => {
  const getSymbol = (curr) => {
    switch(curr) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '€';
    }
  };
  const symbol = getSymbol(currency);

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--accent-primary)' }}>
          {symbol}{value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label="Price Interval Slider"
      />
      <div className="flex justify-between" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        <span>{symbol}{min.toFixed(2)}</span>
        <span>{symbol}{max.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default IntervalSlider;
