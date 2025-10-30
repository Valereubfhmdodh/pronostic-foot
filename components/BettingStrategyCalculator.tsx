import React, { useState, useMemo } from 'react';
import { BettingStep } from '../types';
import Input from './shared/Input';
import Button from './shared/Button';
import { DownloadIcon } from './shared/icons/DownloadIcon';

const BettingStrategyCalculator: React.FC = () => {
    const [startAmount, setStartAmount] = useState<string>('10');
    const [targetAmount, setTargetAmount] = useState<string>('1000');
    const [startOdds, setStartOdds] = useState<string>('1.20');
    const [oddsIncrement, setOddsIncrement] = useState<string>('0.05');
    const [plan, setPlan] = useState<BettingStep[]>([]);
    const [error, setError] = useState<string>('');

    const handleCalculate = () => {
        const start = parseFloat(startAmount);
        const target = parseFloat(targetAmount);
        const sOdds = parseFloat(startOdds);
        const oIncrement = parseFloat(oddsIncrement);

        setError('');
        setPlan([]);

        if (isNaN(start) || isNaN(target) || isNaN(sOdds) || isNaN(oIncrement)) {
            setError('Veuillez entrer des valeurs numériques valides.');
            return;
        }
        if (start <= 0 || target <= 0) {
            setError('Les montants doivent être positifs.');
            return;
        }
        if (sOdds < 1.01) {
            setError("La cote de départ doit être d'au moins 1.01.");
            return;
        }
        if (oIncrement < 0) {
            setError("L'incrément de cote ne peut pas être négatif.");
            return;
        }
        if (start >= target) {
            setError('Le montant cible doit être supérieur au montant de départ.');
            return;
        }

        const calculatedPlan: BettingStep[] = [];
        let currentBankroll = start;
        let currentOdds = sOdds;
        let step = 1;

        while (currentBankroll < target && step <= 20) { // Safety break
            const stake = currentBankroll; // All-in
            const potentialWin = stake * currentOdds;
            const newBankroll = potentialWin;
            
            calculatedPlan.push({
                step,
                bankroll: currentBankroll,
                stake,
                odds: currentOdds,
                potentialWin,
                newBankroll,
            });
            
            currentBankroll = newBankroll;
            currentOdds += oIncrement;
            step++;
        }

        if (step > 20 && currentBankroll < target) {
             setError("Le plan dépasse 20 étapes. L'objectif est peut-être trop élevé pour ces paramètres.");
             return;
        }

        setPlan(calculatedPlan);
    };

    const handleDownload = () => {
        if (plan.length === 0) return;

        const headers = [
            "Palier",
            "Capital (€)",
            "Mise (€)",
            "Cote",
            "Gain Potentiel (€)",
            "Nouveau Capital (€)"
        ];

        const csvRows = [
            headers.join(','), // header row
            ...plan.map(p => [
                p.step,
                p.bankroll.toFixed(2),
                p.stake.toFixed(2),
                p.odds.toFixed(2),
                p.potentialWin.toFixed(2),
                p.newBankroll.toFixed(2)
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'strategie-montante.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const formattedPlan = useMemo(() => plan.map(p => ({
        ...p,
        bankroll: p.bankroll.toFixed(2),
        stake: p.stake.toFixed(2),
        odds: p.odds.toFixed(2),
        potentialWin: p.potentialWin.toFixed(2),
        newBankroll: p.newBankroll.toFixed(2),
    })), [plan]);


    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-2">Stratégie de Montante (Tout Miser)</h2>
                <p className="text-gray-400">
                    Calculez une stratégie de "montante" agressive. À chaque étape, vous misez l'intégralité de votre capital sur une cote qui augmente progressivement pour atteindre rapidement votre objectif.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Input 
                    label="Montant de départ (€)"
                    type="number"
                    value={startAmount}
                    onChange={(e) => setStartAmount(e.target.value)}
                    placeholder="ex: 10"
                />
                <Input 
                    label="Montant cible (€)"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="ex: 1000"
                />
                 <Input 
                    label="Cote de départ"
                    type="number"
                    step="0.01"
                    value={startOdds}
                    onChange={(e) => setStartOdds(e.target.value)}
                    placeholder="ex: 1.20"
                />
                <Input 
                    label="Incrément de cote par palier"
                    type="number"
                    step="0.01"
                    value={oddsIncrement}
                    onChange={(e) => setOddsIncrement(e.target.value)}
                    placeholder="ex: 0.05"
                />
                 <Button onClick={handleCalculate} className="md:col-span-2">
                    Calculer la Montante
                </Button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            {formattedPlan.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-4 text-center">Votre Plan de Montante en {plan.length} Étapes</h3>
                    <div className="overflow-x-auto rounded-lg bg-gray-700/50">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Palier</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Capital</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Mise (100%)</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Cote</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Gain Potentiel</th>
                                    <th className="p-3 sm:p-4 text-sm font-semibold">Nouveau Capital</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formattedPlan.map((p, index) => (
                                    <tr key={p.step} className={`border-t border-gray-600 ${index % 2 === 0 ? 'bg-gray-800/50' : ''}`}>
                                        <td className="p-3 sm:p-4 font-bold text-emerald-400">{p.step}</td>
                                        <td className="p-3 sm:p-4">{p.bankroll} €</td>
                                        <td className="p-3 sm:p-4 text-yellow-400">{p.stake} €</td>
                                        <td className="p-3 sm:p-4">{p.odds}</td>
                                        <td className="p-3 sm:p-4 text-green-400">{p.potentialWin} €</td>
                                        <td className="p-3 sm:p-4 font-semibold">{p.newBankroll} €</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-yellow-500 mt-4 text-center">
                        <strong>Attention :</strong> Cette stratégie est extrêmement risquée. La perte d'un seul pari entraîne la perte de l'intégralité du capital.
                    </p>
                     <div className="mt-6 flex justify-center">
                        <Button onClick={handleDownload} className="max-w-xs flex items-center justify-center gap-2">
                            <div className="w-5 h-5">
                                <DownloadIcon />
                            </div>
                            Télécharger le Plan (.csv)
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BettingStrategyCalculator;