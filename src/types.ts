export interface PerformanceStats {
  year: string;
  obp: number;
  slg: number;
  salary: number;
  ops: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  detailedPosition: string; // e.g. "First Base", "Shortstop", "Starting Pitcher", "Relief Pitcher", "Outfield"
  team: string;
  age: number;
  salary: number;
  obp: number; // On-Base Percentage
  slg: number; // Slugging Percentage
  ops: number; // On-Base + Slugging
  avg: number; // Batting Average
  
  // Batting specific
  h?: number;   // Hits
  bb?: number;  // Walks (Base on balls)
  hr?: number;  // Home Runs
  ab?: number;  // At Bats
  
  // Pitching specific
  era?: number;  // Earned Run Average
  whip?: number; // Walks + Hits per Innings Pitched
  ks?: number;   // Strikeouts
  ip?: number;   // Innings Pitched
  
  type: 'batter' | 'pitcher';
  tag: 'undervalued' | 'star' | 'departed' | 'expensive' | 'scout-favorite';
  scoutNotes: string; // Traditional scout opinion (e.g. "Ugly delivery", "Confidence issues", "Fantastic swing", "Great looks")
  saberNotes: string; // Sabermetric analysis (e.g. "Elite walk rate", "Sub-dirt movement", "Extremely undervalued walk stats")
  avatarSeed: string; // for custom avatar graphics or illustrations
  statsHistory: PerformanceStats[];
}

export interface Roster {
  id: string;
  name: string;
  playerIds: string[];
  budgetLimit: number;
  notes?: string;
  isCustom?: boolean;
}

export interface ScoutVerdict {
  scoutCommentary: string; // Gradle Fuson traditional feedback
  brandAnalysis: string;    // Peter Brand statistical justification
  beaneVerdict: string;     // Billy Beane executive verdict
}
