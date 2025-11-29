import React from 'react';

const ResultsTable = ({ results, currency, strikePrice }) => {
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
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Stock Price</th>
            <th>Profit / Loss</th>
            <th>% Return</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, index) => {
            const isStrike = Math.abs(row.price - strikePrice) < 0.01;
            return (
              <tr key={index} style={isStrike ? { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--accent-primary)' } : {}}>
                <td style={isStrike ? { fontWeight: 'bold', color: 'var(--accent-primary)' } : {}}>
                  {symbol}{row.price.toFixed(2)} {isStrike && '(Strike)'}
                </td>
                <td className={row.pnl >= 0 ? 'text-success' : 'text-danger'} style={isStrike ? { fontWeight: 'bold' } : {}}>
                  {row.pnl >= 0 ? '+' : ''}{symbol}{row.pnl.toFixed(2)}
                </td>
                <td className={row.pnl >= 0 ? 'text-success' : 'text-danger'} style={isStrike ? { fontWeight: 'bold' } : {}}>
                  {row.roi.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
