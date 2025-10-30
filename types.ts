export interface BettingStep {
  step: number;
  bankroll: number;
  stake: number;
  odds: number;
  potentialWin: number;
  newBankroll: number;
}

export interface MatchAnalysis {
  predictedScore: string;
  totalGoals: string;
  totalCorners: string;
  totalCards: string;
  totalThrowIns: string;
  confidence: string;
  summary: string;
  bankerBet: string;
}

export interface GroundingSource {
  web: {
    uri: string;
    title: string;
  }
}