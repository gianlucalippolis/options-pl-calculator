import React from 'react';
import OptionsCalculator from './components/OptionsCalculator';
import DisclaimerModal from './components/DisclaimerModal';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  const [showDisclaimer, setShowDisclaimer] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState(null);

  React.useEffect(() => {
    const hasAccepted = localStorage.getItem('disclaimerAccepted');
    const savedType = localStorage.getItem('selectedOptionType');
    if (hasAccepted && savedType) {
      setSelectedType(savedType);
      // Still show modal on refresh to allow type selection
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = (type) => {
    localStorage.setItem('disclaimerAccepted', 'true');
    localStorage.setItem('selectedOptionType', type);
    setSelectedType(type);
    setShowDisclaimer(false);
  };

  const handleOpenTypeSelector = () => {
    setShowDisclaimer(true);
  };

  return (
    <LanguageProvider>
      <div className="App">
        {showDisclaimer && (
          <DisclaimerModal 
            onAccept={handleAcceptDisclaimer} 
            onClose={() => {
              const savedType = localStorage.getItem('selectedOptionType');
              if (savedType) {
                setShowDisclaimer(false);
              }
            }}
            skipToTypeSelection={!!localStorage.getItem('disclaimerAccepted')}
            currentType={selectedType}
          />
        )}
        {!showDisclaimer && selectedType && (
          <OptionsCalculator 
            initialType={selectedType} 
            onTypeChange={setSelectedType}
            onOpenTypeSelector={handleOpenTypeSelector}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

export default App;
