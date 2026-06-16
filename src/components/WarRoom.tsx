import React, { useState, useEffect, useRef } from 'react';
import { Player, ScoutVerdict } from '../types';
import { 
  Users, 
  Terminal, 
  HelpCircle, 
  Maximize2, 
  Loader2, 
  TrendingUp, 
  Volume2, 
  Zap,
  Flame,
  LineChart,
  UserCheck,
  CheckCircle,
  TrendingDown
} from 'lucide-react';

interface WarRoomProps {
  playerToEvaluate: Player | null; // null if evaluating overall team roster
  signedPlayers: Player[];
  teamMetrics?: {
    playerNames: string[];
    budgetRemaining: number;
    budgetLimit: number;
    totalSalary: number;
    averageObp: number;
    averageSlg: number;
    averageOps: number;
    projectedWins: number;
  };
  onClose: () => void;
}

export default function WarRoom({ 
  playerToEvaluate, 
  signedPlayers, 
  teamMetrics, 
  onClose 
}: WarRoomProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [verdict, setVerdict] = useState<ScoutVerdict | null>(null);
  const [activeSpeaker, setActiveSpeaker] = useState<'scout' | 'brand' | 'beane'>('scout');
  const [errorText, setErrorText] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvaluation() {
      setLoading(true);
      setErrorText(null);
      
      try {
        const payload: any = {};
        if (playerToEvaluate) {
          payload.player = playerToEvaluate;
        } else if (teamMetrics) {
          payload.team = teamMetrics;
        }

        const res = await fetch('/api/moneyball/evaluate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('Front office servers took too long in the aggregate. Try again.');
        }

        const data: ScoutVerdict = await res.json();
        setVerdict(data);
        // Default to showing Scout first so Beane has the final snap!
        setActiveSpeaker('scout');
      } catch (err: any) {
        console.error(err);
        setErrorText(err.message || 'Error communicating with front office servers.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvaluation();
  }, [playerToEvaluate, teamMetrics]);

  return (
    <div id="war-room-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col h-[85vh] transition-all max-h-[720px] animate-fade-in">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex justify-between items-center bg-gradient-to-r from-emerald-950/20 via-slate-950 to-slate-955">
          <div className="flex items-center gap-3">
            <div className="w-2 rounded-full h-5 bg-emerald-500 animate-pulse" />
            <div>
              <h2 className="text-sm font-mono font-bold text-white tracking-widest uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                athletics front office war room
              </h2>
              <p className="text-[10px] text-slate-500 tracking-wider">
                {playerToEvaluate 
                  ? `PRE-SEASON ANALYSIS • TARGET: ${playerToEvaluate.name.toUpperCase()}`
                  : `ROSTER SANITY CHALKS • COUNT: ${signedPlayers.length} PLAYERS`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-xs font-mono px-3 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 hover:text-white transition-all hover:bg-slate-755"
          >
            DISMISS
          </button>
        </div>

        {/* Loading display */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <div className="text-center">
              <p className="text-xs font-mono text-emerald-400 uppercase tracking-widest animate-pulse terminal-glow">
                evaluating aggregate statistical models...
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs leading-normal mt-2">
                Billy Beane is throwing a chair at the wall while Peter Brand compiles the OBP indexes. Wait up.
              </p>
            </div>
          </div>
        ) : errorText ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono text-rose-400 uppercase font-bold tracking-wider">FRONT OFFICE COMPILATION FAILED</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{errorText}</p>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-750"
            >
              CLOSE WINDOW
            </button>
          </div>
        ) : verdict ? (
          <div className="flex-1 flex flex-col overflow-hidden divide-y divide-slate-800">
            
            {/* Split layout: Speaker Selectors & Interactive Dialogue block */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              
              {/* Left Column Speaker Selectors */}
              <div className="md:col-span-4 bg-slate-950 p-4 space-y-3 overflow-y-auto">
                <span className="text-[9px] font-mono text-slate-500 block uppercase tracking-wider mb-2 font-bold select-none">
                  Front Office Panelists
                </span>

                {/* Speaker 1: Scout */}
                <button
                  onClick={() => setActiveSpeaker('scout')}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 select-none ${
                    activeSpeaker === 'scout' 
                      ? 'bg-rose-950/20 border-rose-500/35 text-rose-200' 
                      : 'border-slate-850 hover:border-slate-750 text-slate-400 bg-slate-900/30'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                    activeSpeaker === 'scout' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    GF
                  </div>
                  <div className="space-y-0.5 pointer-events-none">
                    <div className="text-xs font-semibold font-sans flex items-center gap-1.5">
                      Grady Fuson
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">HEAD TRADITIONAL SCOUT</div>
                  </div>
                </button>

                {/* Speaker 2: Brand */}
                <button
                  onClick={() => setActiveSpeaker('brand')}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 select-none ${
                    activeSpeaker === 'brand' 
                      ? 'bg-emerald-950/20 border-emerald-500/35 text-emerald-200' 
                      : 'border-slate-850 hover:border-slate-750 text-slate-400 bg-slate-900/30'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                    activeSpeaker === 'brand' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    PB
                  </div>
                  <div className="space-y-0.5 pointer-events-none">
                    <div className="text-xs font-semibold font-sans flex items-center gap-1.5">
                      Peter Brand
                      <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">YALE SABERMETRICIAN</div>
                  </div>
                </button>

                {/* Speaker 3: Billy */}
                <button
                  onClick={() => setActiveSpeaker('beane')}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 select-none ${
                    activeSpeaker === 'beane' 
                      ? 'bg-amber-950/20 border-amber-500/35 text-amber-200 shadow-lg shadow-amber-500/5' 
                      : 'border-slate-850 hover:border-slate-750 text-slate-400 bg-slate-900/30'
                  }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                    activeSpeaker === 'beane' ? 'bg-amber-500/20 text-yellow-400 animate-pulse' : 'bg-slate-800 text-slate-500'
                  }`}>
                    BB
                  </div>
                  <div className="space-y-0.5 pointer-events-none">
                    <div className="text-xs font-semibold font-sans flex items-center gap-1.5">
                      Billy Beane
                      <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">OAKLAND GENERAL MANAGER</div>
                  </div>
                </button>

              </div>

              {/* Right Column Interactive dialogue space */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900">
                
                {/* Simulated Conversation Feed */}
                <div className="space-y-6">
                  
                  {activeSpeaker === 'scout' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-xs font-mono font-bold text-rose-400">GRADY FUSON IN THE ROOM:</span>
                      </div>
                      <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-sm text-slate-200 relative">
                        <div className="absolute -top-2 left-6 px-2 bg-rose-500/10 border border-rose-500/20 rounded text-[9px] font-mono text-rose-400">
                          CONVENTIONAL SPECS
                        </div>
                        <p className="italic font-sans text-base text-slate-300">
                          "{verdict.scoutCommentary}"
                        </p>
                      </div>
                      <div className="p-3 bg-red-950/20 border border-red-900/20 text-[11px] text-slate-400 font-mono rounded-lg flex items-start gap-2">
                        <TrendingDown className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span> Grady focuses purely on looks. "He doesn't look like a real slugger, his stance is crooked." These visual biases undervalue walk-heavy sleepers.</span>
                      </div>
                    </div>
                  )}

                  {activeSpeaker === 'brand' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-mono font-bold text-emerald-400">PETER BRAND'S ANALYTICAL RUNWAY:</span>
                      </div>
                      <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-sm text-slate-200 relative">
                        <div className="absolute -top-2 left-6 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono text-emerald-400">
                          COMPUTER PROOF
                        </div>
                        <p className="font-sans text-base text-slate-300 leading-relaxed font-light">
                          {verdict.brandAnalysis}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/20 text-[11px] text-slate-400 font-mono rounded-lg flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Peter uses the computer to view actual outcomes on the field. On-base percentage is correlated to runs scored. Hits are overvalued; walks are cheap.</span>
                      </div>
                    </div>
                  )}

                  {activeSpeaker === 'beane' && (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-mono font-bold text-yellow-400">BILLY BEANE DECIDES:</span>
                      </div>
                      <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl leading-relaxed text-sm text-slate-200 relative">
                        <div className="absolute -top-2 left-6 px-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] font-mono text-yellow-400">
                          EXECUTIVE DECISION
                        </div>
                        <p className="font-sans text-lg font-bold tracking-tight text-white leading-snug">
                          {verdict.beaneVerdict}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-950/20 border border-amber-900/20 text-[11px] text-slate-400 font-mono rounded-lg flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Billy's decision is final. We bypass scout logic, trust Peter's mathematics, and execute contract layouts. Done deal.</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Speaker guidance selector bottom bar */}
                <div className="border-t border-slate-850 pt-4 mt-6 flex justify-between items-center text-xs font-mono text-slate-400 select-none">
                  <span>Toggle characters in left panel to hear opposing reports.</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveSpeaker(activeSpeaker === 'scout' ? 'brand' : activeSpeaker === 'brand' ? 'beane' : 'scout')}
                      className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-705 rounded hover:bg-slate-755 hover:text-white"
                    >
                      Next Aspect →
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
