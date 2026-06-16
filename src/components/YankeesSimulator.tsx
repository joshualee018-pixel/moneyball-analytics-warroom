import React, { useState, useEffect } from 'react';
import { Player, ScoutVerdict } from '../types';
import { 
  Plus, 
  Play, 
  HelpCircle, 
  Loader2, 
  TrendingUp, 
  Volume2, 
  Zap, 
  Flame, 
  LineChart, 
  Award, 
  TrendingDown, 
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Users
} from 'lucide-react';

interface YankeesSimulatorProps {
  signedPlayers: Player[];
  teamMetrics: {
    averageObp: number;
    averageSlg: number;
    averageOps: number;
    totalSalary: number;
    projectedWins: number;
    playerNames: string[];
  };
}

export default function YankeesSimulator({ signedPlayers, teamMetrics }: YankeesSimulatorProps) {
  const [simulating, setSimulating] = useState(false);
  const [simDone, setSimDone] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [seriesOutcome, setSeriesOutcome] = useState<{
    oaklandWins: number;
    yankeeWins: number;
    oaklandTotalRuns: number;
    yankeeTotalRuns: number;
    gameScores: { oak: number; nyy: number; result: 'W' | 'L' }[];
  } | null>(null);

  // Front office evaluation states
  const [loadingReport, setLoadingReport] = useState(false);
  const [report, setReport] = useState<ScoutVerdict | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<'scout' | 'brand' | 'beane'>('scout');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Derive pitchers and key batters
  const signedPitchers = signedPlayers.filter(p => p.type === 'pitcher');
  const signedBatters = signedPlayers.filter(p => p.type === 'batter');

  const runSimulation = () => {
    if (signedPlayers.length === 0) return;
    setSimulating(true);
    setSimDone(false);
    setCurrentStep(0);
    setReport(null);
    setLogs([]);
    setErrorText(null);

    // Dynamic factors based on metrics
    const obp = teamMetrics.averageObp;
    const slg = teamMetrics.averageSlg;
    
    // Pitching score based on signed pitchers' OBP and stats
    const avgPitcherObpAllowed = signedPitchers.length > 0 
      ? signedPitchers.reduce((acc, p) => acc + p.obp, 0) / signedPitchers.length 
      : 0.320; // baseline OBP allowed
    
    const pitchingQualityFactor = Math.max(0.6, Math.min(1.4, (0.330 - avgPitcherObpAllowed) * 10 + 1));
    const hittingFactor = Math.max(0.6, Math.min(1.4, (obp - 0.310) * 8 + 1));
    
    // Playoff threshold and alignment checks
    const hasMetAllSlots = ['First Base', 'Second Base', 'Third Base', 'Shortstop', 'Outfield', 'Pitcher'].every(posKey => {
      return signedPlayers.some(p => p.position.includes(posKey) || p.position === posKey);
    });
    const chemistryBonus = hasMetAllSlots ? 1.15 : 1.0;

    // Simulate 3 games
    const games: { oak: number; nyy: number; result: 'W' | 'L' }[] = [];
    let oakWins = 0;
    let nyWins = 0;
    let oakTotalRuns = 0;
    let nyTotalRuns = 0;

    // Yankee baseline model: .353 OBP, .435 SLG
    const yankeeBaseRuns = 4.8; 

    for (let g = 1; g <= 3; g++) {
      // Game scores calculated with statistical probability
      const oakBaseExpectation = 4.1; // Base small-market run expectation
      const oakRuns = Math.max(
        0, 
        Math.round((oakBaseExpectation * hittingFactor * chemistryBonus) + (Math.random() * 3 - 1.5))
      );
      
      const nyRuns = Math.max(
        0, 
        Math.round((yankeeBaseRuns / pitchingQualityFactor) + (Math.random() * 3 - 1.5))
      );

      // In baseball, can't have tie games
      let finalOakRuns = oakRuns;
      let finalNyRuns = nyRuns;
      if (finalOakRuns === finalNyRuns) {
        if (Math.random() > 0.45) {
          finalOakRuns += 1;
        } else {
          finalNyRuns += 1;
        }
      }

      const result = finalOakRuns > finalNyRuns ? 'W' : 'L';
      if (result === 'W') oakWins++;
      else nyWins++;

      oakTotalRuns += finalOakRuns;
      nyTotalRuns += finalNyRuns;

      games.push({ oak: finalOakRuns, nyy: finalNyRuns, result });
    }

    setSeriesOutcome({
      oaklandWins: oakWins,
      yankeeWins: nyWins,
      oaklandTotalRuns: oakTotalRuns,
      yankeeTotalRuns: nyTotalRuns,
      gameScores: games
    });

    // Custom play-by-play logs based on signed roster names or fallback
    const batterNames = signedBatters.length > 0 ? signedBatters.map(b => b.name) : ['Hattersley', 'Tejada', 'Chavez', 'Justice'];
    const pitcherNames = signedPitchers.length > 0 ? signedPitchers.map(p => p.name) : ['Barry Zito', 'Tim Hudson', 'Chad Bradford'];
    
    const randomBatter = () => batterNames[Math.floor(Math.random() * batterNames.length)];
    const randomPitcher = () => pitcherNames[Math.floor(Math.random() * pitcherNames.length)];

    const simSteps = [
      `Initializing Sabermetric Predictor Model. Standardizing parameters vs 2002 Yankees ($125MB Payroll)...`,
      `GAME 1: First pitch at Yankee Stadium. Cool spring breeze. ${randomPitcher()} gets the starting nod.`,
      `[G1] ${randomPitcher()} is locked in. Strikes out Derek Jeter with a vicious late-breaking sinker!`,
      `[G1] Top 7th: Oakland trails. ${randomBatter()} works a masterclass 8-pitch plate appearance. Drives a base-on-balls!`,
      `[G1] Bottom 9th: Bases loaded with Yankees. Reliever comes in. He forces Alfonso Soriano into a 6-4-3 double play. Oakland secures Game 1, ${games[0].oak}-${games[0].nyy}!`,
      `GAME 2: Yankees strike back early. Jason Giambi hits a massive 2-run home run into the right-field bleachers.`,
      `[G2] ${randomBatter()} fires a base hit off Roger Clemens, but Oakland strand two walk assets on second base.`,
      `[G2] Mechanics review: Scouting reports call our relief pitching funny, but analytics confirms we are saving runs. Game 2 wrap: ${games[1].oak}-${games[1].nyy}.`,
      `GAME 3: The Decider. Pitcher ${randomPitcher()} matches up against Andy Pettitte in a brutal duel.`,
      `[G3] Sabermetric alert! ${randomBatter()} catches a hanging slider and smashes it into deep center! OBP aggregated into raw runs!`,
      `[G3] 9th inning: Yankee sluggers wear down. A's hold strong under professional defensive chemical alignments. Series final: Oakland Athletics win ${oakWins} games to ${nyWins}!`,
    ];

    // Trigger step updates sequentially
    let step = 0;
    const interval = setInterval(() => {
      setLogs((prev) => [...prev, simSteps[step]]);
      setCurrentStep(step);
      step++;
      if (step >= simSteps.length) {
        clearInterval(interval);
        setSimulating(false);
        setSimDone(true);
      }
    }, 850);
  };

  const getReportFromFrontOffice = async () => {
    if (!seriesOutcome) return;
    setLoadingReport(true);
    setReport(null);
    setErrorText(null);

    try {
      const res = await fetch('/api/moneyball/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          scenario: 'yankees-series',
          team: {
            playerNames: teamMetrics.playerNames,
            budgetRemaining: 40000000 - teamMetrics.totalSalary,
            budgetLimit: 40000000,
            totalSalary: teamMetrics.totalSalary,
            projectedWins: teamMetrics.projectedWins,
          },
          stats: {
            averageObp: teamMetrics.averageObp,
            averageSlg: teamMetrics.averageSlg
          },
          outcome: seriesOutcome
        })
      });

      if (!res.ok) {
        throw new Error('Front office failed to respond in the aggregate. Try again.');
      }

      const data = await res.json();
      setReport(data);
      setActiveSpeaker('brand');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Error compiling simulated report.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Auto-scroll log display
  useEffect(() => {
    const el = document.getElementById('log-display');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#0F0F12] border border-white/10 rounded-lg overflow-hidden shadow-2xl flex flex-col p-6 space-y-6">
      
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500 animate-pulse" />
            AGGREGATE MATCHUP SIMULATOR: VS THE $125M YANKEES
          </h2>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter font-mono">
            Directly test the mathematical viability of your sandbox roster against the highest payroll in baseball history.
          </p>
        </div>

        {signedPlayers.length > 0 && !simulating && (
          <button
            onClick={runSimulation}
            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-black font-semibold text-xs rounded-sm hover:shadow-emerald-500/10 active:scale-95 transition-all uppercase tracking-widest border-b-2 border-emerald-700 font-mono font-bold flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-black" /> EXECUTE 3-GAME SERIES
          </button>
        )}
      </div>

      {signedPlayers.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <Users className="w-12 h-12 text-gray-700 mx-auto" />
          <div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Your active sandbox is vacant</p>
            <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
              You must sign at least one player to your roster workspace to run a simulated match against the Yankees.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left panel: Comparison Metrics & Match cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              
              {/* Card 1: Oakland A's Roster stats */}
              <div className="bg-[#141418]/60 border border-white/5 p-4 rounded-md space-y-2">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">SMALL MARKET OAKLAND</span>
                <div className="text-2xl font-mono font-bold">${(teamMetrics.totalSalary / 1000000).toFixed(2)}M</div>
                <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                  <div>Avg OBP: <span className="text-white font-bold font-mono">.{Math.round(teamMetrics.averageObp * 1000)}</span></div>
                  <div>Avg SLG: <span className="text-white">.{Math.round(teamMetrics.averageSlg * 1000)}</span></div>
                  <div>Staff Pitchers: <span className="text-white">{signedPitchers.length}</span></div>
                </div>
              </div>

              {/* Card 2: Yankees Roster stats */}
              <div className="bg-[#141418]/60 border border-white/5 p-4 rounded-md space-y-2">
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider block">MASSIVE PAYROLL BRONX</span>
                <div className="text-2xl font-mono font-bold text-amber-500">$125.60M</div>
                <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                  <div>Avg OBP: <span className="text-white font-bold font-mono">.353</span></div>
                  <div>Avg SLG: <span className="text-white">.435</span></div>
                  <div>Yankee Stars: <span className="text-white">Giambi, Jeter</span></div>
                </div>
              </div>

            </div>

            {/* Sabermetric Analysis comparison card */}
            <div className="bg-[#111115] border border-white/5 p-4 rounded-md space-y-3 font-mono text-xs">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block border-b border-white/5 pb-1.5">Simulation Predictor Analytics</span>
              
              <div className="flex justify-between">
                <span className="text-gray-500">OBP Leverage Ratio:</span>
                <span className={teamMetrics.averageObp >= 0.340 ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {(teamMetrics.averageObp / 0.353 * 10).toFixed(2)} / 10.0
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Pitching Quality Factor:</span>
                <span className={signedPitchers.length > 2 ? 'text-emerald-400 font-bold' : 'text-gray-400'}>
                  {signedPitchers.length > 0 ? (signedPitchers.length > 2 ? 'Premium Elite' : 'Functional') : 'Critical Empty'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Payroll Efficiency Index:</span>
                <span className="text-emerald-400 font-bold">
                  {((teamMetrics.projectedWins / (teamMetrics.totalSalary / 1000000))).toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Retro LED Scoreboard Section if Sim Done */}
            {seriesOutcome && simDone && (
              <div className="bg-black/90 border border-emerald-500/10 p-5 rounded-md space-y-4 font-mono select-none">
                <div className="text-center text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">Aggregate Scorecard Overview</div>
                
                <div className="space-y-2.5 border-y border-white/5 py-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span className="font-bold">OAKLAND A's (SMALL MARKET)</span>
                    <span className="font-bold font-mono text-emerald-400">{seriesOutcome.oaklandWins} WINS</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>NEW YORK YANKEES ($125M)</span>
                    <span className="font-bold text-amber-500">{seriesOutcome.yankeeWins} WINS</span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>SERIES SCORING:</span>
                  <span className="text-white font-bold uppercase">
                    OAK {seriesOutcome.oaklandTotalRuns} - NYY {seriesOutcome.yankeeTotalRuns} (Runs)
                  </span>
                </div>

                <div className={`p-2.5 rounded text-center text-xs font-bold font-mono ${
                  seriesOutcome.oaklandWins > seriesOutcome.yankeeWins 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/10 border border-rose-500/10 text-rose-300'
                }`}>
                  {seriesOutcome.oaklandWins > seriesOutcome.yankeeWins 
                    ? '🏆 SUCCESS: SMALL-MARKET MATH DEFEATS MONSTER PAYROLL!'
                    : '❌ LOST: RESOURCE DEPRIVATION LIMITS REPLICABILITY.'}
                </div>
              </div>
            )}

          </div>

          {/* Right panel: Active live ticker logs and Dynamic evaluation commentary (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Live simulation logs display screen */}
            <div className="bg-black/80 border border-white/10 p-4 rounded-md flex-1 flex flex-col h-[280px]">
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                <span>SIMULATION PREVIEW TICKER CONSOLE</span>
                {simulating && <span className="text-emerald-400 animate-pulse">● LIVE CALCULATION</span>}
              </div>

              <div 
                id="log-display"
                className="flex-1 overflow-y-auto font-mono text-xs text-gray-400 space-y-2.5 whitespace-pre-wrap pr-1 leading-normal"
              >
                {logs.length === 0 && (
                  <div className="h-full flex items-center justify-center text-gray-600 text-center select-none font-medium">
                    Whiteboard static. Execute simulation above to write plate outcome history.
                  </div>
                )}
                {logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-2 items-start ${index === currentStep && simulating ? 'text-white' : ''}`}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Front Office evaluate section */}
            {simDone && seriesOutcome && (
              <div className="space-y-4">
                
                {/* Evaluator request CTA */}
                {!report && !loadingReport && (
                  <div className="p-4 bg-[#141418] border border-white/5 text-center rounded-md space-y-3">
                    <p className="text-xs text-gray-400 leading-normal">
                      Would you like to summon Billy Beane, Grady Fuson, and Peter Brand into the war room to evaluate this specific series outcome?
                    </p>
                    <button
                      onClick={getReportFromFrontOffice}
                      className="px-4 py-2 bg-[#1A1A1E] hover:bg-white/5 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-sm text-xs font-mono font-bold tracking-wider"
                    >
                      REQUEST FRONT OFFICE CRITIQUE REPORT
                    </button>
                  </div>
                )}

                {loadingReport && (
                  <div className="p-8 bg-[#141418] border border-white/5 rounded-md flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <p className="text-xs font-mono text-emerald-400 tracking-wider uppercase animate-pulse">
                      Summoning Front Office panelists...
                    </p>
                  </div>
                )}

                {errorText && (
                  <div className="p-4 bg-[#2A1215]/30 border border-rose-500/20 text-rose-300 rounded-md text-xs font-mono text-center">
                    {errorText}
                  </div>
                )}

                {/* Speaker Dialogue Renders (identical to the beautiful war room modals!) */}
                {report && (
                  <div className="bg-[#141418] border border-white/10 rounded-md overflow-hidden flex flex-col">
                    
                    {/* Character Tab Selectors */}
                    <div className="grid grid-cols-3 border-b border-white/5 divide-x divide-white/5 bg-[#111115]">
                      <button
                        onClick={() => setActiveSpeaker('scout')}
                        className={`py-3 px-1 text-center font-mono text-[10px] font-bold uppercase transition-all tracking-wider ${
                          activeSpeaker === 'scout' 
                            ? 'bg-[#141418] text-rose-400 font-black' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        GRADY FUSON
                      </button>
                      <button
                        onClick={() => setActiveSpeaker('brand')}
                        className={`py-3 px-1 text-center font-mono text-[10px] font-bold uppercase transition-all tracking-wider ${
                          activeSpeaker === 'brand' 
                            ? 'bg-[#141418] text-emerald-400 font-black' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        PETER BRAND
                      </button>
                      <button
                        onClick={() => setActiveSpeaker('beane')}
                        className={`py-3 px-1 text-center font-mono text-[10px] font-bold uppercase transition-all tracking-wider ${
                          activeSpeaker === 'beane' 
                            ? 'bg-[#141418] text-amber-500 font-black' 
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        BILLY BEANE
                      </button>
                    </div>

                    {/* Dialogue Box */}
                    <div className="p-5 space-y-3 bg-[#141418]">
                      {activeSpeaker === 'scout' && (
                        <div className="space-y-2 animate-fade-in">
                          <p className="text-[10px] font-mono text-rose-400 font-bold uppercase">GRADE REPORT: Grady Fuson</p>
                          <p className="italic font-sans text-xs text-gray-300 leading-relaxed">
                            "{report.scoutCommentary}"
                          </p>
                        </div>
                      )}
                      {activeSpeaker === 'brand' && (
                        <div className="space-y-2 animate-fade-in">
                          <p className="text-[10px] font-mono text-emerald-400 font-bold uppercase">SABERMETRIC MODEL OUTLOOK: Peter Brand</p>
                          <p className="font-sans text-xs text-gray-300 leading-relaxed font-light">
                            {report.brandAnalysis}
                          </p>
                        </div>
                      )}
                      {activeSpeaker === 'beane' && (
                        <div className="space-y-2 animate-fade-in">
                          <p className="text-[10px] font-mono text-yellow-500 font-bold uppercase">DECISION: Billy Beane</p>
                          <p className="font-sans text-xs font-bold text-white leading-relaxed">
                            {report.beaneVerdict}
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
