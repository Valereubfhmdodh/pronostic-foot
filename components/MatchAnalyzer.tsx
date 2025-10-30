import React, { useState } from 'react';
import { MatchAnalysis, GroundingSource } from '../types';
import { analyzeMatch } from '../services/geminiService';
import Input from './shared/Input';
import Button from './shared/Button';
import Card from './shared/Card';
import { GoalIcon } from './shared/icons/GoalIcon';
import { CornerIcon } from './shared/icons/CornerIcon';
import { CardIcon } from './shared/icons/CardIcon';
import { ThrowInIcon } from './shared/icons/ThrowInIcon';

const MatchAnalyzer: React.FC = () => {
    const [teamA, setTeamA] = useState<string>('');
    const [teamB, setTeamB] = useState<string>('');
    const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
    const [sources, setSources] = useState<GroundingSource[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleAnalyze = async () => {
        if (!teamA || !teamB) {
            setError('Veuillez entrer les noms des deux équipes.');
            return;
        }
        setError('');
        setAnalysis(null);
        setSources([]);
        setLoading(true);

        try {
            const { analysis: result, sources: fetchedSources } = await analyzeMatch(teamA, teamB);
            setAnalysis(result);
            setSources(fetchedSources);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors de l'analyse.");
        } finally {
            setLoading(false);
        }
    };
    
    const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string, value?: string }) => (
      <div className="flex flex-col items-center justify-center p-4 bg-gray-700/50 rounded-lg text-center">
        <div className="w-8 h-8 mb-2 text-emerald-400">{icon}</div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg font-bold">{value || 'N/A'}</p>
      </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-2">Analyse de Match par IA</h2>
                <p className="text-gray-400">
                    Obtenez des prédictions statistiques détaillées et sourcées pour un match en utilisant l'intelligence artificielle de Gemini.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Input 
                    label="Équipe A (Domicile)"
                    type="text"
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                    placeholder="ex: Real Madrid"
                />
                <Input 
                    label="Équipe B (Extérieur)"
                    type="text"
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                    placeholder="ex: FC Barcelone"
                />
                 <Button onClick={handleAnalyze} disabled={loading} className="md:col-span-2">
                    {loading ? (
                        <div className="flex items-center justify-center">
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyse en cours...
                        </div>
                    ) : 'Analyser le Match'}
                </Button>
            </div>
             {error && <p className="text-red-400 text-center">{error}</p>}

             {analysis && (
                 <Card>
                    <h3 className="text-xl font-bold text-center mb-2">
                        {teamA} vs {teamB}
                    </h3>
                    <p className="text-center text-3xl font-extrabold text-emerald-300 mb-6">{analysis.predictedScore}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatItem icon={<GoalIcon />} label="Total Buts" value={analysis.totalGoals} />
                        <StatItem icon={<CornerIcon />} label="Total Corners" value={analysis.totalCorners} />
                        <StatItem icon={<CardIcon />} label="Total Cartons" value={analysis.totalCards} />
                        <StatItem icon={<ThrowInIcon />} label="Total Touches" value={analysis.totalThrowIns} />
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg mb-2">Résumé de l'Analyse</h4>
                        <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg">{analysis.summary}</p>
                        <p className="text-sm text-gray-500 mt-4 text-right">Niveau de confiance : <span className="font-bold text-emerald-400">{analysis.confidence}</span></p>
                    </div>

                    {analysis.bankerBet && (
                        <div className="mt-6 p-4 rounded-lg bg-emerald-900/40 border border-emerald-600/50">
                            <h4 className="text-lg font-bold text-emerald-300 mb-2 text-center">
                                L'Option Sûre de l'IA
                            </h4>
                            <p className="text-center text-xl text-white font-semibold">
                                {analysis.bankerBet}
                            </p>
                        </div>
                    )}
                    
                    {sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <h4 className="font-semibold text-md mb-2 text-gray-300">Sources de l'analyse :</h4>
                            <ul className="list-disc list-inside text-gray-400 space-y-1 text-sm">
                                {sources.map((source, index) => (
                                    source.web && (
                                        <li key={index}>
                                            <a 
                                                href={source.web.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-cyan-400 hover:text-cyan-300 hover:underline"
                                                title={source.web.uri}
                                            >
                                                {source.web.title || new URL(source.web.uri).hostname}
                                            </a>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
             )}
        </div>
    );
};

export default MatchAnalyzer;