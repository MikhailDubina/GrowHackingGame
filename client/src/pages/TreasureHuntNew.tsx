import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import { 
  Coins, 
  Sparkles, 
  Compass, 
  Map, 
  Radar,
  Trophy,
  Skull,
  Gift,
  Gem,
  Zap,
  Clock,
  ArrowLeft
} from "lucide-react";

type Difficulty = "easy" | "medium" | "hard";
type PowerUpType = "metal_detector" | "treasure_map" | "magic_compass";
type CellType = "empty" | "trap" | "small_treasure" | "medium_treasure" | "big_treasure" | "jackpot";
type CellState = "hidden" | "revealed" | "safe_hint" | "danger_hint";

interface Cell {
  x: number;
  y: number;
  type: CellType;
  state: CellState;
  value: number;
}

const DIFFICULTY_INFO = {
  easy: {
    name: "Easy",
    entryCost: 0,
    maxMoves: 15,
    rtp: "96.75%",
    color: "bg-green-500",
  },
  medium: {
    name: "Medium",
    entryCost: 5,
    maxMoves: 10,
    rtp: "94.49%",
    color: "bg-yellow-500",
  },
  hard: {
    name: "Hard",
    entryCost: 10,
    maxMoves: 7,
    rtp: "94.67%",
    color: "bg-red-500",
  },
};

const POWER_UPS = {
  metal_detector: {
    name: "Metal Detector",
    cost: 50,
    description: "Reveals 3 safe cells",
    icon: Radar,
  },
  treasure_map: {
    name: "Treasure Map",
    cost: 100,
    description: "Opens 2 safe cells automatically",
    icon: Map,
  },
  magic_compass: {
    name: "Magic Compass",
    cost: 150,
    description: "Shows direction to nearest treasure",
    icon: Compass,
  },
};

