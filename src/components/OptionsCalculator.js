import React, { useState, useEffect } from 'react';
import OptionsForm from './OptionsForm';
import ResultsTable from './ResultsTable';
import ResultsChart from './ResultsChart';
import { useLanguage } from '../context/LanguageContext';

const OptionsCalculator = ({ initialType = 'call', onTypeChange, onOpenTypeSelector }) => {
  const { t } = useLanguage();
  const [data, setData] = useState({
    type: initialType,
    currentPrice: 100,
    strikePrice: 100,
    premium: 5,
    multiplier: 100,
    currency: 'EUR',
    targetPrice: null,
    targetPrice: null,
    quantity: 1,
    expirationDate: '',
  });

  useEffect(() => {
    if (initialType !== data.type) {
      setData(prev => ({ ...prev, type: initialType }));
    }
  }, [initialType]);

  const [showTable, setShowTable] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    calculateResults();
  }, [data]);



  const calculateResults = () => {
    const { type, currentPrice, strikePrice, premium, multiplier, quantity, targetPrice } = data;
    const rows = [];
    
    // Calculate costs
    const costPerOption = premium * multiplier;
    const totalCost = costPerOption * quantity;
    
    // Find the min and max of the key prices
    const keyPrices = [currentPrice, strikePrice];
    if (targetPrice && targetPrice > 0) {
      keyPrices.push(targetPrice);
    }
    const minKeyPrice = Math.min(...keyPrices);
    const maxKeyPrice = Math.max(...keyPrices);
    const priceSpread = maxKeyPrice - minKeyPrice;
    
    // Calculate range: balance between realistic prices and label separation
    const isMobile = window.innerWidth <= 768;
    
    // For very small spreads (prices very close), use a fixed minimum range
    // For larger spreads, use proportional padding
    let padding;
    if (priceSpread < strikePrice * 0.05) {
      // Prices are very close (< 5% apart): use fixed 10% padding
      padding = strikePrice * 0.10;
    } else {
      // Prices have meaningful spread: use 50% of spread as padding
      const proportionalPadding = priceSpread * 0.5;
      const minPadding = strikePrice * 0.08; // Minimum 8% padding
      padding = Math.max(proportionalPadding, minPadding);
    }
    
    // Asymmetric range: for CALL more prices above (profit), for PUT more prices below (profit)
    let rangeMin, rangeMax;
    if (type === 'put') {
      // For PUT: drastically limit range above strike, expand range below strike (where profit is)
      const paddingBelow = padding * 1.6; // 160% of padding below
      rangeMin = Math.max(0, minKeyPrice - paddingBelow);
      // For PUT, limit max to just above strike or currentPrice (whichever is higher) + minimal padding
      // This prevents too much space above strike on the chart
      const maxBase = Math.max(strikePrice, currentPrice);
      const paddingAbove = padding * 0.1; // Very minimal padding above (10%)
      rangeMax = maxBase + paddingAbove;
    } else {
      // For CALL: more space above strike (where profit is)
      const paddingBelow = padding * 0.4; // 40% of padding below
      const paddingAbove = padding * 1.6; // 160% of padding above
      rangeMin = Math.max(0, minKeyPrice - paddingBelow);
      rangeMax = maxKeyPrice + paddingAbove;
    }
    const totalRange = rangeMax - rangeMin;
    
    // Calculate interval to get ~40-50 points (less dense, more readable)
    const targetPoints = 45;
    const calculatedInterval = totalRange / targetPoints;
    
    // Round to nice intervals
    const niceIntervals = [0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100];
    const adaptiveInterval = niceIntervals.reduce((prev, curr) => 
      Math.abs(curr - calculatedInterval) < Math.abs(prev - calculatedInterval) ? curr : prev
    );
    
    
    // Generate prices from rangeMin to rangeMax using the adaptive interval
    let currentPricePoint = rangeMin;
    while (currentPricePoint <= rangeMax) {
      const cleanPrice = Math.round(currentPricePoint * 100) / 100;
      
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
      
      currentPricePoint += adaptiveInterval;
    }

    setResults(rows);
  };

  return (
    <div className="layout-container">
      <div className="sidebar">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', textAlign: 'left' }}>{t('title')}</h1>
        <button 
          className="accept-btn" 
          onClick={onOpenTypeSelector}
          style={{ 
            marginBottom: '1.5rem',
            background: 'var(--accent-gradient)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            width: '100%'
          }}
        >
          {t('changeOptionType') || 'Cambia Tipo Opzione'}
        </button>
        <OptionsForm data={data} onChange={setData} />
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
          expirationDate={data.expirationDate}
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
