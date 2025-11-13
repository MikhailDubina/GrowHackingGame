import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Coins, Info, TrendingUp, Shield, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Transparency() {
  const [betAmount, setBetAmount] = useState(50);
  const [gamesPlayed, setGamesPlayed] = useState(100);

  const winProbability = 0.25;
  const lossProbability = 0.75;
  
  const expectedWins = Math.round(gamesPlayed * winProbability);
  const expectedLosses = Math.round(gamesPlayed * lossProbability);
  const expectedWinnings = expectedWins * (betAmount * 2);
  const expectedLosses_amount = expectedLosses * betAmount;
  const netExpected = expectedWinnings - expectedLosses_amount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Gaming Platform</span>
          </div>

          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page Title */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold">Transparency & Fair Play</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We believe in complete transparency. Understand the mathematics behind our game and make informed decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Probability Chart */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Info className="w-6 h-6 text-primary" />
              Probability Theory
            </h2>

            {/* Pie Chart Visualization */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Loss segment (75%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="oklch(0.68 0.22 25)"
                    strokeWidth="40"
                    strokeDasharray={`${2 * Math.PI * 80 * 0.75} ${2 * Math.PI * 80}`}
                    className="opacity-80"
                  />
                  {/* Win segment (25%) */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="oklch(0.75 0.20 150)"
                    strokeWidth="40"
                    strokeDasharray={`${2 * Math.PI * 80 * 0.25} ${2 * Math.PI * 80}`}
                    strokeDashoffset={`-${2 * Math.PI * 80 * 0.75}`}
                    className="opacity-90"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">25/75</div>
                    <div className="text-sm text-muted-foreground">Win/Loss</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-chart-1/10 rounded-lg border border-chart-1/30">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-chart-1" />
                  <span className="font-semibold">Win</span>
                </div>
                <span className="text-2xl font-bold text-chart-1">25%</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-destructive" />
                  <span className="font-semibold">Loss</span>
                </div>
                <span className="text-2xl font-bold text-destructive">75%</span>
              </div>
            </div>
          </Card>

          {/* Fair Game Mathematics */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Fair Game Mathematics</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>The odds of winning are <strong className="text-foreground">1 in 4</strong></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Each game is independent - previous results don't affect future outcomes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Win payout is <strong className="text-foreground">2x</strong> your bet amount</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Results are generated using cryptographically secure random numbers</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Expected Value
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>For a bet of <strong className="text-foreground">X coins</strong>:</p>
                  <p className="pl-4">• Win: 25% chance of +2X coins</p>
                  <p className="pl-4">• Loss: 75% chance of -X coins</p>
                  <p className="mt-2">Expected value = (0.25 × 2X) + (0.75 × -X) = <strong className="text-destructive">-0.25X</strong></p>
                </div>
              </div>

              <div className="p-4 bg-chart-1/10 border border-chart-1/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <strong className="text-chart-1">Provably Fair:</strong>
                    <span className="text-muted-foreground ml-1">
                      All game results can be verified for fairness using cryptographic hashing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Interactive Calculator */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6">Interactive Probability Calculator</h2>
          <p className="text-muted-foreground mb-8">
            Adjust the parameters below to see expected outcomes over multiple games
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Bet Amount Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Bet Amount per Game</label>
                <span className="text-2xl font-bold text-primary">{betAmount}</span>
              </div>
              <Slider
                value={[betAmount]}
                onValueChange={(value) => setBetAmount(value[0])}
                min={10}
                max={200}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10</span>
                <span>200</span>
              </div>
            </div>

            {/* Games Played Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Number of Games</label>
                <span className="text-2xl font-bold text-primary">{gamesPlayed}</span>
              </div>
              <Slider
                value={[gamesPlayed]}
                onValueChange={(value) => setGamesPlayed(value[0])}
                min={10}
                max={1000}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10</span>
                <span>1000</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-2">Expected Wins</div>
              <div className="text-3xl font-bold text-chart-1">{expectedWins}</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-2">Expected Losses</div>
              <div className="text-3xl font-bold text-destructive">{expectedLosses}</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-2">Total Wagered</div>
              <div className="text-3xl font-bold">{(gamesPlayed * betAmount).toLocaleString()}</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg text-center border-2 border-primary">
              <div className="text-sm text-muted-foreground mb-2">Net Expected</div>
              <div className={`text-3xl font-bold ${netExpected >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
                {netExpected >= 0 ? '+' : ''}{netExpected.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <p className="text-sm text-center">
              <strong>Note:</strong> These are statistical expectations. Actual results may vary due to randomness. 
              Over a large number of games, results will converge toward these expected values.
            </p>
          </div>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link href="/game">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              Try Your Luck Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

