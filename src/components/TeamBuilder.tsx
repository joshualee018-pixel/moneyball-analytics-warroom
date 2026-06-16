import React from 'react';
import { Player } from '../types';
import { getPlayerImageUrl } from '../lib/images';
import { 
  Building, 
  DollarSign, 
  Layers, 
  Trash2, 
  User, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  CheckCircle, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface TeamBuilderProps {
  signedPlayers: Player[];
  budgetLimit: number;
  onRemovePlayer: (player: Player) => void;
  onTriggerTeamEvaluation: () => void;
}

export default function TeamBuilder({ 
  signedPlayers, 
  budgetLimit, 
  onRemovePlayer,
  onTriggerTeamEvaluation 
}: TeamBuilderProps) {
  
  // Calculate stats
  const totalSalary = signedPlayers.reduce((acc, p) => acc + p.salary, 0);
  const remainingBudget = budgetLimit - totalSalary;
  const isOverBudget = remainingBudget < 0;

  // Calculators for Team Averages
  const batters = signedPlayers.filter(p => p.type === 'batter');
  const pitchers = signedPlayers.filter(p => p.type === 'pitcher');

  const avgObp = batters.length > 0 
    ? batters.reduce((acc, p) => acc + p.obp, 0) / batters.length 
    : 0;

  const avgSlg = batters.length > 0 
    ? batters.reduce((acc, p) => acc + p.slg, 0) / batters.length 
    : 0;

  const avgOps = avgObp + avgSlg;

  // Positional Tracker Checklist
  const positionsRequired = [
    { key: 'First Base', label: '1B (First Base)', satisfies: (p: Player) => p.position === 'First Base' },
    { key: 'Second Base', label: '2B (Second Base)', satisfies: (p: Player) => p.position === 'Second Base' },
    { key: 'Third Base', label: '3B (Third Base)', satisfies: (p: Player) => p.position === 'Third Base' },
    { key: 'Shortstop', label: 'SS (Shortstop)', satisfies: (p: Player) => p.position === 'Shortstop' },
    { key: 'Outfield', label: 'OF (Outfield)', satisfies: (p: Player) => p.position === 'Outfield' },
    { key: 'Pitching', label: 'Pitchers', satisfies: (p: Player) => p.position.includes('Pitcher') }
  ];

  const positionalSatisfied = positionsRequired.map(pos => {
    const playersInPos = signedPlayers.filter(p => pos.satisfies(p));
    return {
      ...pos,
      count: playersInPos.length,
      isMet: playersInPos.length > 0
    };
  });

  const positionsMetCount = positionalSatisfied.filter(p => p.isMet).length;
  const allPositionsMet = positionsMetCount === positionsRequired.length;

  // Aggregate Replacements Tracker
  // In the film, they needed to replace Giambi (.477 OBP), Damon (.324 OBP), and Jeremy/Isring (0.330 OBP) -> Cumulative Target ~1.15 OBP
  const moneyballSigns = signedPlayers.filter(p => p.id === 'scott-hatteberg' || p.id === 'david-justice' || p.id === 'jeremy-giambi');
  const signedAggregateObp = moneyballSigns.reduce((acc, p) => acc + p.obp, 0);
  const targetAggregateObp = 1.129; // .362 (Hatteberg) + .376 (Justice) + .391 (Giambi)
  const AggregatePercent = Math.min(Math.round((signedAggregateObp / targetAggregateObp) * 100), 100);

  // Dynamic Pythagorean Win Projection formula:
  // Base wins is 65 (without a roster)
  // Each added player adds values or metrics
  // Average on-base raises wins
  let projectedWins = 65;
  if (batters.length > 0) {
    // Highly tailored sabermetrics rewards OBP heavily
    const obpBonus = (avgObp - 0.320) * 450; // Every 10 points above league avg (.320) adds 4.5 wins
    const slgBonus = (avgSlg - 0.400) * 150; // Every 10 points above league average adds 1.5 wins
    const rosterCompletenessBonus = (signedPlayers.length / 9) * 12; // Complete structure bonus
    const balanceMultiplier = allPositionsMet ? 12 : (positionsMetCount * 1.5);

    projectedWins = Math.round(65 + obpBonus + slgBonus + rosterCompletenessBonus + balanceMultiplier);
  }
  // Clamp boundaries
  projectedWins = Math.max(0, Math.min(116, projectedWins)); // baseball limit

  // Team value Index rating
  const teamWinsPerDollar = projectedWins > 0 && totalSalary > 0 
    ? (projectedWins / (totalSalary / 1000000)).toFixed(1) 
    : '0.0';

  return (
    <div id="team-builder-panel" className="space-y-6">
      
      {/* Upper stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Salary Status */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-2 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
            <span>TOTAL PAYROLL</span>
            <DollarSign className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className={`text-3.5xl font-mono font-bold tracking-tight ${
              isOverBudget ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              ${(totalSalary / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs text-gray-500">/ $40.00M limit</span>
          </div>

          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}
              style={{ width: `${Math.min((totalSalary / budgetLimit) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono pt-1">
            <span className="text-gray-500 uppercase tracking-tighter">Remaining Cap</span>
            <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-gray-300 font-bold'}>
              ${(remainingBudget / 1000000).toFixed(3)}M
            </span>
          </div>
        </div>

        {/* Win Projection */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-2 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
            <span>PROJECTED SEASON WINS</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className={`text-3.5xl font-mono font-bold tracking-tight terminal-glow ${
              projectedWins >= 95 ? 'text-emerald-400' : 'text-white'
            }`}>
              {projectedWins}
            </span>
            <span className="text-xs text-gray-500 uppercase">Wins</span>
          </div>

          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${projectedWins >= 95 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}
              style={{ width: `${Math.min((projectedWins / 116) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono pt-1">
            <span className="text-gray-500 uppercase tracking-tighter">Playoff Threshold</span>
            <span className="text-emerald-400 font-bold font-mono">95 Wins</span>
          </div>
        </div>

        {/* Team average OBP */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-2 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
            <span>TEAM AVERAGE OBP</span>
            <Layers className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3.5xl font-mono font-bold tracking-tight text-white">
              .{avgObp > 0 ? Math.round(avgObp * 1000) : '000'}
            </span>
            <span className="text-[11px] text-gray-500 font-mono">({avgObp.toFixed(3)})</span>
          </div>

          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-500"
              style={{ width: `${Math.min((avgObp / 0.400) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono pt-1">
            <span className="text-gray-500 uppercase tracking-tighter">Sabermetric Goal</span>
            <span className="text-emerald-400 font-bold">.340 OBP</span>
          </div>
        </div>

        {/* Wins per Dollar Efficiency */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-2 relative overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest font-mono">
            <span>TEAM BUDGET EFFICIENCY</span>
            <Coins className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3.5xl font-mono font-bold tracking-tight text-emerald-400">
              {teamWinsPerDollar}
            </span>
          </div>

          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min((parseFloat(teamWinsPerDollar) / 25) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono pt-1">
            <span className="text-gray-500 uppercase tracking-tighter">Wins per $1,000,000</span>
            <span className="text-gray-400">Yankees Avg: 0.77</span>
          </div>
        </div>

      </div>

      {/* Roster splits, Whiteboard aggregate & positions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Signed list - Left 8 columns */}
        <div className="lg:col-span-8 bg-[#0F0F12] border border-white/10 rounded-md overflow-hidden flex flex-col shadow-2xl">
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                Oakland Athletics Active Roster ({signedPlayers.length} signed)
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-tighter font-mono">
                Assembling walk capacity to reconstitute on-base percentage cheaply.
              </p>
            </div>
            
            <button
              onClick={onTriggerTeamEvaluation}
              disabled={signedPlayers.length === 0}
              className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:bg-[#1A1A1E] disabled:text-gray-500 disabled:border-transparent text-black font-semibold text-xs rounded-sm shadow-md hover:shadow-emerald-500/10 active:scale-95 transition-all uppercase tracking-widest border-b-2 border-emerald-700 font-mono font-bold"
            >
              RUN FRONT OFFICE EVALUATION
            </button>
          </div>

          {signedPlayers.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <User className="w-12 h-12 text-gray-700 mx-auto" />
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Your war room sandbox is vacant</p>
                <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">Select players from the catalog dropdown list above and click "Sign Player" to populate this workspace.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-widest text-[10px] bg-[#141418]/60">
                    <th className="py-3 px-4 font-bold">Player Name</th>
                    <th className="py-3 px-4 font-bold text-center">Pos Slot</th>
                    <th className="py-3 px-4 font-bold text-right text-emerald-400">OBP</th>
                    <th className="py-3 px-4 font-bold text-right text-gray-300">SLG</th>
                    <th className="py-3 px-4 font-bold text-right text-amber-500">Salary</th>
                    <th className="py-3 px-4 font-bold text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-[#141418]/10">
                  {signedPlayers.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 group transition-all duration-150">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#1A1A1E] border border-white/5 flex-shrink-0 overflow-hidden relative shadow-inner">
                            <img 
                              src={getPlayerImageUrl(p.id)} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{p.detailedPosition}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-[#1A1A1E] text-gray-400 border border-white/5 rounded-sm">
                          {p.position}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                        p.obp >= 0.360 ? 'text-emerald-400' : 'text-gray-300'
                      }`}>
                        .{Math.round(p.obp * 1000)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-400 font-mono">
                        .{Math.round(p.slg * 1000)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-amber-500 font-bold font-mono">
                        ${(p.salary / 1000000).toFixed(2)}M
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onRemovePlayer(p)}
                          className="p-1 px-2 border border-white/5 hover:border-rose-500/30 hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 rounded-sm transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Budget Warnings banner */}
          {isOverBudget && (
            <div className="m-4 mt-auto p-4 bg-[#2A1215]/50 border border-rose-500/20 text-rose-300 rounded-md flex items-start gap-3 shadow-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold font-mono uppercase tracking-wider">OAKLAND BUDGET CRISIS!</p>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                  You are over budget. Stephen Schott is screaming down the hallway: <span className="italic">"We are a small-market club! Try reproducing the numbers without these overpriced superstars. Make modifications!"</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Positional trackers & chalkboard metrics - Right 4 columns */}
        <div className="lg:col-span-4 space-y-6">

          {/* Chalkboard: Recreating Giambi in the Aggregate */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Moneyball Aggregate Whiteboard
            </h3>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              Damon and Giambi walked out. We can't buy superstars. But we can replicate Giambi's massive, walk-heavy stats by stacking 3 under-market assets (Hatteberg + Justice + J. Giambi):
            </p>

            <div className="bg-[#141418] p-4 border border-white/5 rounded-md space-y-3 shadow-md">
              <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                <span className="uppercase text-[9px] font-bold text-gray-500">REPLACEMENT TARGET</span>
                <span className="text-emerald-400 font-bold">1.129 OBP</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-gray-500">
                  <span className="uppercase text-[9px] font-bold">Current Roster Signs</span>
                  <span>{signedAggregateObp.toFixed(3)} OBP</span>
                </div>
                <div className="w-full bg-black/40 h-1.5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${AggregatePercent}%` }}
                  />
                </div>
              </div>

              <div className="text-[10px] text-gray-400 font-mono leading-relaxed pt-1 border-t border-white/5">
                {AggregatePercent < 50 ? (
                  "❌ Whiteboard empty. Seek Scott Hatteberg, David Justice, and Jeremy Giambi."
                ) : AggregatePercent < 100 ? (
                  "⚡ Progressing. Grab the remaining core Moneyball targets to complete the loop!"
                ) : (
                  "🏆 SUCCESS: Giambi's on-base percentage reconstituted in the aggregate! Art Howe is crying."
                )}
              </div>
            </div>
          </div>

          {/* Positional Checklists */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-md p-5 space-y-4 shadow-2xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">
              Defensive alignment check
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We need a complete functional team to protect defensive margins. Wins increment when rosters cover all defensive bases.
            </p>

            <div className="grid grid-cols-1 gap-2 font-mono text-xs">
              {positionalSatisfied.map(pos => (
                <div key={pos.key} className="flex items-center justify-between p-2.5 bg-[#141418] border border-white/5 rounded-sm shadow-sm">
                  <span className="text-gray-300 font-bold text-[10px] uppercase tracking-wider">{pos.label}</span>
                  <div className="flex items-center gap-1.5">
                    {pos.isMet ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                        <CheckCircle className="w-3.5 h-3.5" /> MET ({pos.count})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-500/5 border border-white/5 px-2 py-0.5 rounded-sm uppercase tracking-tighter">
                        <AlertCircle className="w-3.5 h-3.5 text-gray-650" /> VACANT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Complete team prompt */}
            {allPositionsMet ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm text-center text-[11px] font-mono shadow-sm">
                🏆 ROSTER VALIDATED: Complete layout has unlocked the +12 Wins chemistry multiplier!
              </div>
            ) : (
              <div className="p-3 bg-slate-950 border border-white/5 text-gray-500 rounded-sm text-center text-[10px] font-mono flex items-center justify-center gap-1 uppercase tracking-tight">
                <HelpCircle className="w-3.5 h-3.5" /> Complete all 6 slots to unlock chemistry bonus
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
