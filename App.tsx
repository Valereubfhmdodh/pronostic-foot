
import React, { useState } from 'react';
import BettingStrategyCalculator from './components/BettingStrategyCalculator';
import MatchAnalyzer from './components/MatchAnalyzer';

type Tab = 'strategy' | 'analysis';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('strategy');

  const renderContent = () => {
    switch (activeTab) {
      case 'strategy':
        return <BettingStrategyCalculator />;
      case 'analysis':
        return <MatchAnalyzer />;
      default:
        return null;
    }
  };

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-1/2 py-3 text-sm font-bold transition-colors duration-300 focus:outline-none ${
        activeTab === tab
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
            Sports Bet Strategist AI
          </h1>
          <p className="text-gray-400 mt-2">
            Outils intelligents pour des paris sportifs maîtrisés
          </p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex">
            <TabButton tab="strategy" label="Calculateur de Stratégie" />
            <TabButton tab="analysis" label="Analyse de Match par IA" />
          </div>
          <div className="p-6 sm:p-8">
            {renderContent()}
          </div>
        </main>
         <footer className="text-center mt-8 text-gray-500 text-xs">
            <p>Veuillez parier de manière responsable. Cet outil est à des fins d'illustration et ne garantit aucun résultat.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
