export type Locale = 'fa' | 'en' | 'zh';
export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST';
export type MatchEventType = 'goal' | 'shot' | 'save' | 'corner' | 'foul' | 'yellow' | 'injury' | 'chance';
export type TacticStyle = 'balanced' | 'pressing' | 'counter' | 'possession' | 'direct';
export interface Player {
  id: string; name: string; age: number; nationality: string; position: Position; clubId: string;
  overall: number; potential: number; pace: number; shooting: number; passing: number; defending: number;
  physical: number; goalkeeping: number; value: number; wage: number; contractYears: number;
  fitness: number; morale: number; form: number; injuredWeeks: number; appearances: number; goals: number; assists: number;
  isYouth?: boolean;
}
export interface Club {
  id: string; name: string; shortName: string; city: string; colors: [string, string]; reputation: number;
  cash: number; transferBudget: number; wageBudget: number; stadium: string; capacity: number; supporters: number;
  played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number; points: number;
}
export interface Tactics { formation: string; style: TacticStyle; mentality: 'defensive' | 'balanced' | 'attacking'; pressing: number; tempo: number; width: number; defensiveLine: number; }
export interface MatchEvent { minute: number; type: MatchEventType; teamId: string; playerId?: string; assistId?: string; text: string; x: number; z: number; targetX: number; targetZ: number; xg?: number; }
export interface MatchResult { homeGoals: number; awayGoals: number; homeShots: number; awayShots: number; homeOnTarget: number; awayOnTarget: number; homePossession: number; awayPossession: number; homeXg: number; awayXg: number; events: MatchEvent[]; seed: number; }
export interface Fixture { id: string; season: string; round: number; date: string; homeClubId: string; awayClubId: string; result?: MatchResult; played: boolean; }
export interface FinancialTransaction { id: string; date: string; description: string; amount: number; category: 'transfer' | 'wages' | 'matchday' | 'sponsor' | 'facility' | 'academy' | 'other'; }
export interface ScoutingReport { playerId: string; estimatedPotential: number; accuracy: number; report: string; }
export interface GameState {
  saveVersion: number; season: string; currentRound: number; day: number; currentClubId: string; clubs: Club[]; players: Player[];
  fixtures: Fixture[]; transactions: FinancialTransaction[]; news: { id: string; title: string; detail: string; day: number; type: 'info' | 'warning' | 'success' }[];
  tactics: Tactics; facilities: { training: number; academy: number; medical: number; scouting: number; stadium: number };
  scoutingReports: ScoutingReport[]; lastResult?: { fixtureId: string; result: MatchResult };
}
export interface OfferResult { accepted: boolean; message: string; counterOffer?: number; }
