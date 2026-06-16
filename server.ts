import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with recommended settings
// Note: process.env.GEMINI_API_KEY is automatically injected in AI Studio.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint to evaluate a player or a full team roster
app.post('/api/moneyball/evaluate', async (req, res) => {
  const { player, team, scenario } = req.body;

  try {
    let prompt = '';
    
    if (player) {
      prompt = `
You are in the Oakland Athletics Front Office war room in 2002.
We are analyzing player "${player.name}" who plays "${player.detailedPosition}".
Player Stats:
- Age: ${player.age}
- Salary: $${player.salary.toLocaleString()}
- On-Base Percentage (OBP): ${player.obp}
- Slugging Percentage (SLG): ${player.slg}
- On-Base Plus Slugging (OPS): ${player.ops}
- Batting Average (AVG): ${player.avg}
- Traditional Scout Notes: "${player.scoutNotes}"
- Sabermetric Notes: "${player.saberNotes}"
- Tag/Status: ${player.tag}

We need three perspectives on this player:
1. Traditional Scout (e.g. Grady Fuson, old-timer scout style): Evaluate based on physical look, swing posture, "good jawline", girlfriend confidence, attitude, and gut feelings. Complain about stats or weird methods if the player is unconventional. Keep it gritty, full of classic baseball slang.
2. Peter Brand (the Yale Economics graduate, Peter Brand/Paul DePodesta style): Pure sabermetric, objective utility valuation. Discuss cost-of-entry to purchase on-base percent, walk-efficiency ratio, why the league is undervaluation of him, and mathematical projection.
3. Billy Beane (General Manager): Snappy, sharp, executive ruling. Quick decisions, highly practical, hates traditional scouts' visual biases. E.g. "We are buying walks. He gets on base. Done." or "Forget his swing. Can he play first base? We'll teach him."
      `;
    } else if (team && scenario === 'yankees-series') {
      const { stats, outcome } = req.body;
      prompt = `
You are in the Oakland Athletics Front Office war room in 2002.
We just played an active simulated 3-game regular season series against our high-market rival, the New York Yankees ($125M payroll vs our $40M).
Simulation Matchup Outcome:
- Oakland Roster Assembled: ${team.playerNames.join(', ')}
- Series Result: ${outcome.oaklandWins} Wins, ${outcome.yankeeWins} Losses for Oakland. (A 3-game series result: ${outcome.oaklandWins}-${outcome.yankeeWins}).
- Oakland Runs Scored during series: ${outcome.oaklandTotalRuns}, Yankee Runs Scored: ${outcome.yankeeTotalRuns}
- Oakland Team Avg OBP: ${stats.averageObp}
- Oakland Team Avg SLG: ${stats.averageSlg}

We need three perspectives on this simulation:
1. Traditional Scout (Grady Fuson style): Gritty physical reaction. If Oakland won, claim it's all an athletic fluke or statistical error because "there is no way Scott Hatteberg can stretch for a ball in October." If Oakland lost, brag that spreadsheets don't hit home runs and that Yankee money buying guys with raw power is the only way to win baseball.
2. Peter Brand (Yale Eco style): Objective statistical breakdown. Highlight whether our .340+ target OBP generated enough run capacity to keep pace with the Yankees' stars. Point out the statistical cost-per-win efficiency.
3. Billy Beane (General Manager): Snap executive response. High energy, highly competitive. If we beat them, grab a baseball bat and scream: "They're paying $120 million more than us, and the computer just beat them for pocket change!" If we lost, smash a dynamic quote about getting back to the drawing board and filtering for more walks. Let's go.
      `;
    } else if (team) {
      prompt = `
You are in the Oakland Athletics Front Office war room in 2002.
We are analyzing an assembled player roster.
Roster Stats:
- Selected Players: ${team.playerNames.join(', ')}
- Total Budget Left: $${team.budgetRemaining.toLocaleString()} of $${team.budgetLimit.toLocaleString()} limit
- Total Team Salary: $${team.totalSalary.toLocaleString()}
- Team Average OBP (On-Base Pct): ${team.averageObp}
- Team Average SLG (Slugging Pct): ${team.averageSlg}
- Team Average OPS: ${team.averageOps}
- Projected Regular Season Wins: ${team.projectedWins}

Context:
We are trying to compete with the New York Yankees ($125M budget) on our tiny $40M budget. We need 95 wins to make the playoffs.

We need three perspectives on this overall team configuration:
1. Traditional Scout (Grady Fuson style): Panic or praise this team based on classic baseball logic. If there are cheap, weird players like Hatteberg or Bradford on first base/pitching, scream about how it is a circus, we won't sell tickets, and we're ruinous to baseball.
2. Peter Brand (Yale Eco style): Discuss the statistical viability of this cluster. Does the roster average OBP meet or exceed our targets (.340+)? Discuss the mathematical efficiency of wins per dollar spent.
3. Billy Beane (General Manager): Sharp, executive ruling on the team. Motivate the guys, declare trades, tell the manager Art Howe to play them, and summarize if we can beat the Yankees with this squad.
      `;
    } else {
      prompt = 'Provide a brief summary of how Oakland Athletics used on-base percentage to change baseball in 2002.';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert on the movie 'Moneyball' and baseball history. You write highly thematic, immersive dialogue representing baseball scouts, Billy Beane, and Peter Brand. Never break character. Note: The user might have introduced modern active superstars (like Shohei Ohtani, Aaron Judge, Paul Skenes, Steven Kwan) into our 2002 sandbox world. Treat them according to character biases: Traditional Scout hates modern launch angle obsession, complains about modern tattoos or high salaries, thinks Paul Skenes is just speed with no grit; Peter Brand is in heaven analyzing modern walk disciplines, deferred luxury-tax constructs, and pre-arbitration bargains like Paul Skenes or Steven Kwan; Billy Beane is rapid-fire, insanely curious about Ohtani's dual-threat metrics, but refuses to overpay for Judge's contract size unless we can buy it in cheap pieces.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoutCommentary: {
              type: Type.STRING,
              description: "Gritty traditional feedback with old-timer baseball scouting biases (unpleasant, visual, looks, biomechanics, guts)."
            },
            brandAnalysis: {
              type: Type.STRING,
              description: "Yale econ analytical wisdom focusing on the math, under-valued assets, cost-per-on-base unit, and statistics."
            },
            beaneVerdict: {
              type: Type.STRING,
              description: "Billy Beane's rapid fire, sharp executive verdict decision."
            }
          },
          required: ['scoutCommentary', 'brandAnalysis', 'beaneVerdict']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    res.json(result);
  } catch (error: any) {
    console.error('Error generating Sabermetric evaluation:', error);
    res.status(500).json({
      scoutCommentary: "He looks okay, I guess, but my gut tells me something is off. This system doesn't know baseball. (Error contacting Scout)",
      brandAnalysis: `Warning: Sabermetric system failure. Mathematical validation interrupted. Details: ${error.message}`,
      beaneVerdict: "System is stalling. Find me another player that gets on base while we fix the computer."
    });
  }
});

// Serve health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Set up Vite or static serving based on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Moneyball Server running on port ${PORT}`);
  });
}

startServer();