export default function TreasureHuntNew() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [betAmount, setBetAmount] = useState(100);
  const [gameActive, setGameActive] = useState(false);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [currentPayout, setCurrentPayout] = useState(0);
  const [movesRemaining, setMovesRemaining] = useState(0);
  const [showPowerUpDialog, setShowPowerUpDialog] = useState(false);
  const [gameResult, setGameResult] = useState<{ won: boolean; payout: number } | null>(null);

  // tRPC queries and mutations
  const { data: attemptsData, refetch: refetchAttempts } = trpc.game.getAttempts.useQuery();
  const { data: statsData, refetch: refetchStats } = trpc.game.getStats.useQuery();
  const startRoundMutation = trpc.game.startRound.useMutation();
  const makeMoveMutation = trpc.game.makeMove.useMutation();
  const cashOutMutation = trpc.game.cashOut.useMutation();
  const usePowerUpMutation = trpc.game.usePowerUp.useMutation();

  const balance = statsData?.balance || 0;
  const attemptsRemaining = attemptsData?.totalAvailable || 0;
  const [usedPowerUps, setUsedPowerUps] = useState<PowerUpType[]>([]);
  const [, setLocation] = useLocation();

  // Redirect to shop if balance is insufficient
  useEffect(() => {
    const entryCost = DIFFICULTY_INFO[difficulty].entryCost;
    if (statsData && balance < entryCost && entryCost > 0) {
      toast.error(`Insufficient balance! You need at least ${entryCost} coins. Redirecting to shop...`);
      setTimeout(() => {
        // Save current page to return after purchase
        localStorage.setItem('returnAfterPurchase', '/treasure-hunt');
        setLocation("/shop");
      }, 2000);
    }
  }, [balance, difficulty, statsData, setLocation]);

  const startGame = async () => {
    const entryCost = DIFFICULTY_INFO[difficulty].entryCost;
    // For easy mode, betAmount should be 0
    const actualBetAmount = difficulty === 'easy' ? 0 : betAmount;
    const totalCost = actualBetAmount + entryCost;
    
    // Allow Easy level even with 0 balance (it's free)
    if (entryCost > 0 && balance < totalCost) {
      toast.error(`Insufficient balance! You need at least ${totalCost} coins.`);
      return;
    }

    if (attemptsRemaining <= 0) {
      toast.error("No attempts remaining! Wait for daily reset or purchase more.");
      return;
    }

    try {
      const result = await startRoundMutation.mutateAsync({
        difficulty,
        betAmount: actualBetAmount,
      });

      setRoundId(result.roundId);
      setGameActive(true);
      setMovesRemaining(result.maxMoves);
      setCurrentPayout(0);
      setGameResult(null);
      setUsedPowerUps([]);

      // Initialize empty grid (cells will be revealed as player clicks)
      const emptyGrid: Cell[][] = [];
      for (let y = 0; y < result.gridSize; y++) {
        const row: Cell[] = [];
        for (let x = 0; x < result.gridSize; x++) {
          row.push({
            x,
            y,
            type: "empty",
            state: "hidden",
            value: 0,
          });
        }
        emptyGrid.push(row);
      }
      setGrid(emptyGrid);

      refetchStats();
      refetchAttempts();
      toast.success(`Game started! ${result.maxMoves} moves available.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!gameActive || !roundId) return;

    const cell = grid[y][x];
    if (cell.state === "revealed") {
      toast.info("Cell already revealed!");
      return;
    }

    try {
      const result = await makeMoveMutation.mutateAsync({
        roundId,
        x,
        y,
      });

      // Update grid with revealed cell
      const newGrid = [...grid];
      newGrid[y][x] = result.cell;
      setGrid(newGrid);

      setCurrentPayout(result.currentPayout);
      setMovesRemaining(result.movesRemaining);

      // If game is over, show result for a brief moment before resetting
      if (result.gameOver) {
        setTimeout(() => {
          // This will trigger a re-render and show the initial state
          // The game state will be reset by the startRound logic implicitly
          // when a new game is started, or explicitly if we navigate away.
          // For now, just let the state update and the component re-render.
        }, 1000); // 1 second delay to show the last revealed cell
      }

      if (result.gameOver) {
        setGameActive(false);
        setGameResult({
          won: result.status === "won" || result.status === "cashout",
          payout: result.payout,
        });
        refetchStats();
        refetchAttempts();

        if (result.status === "lost") {
          toast.error(result.message);
        } else {
          toast.success(result.message);
        }
      } else {
        if (result.cell.value > 0) {
          toast.success(`Found treasure worth ${result.cell.value} coins!`);
        } else {
          toast.info("Safe cell");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to make move");
    }
  };

  const handleCashOut = async () => {
    if (!roundId || !gameActive) return;

    try {
      const result = await cashOutMutation.mutateAsync({ roundId });
      
      setGameActive(false);
      setGameResult({
        won: true,
        payout: result.payout,
      });
      refetchStats();
      toast.success(`Cashed out! Won ${result.payout} coins`);
    } catch (error: any) {
      toast.error(error.message || "Failed to cash out");
    }
  };

  const handleUsePowerUp = async (powerUpType: PowerUpType) => {
    if (!roundId || !gameActive) return;

    try {
      const result = await usePowerUpMutation.mutateAsync({
        roundId,
        powerUpType,
      });

      // Update grid with power-up effects
      setGrid(result.grid);
      setCurrentPayout(result.currentPayout);
      setUsedPowerUps([...usedPowerUps, powerUpType]);
      refetchStats();
      setShowPowerUpDialog(false);

      toast.success(`${POWER_UPS[powerUpType].name} activated! ${result.effect.description}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to use power-up");
    }
  };

  const getCellIcon = (cell: Cell) => {
    if (cell.state === "hidden") return null;
    if (cell.state === "safe_hint") return <Sparkles className="w-6 h-6 text-green-400" />;
    if (cell.state === "danger_hint") return <Skull className="w-6 h-6 text-red-400" />;

    switch (cell.type) {
      case "trap":
        return <Skull className="w-8 h-8 text-red-500" />;
      case "jackpot":
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case "big_treasure":
        return <Gem className="w-8 h-8 text-purple-400" />;
      case "medium_treasure":
        return <Gift className="w-8 h-8 text-blue-400" />;
      case "small_treasure":
        return <Coins className="w-8 h-8 text-green-400" />;
      default:
        return null;
    }
  };

  const getCellColor = (cell: Cell) => {
    if (cell.state === "hidden") return "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700";
    if (cell.state === "safe_hint") return "bg-gradient-to-br from-green-600 to-green-700";
    if (cell.state === "danger_hint") return "bg-gradient-to-br from-red-600 to-red-700";

    if (cell.type === "trap") return "bg-gradient-to-br from-red-700 to-red-900";
    if (cell.type === "jackpot") return "bg-gradient-to-br from-yellow-500 to-yellow-700";
    if (cell.type === "big_treasure") return "bg-gradient-to-br from-purple-600 to-purple-800";
    if (cell.type === "medium_treasure") return "bg-gradient-to-br from-blue-600 to-blue-800";
    if (cell.type === "small_treasure") return "bg-gradient-to-br from-green-600 to-green-800";
    
    return "bg-gradient-to-br from-slate-600 to-slate-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="bg-slate-800/50 border-slate-700 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Treasure Hunt
          </h1>
          <p className="text-xl text-slate-300">
            Uncover treasures, avoid traps, and win big!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-slate-400">Balance</p>
                <p className="text-2xl font-bold">{balance}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-slate-400">Attempts</p>
                <p className="text-2xl font-bold">{attemptsRemaining}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-slate-400">Total Wins</p>
                <p className="text-2xl font-bold">{statsData?.stats.totalWins || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-slate-400">Win Streak</p>
                <p className="text-2xl font-bold">{statsData?.stats.currentWinStreak || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Controls */}
        {!gameActive && (
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Start New Game</h2>
            
            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-4">
                {(Object.keys(DIFFICULTY_INFO) as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      difficulty === diff
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${DIFFICULTY_INFO[diff].color} mx-auto mb-2`} />
                    <p className="font-bold">{DIFFICULTY_INFO[diff].name}</p>
                    <p className="text-sm text-slate-400">Entry: {DIFFICULTY_INFO[diff].entryCost} coins</p>
                    <p className="text-sm text-slate-400">{DIFFICULTY_INFO[diff].maxMoves} moves</p>
                    <p className="text-xs text-green-400">RTP: {DIFFICULTY_INFO[diff].rtp}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Bet Amount</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={10}
                  max={10000}
                  step={10}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
                <div className="flex gap-2">
                  {[50, 100, 250, 500].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      variant="outline"
                      size="sm"
                    >
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Total cost: {betAmount + DIFFICULTY_INFO[difficulty].entryCost} coins
              </p>
            </div>

            <Button
              onClick={startGame}
              disabled={startRoundMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6"
            >
              {startRoundMutation.isPending ? "Starting..." : "Start Game"}
            </Button>
          </Card>
        )}

        {/* Active Game */}
        {gameActive && grid.length > 0 && (
          <div className="space-y-6">
            {/* Game Info */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-400">Current Payout</p>
                  <p className="text-3xl font-bold text-green-400">{currentPayout} coins</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Moves Remaining</p>
                  <p className="text-3xl font-bold">{movesRemaining}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowPowerUpDialog(true)}
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Power-Ups
                  </Button>
                  <Button
                    onClick={handleCashOut}
                    disabled={currentPayout === 0 || cashOutMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Cash Out
                  </Button>
                </div>
              </div>
            </Card>

            {/* Game Grid */}
            <div className="flex justify-center">
              <div className="grid grid-cols-5 gap-2 p-4 bg-slate-800/30 rounded-xl">
                {grid.map((row, y) =>
                  row.map((cell, x) => (
                    <button
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      disabled={cell.state !== "hidden" || makeMoveMutation.isPending}                      className={`w-20 h-20 rounded-lg ${getCellColor(cell)} \n                        flex items-center justify-center transition-all transform transition-colors duration-300 transition-colors duration-300\n                        ${cell.state === "hidden" ? "hover:scale-105 cursor-pointer" : "cursor-default"}\n                        ${makeMoveMutation.isPending ? "opacity-50" : ""}\n                      `}                  >
                      {getCellIcon(cell)}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Game Result */}
        {gameResult && (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <div className="mb-4">
              {gameResult.won ? (
                <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
              ) : (
                <Skull className="w-20 h-20 text-red-400 mx-auto" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {gameResult.won ? "You Won!" : "Game Over"}
            </h2>
            <p className="text-xl text-slate-300 mb-4">
              Payout: <span className="text-green-400 font-bold">{gameResult.payout} coins</span>
            </p>
            <Button
              onClick={() => {
                setGameResult(null);
                setGrid([]);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Play Again
            </Button>
          </Card>
        )}

        {/* Power-Ups Dialog */}
        <Dialog open={showPowerUpDialog} onOpenChange={setShowPowerUpDialog}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Power-Ups</DialogTitle>
              <DialogDescription className="text-slate-400">
                Use power-ups to gain an advantage in the game
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {(Object.keys(POWER_UPS) as PowerUpType[]).map((powerUpType) => {
                const powerUp = POWER_UPS[powerUpType];
                const Icon = powerUp.icon;
                return (
                  <Card key={powerUpType} className="bg-slate-700/50 border-slate-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-purple-400" />
                        <div>
                          <p className="font-bold">{powerUp.name}</p>
                          <p className="text-sm text-slate-400">{powerUp.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Cost</p>
                        <p className="font-bold text-yellow-400">{powerUp.cost} coins</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                      disabled={balance < powerUp.cost || usedPowerUps.includes(powerUpType) || usePowerUpMutation.isPending}
                      onClick={() => handleUsePowerUp(powerUpType)}
                    >
                      {usedPowerUps.includes(powerUpType) ? "Already Used" : usePowerUpMutation.isPending ? "Using..." : "Use Power-Up"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Reset Timer */}
        {attemptsData && (
          <Card className="bg-slate-800/50 border-slate-700 p-4 mt-8">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Clock className="w-4 h-4" />
              <p className="text-sm">
                Daily attempts reset in: {Math.floor(attemptsData.resetIn / 3600)}h{" "}
                {Math.floor((attemptsData.resetIn % 3600) / 60)}m
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

