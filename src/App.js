import React from 'react';
import OptionsCalculator from './components/OptionsCalculator';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <OptionsCalculator />
      </div>
    </LanguageProvider>
  );
}

export default App;
