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
    targetPrice: null,
    quantity: 1,
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
    
    // Generate prices centered on strike price, ensuring strike is always included
    // Reduce negative prices since max loss is the premium paid
    const stepsAbove = 15; // More steps above for profit scenarios
    const stepsBelow = 5;  // Fewer steps below since loss is capped at premium
    
    // Generate prices below strike
    for (let i = stepsBelow; i > 0; i--) {
      const price = strikePrice - (i * interval);
      if (price >= 0) {
        const cleanPrice = Math.round(price * 100) / 100;
        
        let pnl = 0;
        const totalCost = premium * multiplier;

        if (type === 'call') {
          const intrinsicValue = Math.max(0, cleanPrice - strikePrice);
          pnl = (intrinsicValue * multiplier) - totalCost;
        } else {
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
    }
    
    // Add strike price itself
    const totalCost = premium * multiplier;
    let pnlAtStrike = 0;
    
    if (type === 'call') {
      const intrinsicValue = Math.max(0, strikePrice - strikePrice);
      pnlAtStrike = (intrinsicValue * multiplier) - totalCost;
    } else {
      const intrinsicValue = Math.max(0, strikePrice - strikePrice);
      pnlAtStrike = (intrinsicValue * multiplier) - totalCost;
    }
    
    const roiAtStrike = totalCost !== 0 ? (pnlAtStrike / totalCost) * 100 : 0;
    
    rows.push({
      price: strikePrice,
      pnl: pnlAtStrike,
      roi: roiAtStrike
    });
    
    // Generate prices above strike
    for (let i = 1; i <= stepsAbove; i++) {
      const price = strikePrice + (i * interval);
      const cleanPrice = Math.round(price * 100) / 100;
      
      let pnl = 0;

      if (type === 'call') {
        const intrinsicValue = Math.max(0, cleanPrice - strikePrice);
        pnl = (intrinsicValue * multiplier) - totalCost;
      } else {
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
        <ResultsChart 
          results={results} 
          strikePrice={data.strikePrice} 
          currency={data.currency}
          optionType={data.type}
          currentPrice={data.currentPrice}
          targetPrice={data.targetPrice}
          quantity={data.quantity}
        />

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
        
        {/* Footer with creator credit */}
        <div style={{ 
          marginTop: '3rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          Created by{' '}
          <a 
            href="https://github.com/gianlucalippolis" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: 'var(--accent-primary)', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-secondary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent-primary)'}
          >
            Gianluca Lippolis
          </a>
        </div>
      </div>
    </div>
  );
};

export default OptionsCalculator;
