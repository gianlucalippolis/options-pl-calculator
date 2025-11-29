import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

const ResultsChart = ({ results, strikePrice, currency, optionType, currentPrice, targetPrice, quantity = 1, expirationDate, premium, multiplier }) => {
  const { t } = useLanguage();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const getSymbol = (curr) => {
    switch(curr) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '€';
    }
  };
  const symbol = getSymbol(currency);

  // Determine if option is in the money, out of the money, or at the money
  const getMoneyStatus = () => {
    const diff = Math.abs(currentPrice - strikePrice);
    if (diff < 0.01) {
      return { status: 'atTheMoney', color: 'var(--text-secondary)' };
    }
    
    if (optionType === 'call') {
      // Call is ITM when current price > strike price
      return currentPrice > strikePrice 
        ? { status: 'inTheMoney', color: 'var(--success)' }
        : { status: 'outOfTheMoney', color: 'var(--danger)' };
    } else {
      // Put is ITM when current price < strike price
      return currentPrice < strikePrice 
        ? { status: 'inTheMoney', color: 'var(--success)' }
        : { status: 'outOfTheMoney', color: 'var(--danger)' };
    }
  };

  const moneyStatus = getMoneyStatus();

  // Calculate target price percentage change and total profit
  const getTargetAnalysis = () => {
    if (!targetPrice || targetPrice <= 0) {
      return null;
    }

    const diff = targetPrice - currentPrice;
    const percentChange = (diff / currentPrice) * 100;
    const isReached = Math.abs(diff) < 0.01;
    
    // Calculate P&L directly at target price (same formula as in calculateResults)
    let pnlAtTarget = 0;
    if (premium && multiplier) {
      const costPerOption = premium * multiplier;
      
      if (optionType === 'call') {
        const intrinsicValue = Math.max(0, targetPrice - strikePrice);
        pnlAtTarget = (intrinsicValue * multiplier) - costPerOption;
      } else {
        const intrinsicValue = Math.max(0, strikePrice - targetPrice);
        pnlAtTarget = (intrinsicValue * multiplier) - costPerOption;
      }
    } else {
      // Fallback: try to find in results
      const targetResult = results.find(r => Math.abs(r.price - targetPrice) < 0.01);
      pnlAtTarget = targetResult ? targetResult.pnl : 0;
    }
    
    const totalProfit = pnlAtTarget * quantity;
    
    // Determine if the movement is favorable for the option type
    // For CALL: increase in price is favorable (green)
    // For PUT: decrease in price is favorable (green)
    let isFavorable;
    if (optionType === 'call') {
      isFavorable = diff > 0; // Price increase is favorable for CALL
    } else {
      isFavorable = diff < 0; // Price decrease is favorable for PUT
    }

    return {
      percentChange: Math.abs(percentChange),
      isIncrease: diff > 0, // Keep for display purposes (arrow direction)
      isFavorable: isFavorable,
      isReached,
      diff: Math.abs(diff),
      pnlAtTarget,
      totalProfit
    };
  };

  const targetAnalysis = getTargetAnalysis();
  
  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!expirationDate) return null;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Find min and max P&L to set domain if needed, or let Recharts handle it.
  // We want to make sure 0 is visible.
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card" style={{ padding: '0.5rem', border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Price: {symbol}{label}</p>
          <p style={{ margin: 0, fontWeight: 'bold', color: data.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            P&L: {data.pnl >= 0 ? '+' : ''}{symbol}{data.pnl.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Gradient for the area fill
  const gradientOffset = () => {
    const dataMax = Math.max(...results.map((i) => i.pnl));
    const dataMin = Math.min(...results.map((i) => i.pnl));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();

  // Generate custom ticks that always include the strike price
  const generateTicks = () => {
    if (results.length === 0) return [];
    
    const minPrice = results[0].price;
    const maxPrice = results[results.length - 1].price;
    const range = maxPrice - minPrice;
    
    const ticks = [];
    
    if (optionType === 'put') {
      // For PUT options: ticks above strike concentrated near strike, ticks below spread out
      const topRange = maxPrice - strikePrice;
      const bottomRange = strikePrice - minPrice;
      
      // More ticks in bottom range (spread out), more ticks in top range (tighter spacing like CALL bottom)
      const bottomTickCount = 8;
      // Same number of ticks above strike as CALL has below strike (4 ticks)
      const topTickCount = 4;
      
      // Bottom range: uniform distribution (like CALL bottom range)
      for (let i = 0; i < bottomTickCount; i++) {
        const price = strikePrice - (bottomRange * i / (bottomTickCount - 1));
        ticks.push(Math.round(price * 100) / 100);
      }
      
      // Top range: uniform distribution (exactly like CALL bottom range)
      for (let i = 0; i < topTickCount; i++) {
        const price = strikePrice + (topRange * i / (topTickCount - 1));
        const roundedPrice = Math.round(price * 100) / 100;
        // Only add if it's different from strike and not already added
        if (roundedPrice > strikePrice && roundedPrice <= maxPrice && !ticks.some(t => Math.abs(t - roundedPrice) < 0.01)) {
          ticks.push(roundedPrice);
        }
      }
    } else {
      // For CALL options: more ticks at the top (high prices on the right)
      const topRange = maxPrice - strikePrice;
      const bottomRange = strikePrice - minPrice;
      
      // More ticks in the bottom range
      const bottomTickCount = 4;
      const topTickCount = 8;
      
      for (let i = 0; i < bottomTickCount; i++) {
        const price = strikePrice - (bottomRange * i / (bottomTickCount - 1));
        ticks.push(Math.round(price * 100) / 100);
      }
      
      for (let i = 1; i < topTickCount; i++) {
        const price = strikePrice + (topRange * i / (topTickCount - 1));
        ticks.push(Math.round(price * 100) / 100);
      }
    }
    
    // Always include strike price if it's not already in the ticks
    if (!ticks.some(tick => Math.abs(tick - strikePrice) < 0.01)) {
      ticks.push(strikePrice);
    }
    
    ticks.sort((a, b) => a - b);
    
    return ticks;
  };

  const customTicks = generateTicks();

  // Custom tick component to highlight strike price
  const CustomXAxisTick = ({ x, y, payload }) => {
    const isStrike = Math.abs(payload.value - strikePrice) < 0.01;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill={isStrike ? 'var(--accent-primary)' : 'var(--text-secondary)'}
          fontWeight={isStrike ? 'bold' : 'normal'}
        >
          {symbol}{payload.value.toFixed(2)}
        </text>
        {isStrike && (
          <text 
            x={0} 
            y={0} 
            dy={32} 
            textAnchor="middle" 
            fill="var(--accent-primary)"
            fontSize="0.75rem"
            fontWeight="600"
          >
            Strike
          </text>
        )}
      </g>
    );
  };

  return (
    <div>
      <h2 style={{ 
        marginBottom: '1rem', 
        fontSize: '1.75rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        textAlign: 'left'
      }}>
        {t('optionType')}: <span style={{ 
          color: 'var(--accent-primary)',
          textTransform: 'uppercase'
        }}>{t(optionType)}</span>
      </h2>
      <div className={isFullScreen ? "fullscreen-overlay" : ""}>
        <div className="card" style={isFullScreen ? { padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' } : { minHeight: '500px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 0, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>{t('chartTitle')}</h2>
              <button 
                className="fullscreen-btn"
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? t('exitFullScreen') : t('fullScreen')}
              >
                {isFullScreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                )}
                <span style={{ display: 'none' }}>{isFullScreen ? t('exitFullScreen') : t('fullScreen')}</span>
              </button>
            </div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              backgroundColor: `${moneyStatus.color}20`,
              border: `2px solid ${moneyStatus.color}`,
              fontWeight: 'bold',
              color: moneyStatus.color
            }}>
              {t(moneyStatus.status)}
            </div>
          </div>
          <div className="chart-scroll-container">
            <div style={{ minWidth: '800px', height: '100%' }}>
              <ResponsiveContainer width="100%" height={isFullScreen ? "100%" : 450}>
                <ComposedChart
                  data={results}
                  margin={isFullScreen ? {
                    top: 40, // Increased for label visibility
                    right: 20,
                    left: 0,
                    bottom: 40, // Increased for iOS safe area
                  } : {
                    top: 30, // Increased for label visibility
                    right: 10,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis 
                    dataKey="price" 
                    type="number" 
                    domain={['dataMin', 'dataMax']} 
                    ticks={customTicks}
                    stroke="var(--text-secondary)"
                    tick={<CustomXAxisTick />}
                    reversed={optionType === 'put'}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    tickFormatter={(val) => `${symbol}${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x={currentPrice} stroke="var(--success)" strokeDasharray="3 3" label={{ position: 'top', value: 'Current', fill: 'var(--success)' }} />
                  <ReferenceLine x={strikePrice} stroke="var(--accent-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Strike', fill: 'var(--accent-secondary)' }} />
                  {targetPrice && targetPrice > 0 && (
                    <ReferenceLine 
                      x={targetPrice} 
                      stroke="var(--accent-primary)" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                      label={{ position: 'top', value: 'Target', fill: 'var(--accent-primary)' }} 
                    />
                  )}
                  <ReferenceLine y={0} stroke="var(--text-primary)" />
                  
                  <defs>
                    <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset={off} stopColor="var(--success)" stopOpacity={0.3} />
                      <stop offset={off} stopColor="var(--danger)" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  
                  <Area type="monotone" dataKey="pnl" stroke="none" fill="url(#splitColor)" />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="var(--accent-primary)" 
                    strokeWidth={3} 
                    dot={false} 
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mobile-scroll-hint">
            <span>← {t('swipeToScroll')} →</span>
          </div>
          
          {daysRemaining !== null && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>{t('daysRemaining')}:</span>
              <span style={{ fontWeight: 'bold', color: daysRemaining > 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Card - Always visible */}
      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>{t('operationAnalysis')}</h3>
        
        {/* Operation Cost Section - Always visible */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: targetAnalysis ? '1.5rem' : '0',
          paddingBottom: targetAnalysis ? '1.5rem' : '0',
          borderBottom: targetAnalysis ? '1px solid var(--border-color)' : 'none'
        }}>
          <div style={{ 
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {t('totalCost')}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {symbol}{(premium * multiplier * quantity).toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {premium.toFixed(2)} × {multiplier} × {quantity}
            </div>
          </div>
          
          {daysRemaining !== null && (
            <div style={{ 
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                {t('daysRemaining')}
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: daysRemaining > 0 ? 'var(--text-primary)' : 'var(--danger)' 
              }}>
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
            </div>
          )}
        </div>
        
        {/* Target Analysis Section - Only if target is set */}
        {targetAnalysis && (
          <>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{t('targetAnalysis')}</h4>
          {targetAnalysis.isReached ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '1rem',
              fontSize: '1.1rem',
              color: 'var(--success)',
              fontWeight: 'bold'
            }}>
              ✓ {t('targetReached')}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                  {t('toReachTarget')} <strong>{symbol}{targetPrice.toFixed(2)}</strong>, {t('priceNeedsTo')}:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: targetAnalysis.isFavorable ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {targetAnalysis.isIncrease ? '↑' : '↓'} {t(targetAnalysis.isIncrease ? 'increase' : 'decrease')}
                  </span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                    {t('of')}
                  </span>
                  <span style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold',
                    color: targetAnalysis.isFavorable ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {targetAnalysis.percentChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div style={{ 
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                backgroundColor: targetAnalysis.isFavorable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `2px solid ${targetAnalysis.isFavorable ? 'var(--success)' : 'var(--danger)'}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {t('currentStockPrice')}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {symbol}{currentPrice.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold',
                  color: targetAnalysis.isFavorable ? 'var(--success)' : 'var(--danger)',
                  marginTop: '0.5rem'
                }}>
                  {targetAnalysis.isIncrease ? '→' : '→'} {symbol}{targetPrice.toFixed(2)}
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)', 
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  {targetAnalysis.totalProfit >= 0 ? t('totalProfit') : t('totalLoss')}
                </div>
                <div style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: 'bold',
                  color: targetAnalysis.totalProfit >= 0 ? 'var(--success)' : 'var(--danger)',
                  marginTop: '0.25rem'
                }}>
                  {targetAnalysis.totalProfit >= 0 ? '+' : ''}{symbol}{targetAnalysis.totalProfit.toFixed(2)}
                </div>
                {quantity > 1 && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-secondary)',
                    marginTop: '0.25rem'
                  }}>
                    ({quantity} {quantity === 1 ? 'contract' : 'contracts'})
                  </div>
                )}
              </div>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResultsChart;
