import React from 'react';
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

const ResultsChart = ({ results, strikePrice, currency }) => {
  const getSymbol = (curr) => {
    switch(curr) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return '€';
    }
  };
  const symbol = getSymbol(currency);

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

  return (
    <div className="card" style={{ minHeight: '500px', padding: '1.5rem' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Profit / Loss Chart</h2>
      <ResponsiveContainer width="100%" height={450}>
        <ComposedChart
          data={results}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={['auto', 'auto']} 
            tickCount={10}
            stroke="var(--text-secondary)"
            tickFormatter={(val) => `${symbol}${val}`}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tickFormatter={(val) => `${symbol}${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={strikePrice} stroke="var(--accent-secondary)" strokeDasharray="3 3" label={{ position: 'top', value: 'Strike', fill: 'var(--accent-secondary)' }} />
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
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultsChart;
