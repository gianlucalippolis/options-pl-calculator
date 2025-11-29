import React, { useState, useEffect } from 'react';
import OptionsForm from './OptionsForm';
import ResultsTable from './ResultsTable';
import ResultsChart from './ResultsChart';
import IntervalSlider from './IntervalSlider';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const OptionsCalculator = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({
    type: 'call',
    currentPrice: 100,
    strikePrice: 100,
    premium: 5,
    multiplier: 100,
    currency: 'EUR',
  });

  const [interval, setInterval] = useState(0.5);
  const [showTable, setShowTable] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    calculateResults();
  }, [data, interval]);

  const calculateResults = () => {
    const { type, currentPrice, strikePrice, premium, multiplier } = data;
    const rows = [];
    const range = 20; // Show range +/- $20 from current price (adjustable logic if needed)
    
    // Determine start and end price for the table
    // We'll center it around the strike price or current price? Usually current price is good context.
    // Let's go from (Current Price - 10% or fixed amount) to (Current Price + 10% or fixed amount)
    // Or maybe center around Strike?
    // Let's center around the Current Price as that's where we are now.
    
    // Let's generate about 20-30 rows.
    // Start = Current Price - (10 * interval)
    // End = Current Price + (10 * interval)
    // Actually, user might want to see break-even.
    
    // Let's try a fixed number of steps up and down.
    const steps = 15;
    const startPrice = Math.max(0, currentPrice - (steps * interval));
    const endPrice = currentPrice + (steps * interval);

    for (let price = startPrice; price <= endPrice; price += interval) {
      // Avoid floating point errors in loop
      const cleanPrice = Math.round(price * 100) / 100;
      
      let pnl = 0;
      const totalCost = premium * multiplier;

      if (type === 'call') {
        // Call P&L: (Max(0, Price - Strike) * Multiplier) - Cost
        const intrinsicValue = Math.max(0, cleanPrice - strikePrice);
        pnl = (intrinsicValue * multiplier) - totalCost;
      } else {
        // Put P&L: (Max(0, Strike - Price) * Multiplier) - Cost
        const intrinsicValue = Math.max(0, strikePrice - cleanPrice);
        pnl = (intrinsicValue * multiplier) - totalCost;
      }

      const roi = totalCost !== 0 ? (pnl / totalCost) * 100 : 0;

      rows.push({
        price: cleanPrice,
        pnl: pnl,
        roi: roi
      });
    }

    setResults(rows);
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'left' }}>{t('title')}</h1>
        <LanguageSelector />
        <OptionsForm data={data} onChange={setData} />
        <IntervalSlider value={interval} onChange={setInterval} currency={data.currency} />
      </div>

      <div className="main-content">
        <ResultsChart results={results} strikePrice={data.strikePrice} currency={data.currency} />

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            className="toggle-btn active" 
            style={{ maxWidth: '200px', margin: '0 auto' }}
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? t('hideTable') : t('showTable')}
          </button>
        </div>

        {showTable && <ResultsTable results={results} currency={data.currency} strikePrice={data.strikePrice} />}
      </div>
    </div>
  );
};

export default OptionsCalculator;
