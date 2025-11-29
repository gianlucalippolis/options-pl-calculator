import React from 'react';
import OptionsCalculator from './components/OptionsCalculator';
import DisclaimerModal from './components/DisclaimerModal';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [showDisclaimer, setShowDisclaimer] = React.useState(false);

  React.useEffect(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    if (!hasAccepted) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setShowDisclaimer(false);
  };

  return (
    <LanguageProvider>
      <div className="App">
        {showDisclaimer && <DisclaimerModal onAccept={handleAcceptDisclaimer} />}
        <OptionsCalculator />
      </div>
    </LanguageProvider>
  );
}

export default App;
