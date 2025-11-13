import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { 
  Coins, 
  Sparkles, 
  Trophy,
  Zap,
  ArrowLeft,
  Play
} from "lucide-react";

type SymbolType = "cherry" | "lemon" | "orange" | "plum" | "grape" | "watermelon" | "seven" | "bar" | "wild";

interface ReelSymbol {
  type: SymbolType;
  position: number;
  isWild: boolean;
}

const SYMBOL_EMOJIS: Record<SymbolType, string> = {
  cherry: "🍒",
  lemon: "🍋",
  orange: "🍊",
  plum: "🍑",
  grape: "🍇",
  watermelon: "🍉",
  seven: "7️⃣",
  bar: "💎",
  wild: "⭐",
};

export default function MatchThree() {
  const [betAmount, setBetAmount] = useState(50);
  const [roundId, setRoundId] = useState<string | null>(null);
  const [activeReels, setActiveReels] = useState(3);
  const [reels, setReels] = useState<ReelSymbol[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [totalWin, setTotalWin] = useState(0);
  const [currentJackpot, setCurrentJackpot] = useState(0);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [freeSpinsMultiplier, setFreeSpinsMultiplier] = useState(1);
  const [, setLocation] = useLocation();

  const { data: statsData, refetch: refetchStats } = trpc.game.getStats.useQuery();
  const startRoundMutation = trpc.matchThree.startRound.useMutation();
  const spinMutation = trpc.matchThree.spin.useMutation();

  const balance = statsData?.balance || 0;
  const betOptions = [10, 25, 50, 100, 250, 500];

  // Redirect to shop if balance is insufficient
  useEffect(() => {
    if (statsData && balance < betAmount && !roundId) {
      toast.error(`Insufficient balance! You need at least ${betAmount} coins. Redirecting to shop...`);
      setTimeout(() => {
        localStorage.setItem('returnAfterPurchase', '/match-three');
        setLocation("/shop");
      }, 2000);
    }
  }, [balance, betAmount, statsData, setLocation, roundId]);

  const startGame = async () => {
    if (balance < betAmount) {
      toast.error("Insufficient balance!");
      return;
    }

    try {
      const result = await startRoundMutation.mutateAsync({ betAmount });
      setRoundId(result.roundId);
      setActiveReels(result.activeReels || 3);
      setReels([]);
      setTotalWin(0);
      refetchStats();
      toast.success("Game started! Click Spin to play!");
    } catch (error: any) {
      toast.error(error.message || "Failed to start game");
    }
  };

  const performSpin = async () => {
    if (!roundId) {
      toast.error("Please start a game first!");
      return;
    }

    setIsSpinning(true);

    try {
      // Show spinning animation
      const spinningReels: ReelSymbol[][] = Array.from({ length: 6 }, () =>
        Array.from({ length: 3 }, (_, i) => ({
          type: "wild" as SymbolType,
          position: i,
          isWild: false,
        }))
      );
      setReels(spinningReels);

      const result = await spinMutation.mutateAsync({
        roundId,
      });

      // Animate reels reveal
      setTimeout(() => {
        setReels(result.reels);
        setIsSpinning(false);

        // Update jackpot display
        if (result.currentJackpot !== undefined) {
          setCurrentJackpot(result.currentJackpot);
        }

        // Check for jackpot win
        if (result.jackpotWon && result.jackpotWon > 0) {
          toast.success(`🎉 JACKPOT! You won ${result.jackpotWon} coins!`, { duration: 10000 });
          setTotalWin(prev => prev + result.jackpotWon!);
        }

        // Check for free spins trigger
        if (result.freeSpinsTriggered) {
          toast.success(`🎁 FREE SPINS! You got ${result.freeSpinsRemaining} free spins with ${result.freeSpinsMultiplier}x multiplier!`, { duration: 5000 });
        }

        // Update free spins state
        if (result.freeSpinsRemaining !== undefined) {
          setFreeSpinsRemaining(result.freeSpinsRemaining);
        }
        if (result.inFreeSpins !== undefined) {
          setInFreeSpins(result.inFreeSpins);
        }
        if (result.freeSpinsMultiplier !== undefined) {
          setFreeSpinsMultiplier(result.freeSpinsMultiplier);
        }

        // Update total win
        if (result.totalWin > 0) {
          setTotalWin(prev => prev + result.totalWin);
          toast.success(`You won ${result.totalWin} coins!`, {
            icon: "💰",
            duration: 3000,
          });
        }

        // Check for wild expansion
        if (result.wildTriggered && result.newActiveReels) {
          setActiveReels(result.newActiveReels);
          toast.success(`⭐ Wild triggered! Expanded to ${result.newActiveReels} reels!`, {
            icon: "⭐",
            duration: 3000,
          });
        }

        refetchStats();
      }, 1500);
    } catch (error: any) {
      setIsSpinning(false);
      toast.error(error.message || "Spin failed");
    }
  };

  const endGame = async () => {
    if (totalWin > 0) {
      toast.success(`Game ended! Total win: ${totalWin} coins`, {
        icon: "🎉",
        duration: 5000,
      });
    } else {
      toast.info("Game ended. Better luck next time!");
    }
    
    // Reset game state
    setRoundId(null);
    setReels([]);
    setActiveReels(3);
    setTotalWin(0);
    setFreeSpinsRemaining(0);
    setInFreeSpins(false);
    setFreeSpinsMultiplier(1);
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="border-b border-white/20 bg-black/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Match Three</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/50 border border-white/20">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">{balance}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Game Info */}
          <Card className="bg-black/40 border-white/20 p-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Expanding Reels Slot
              </h2>
              <p className="text-white/70">
                Start with 3 reels and expand up to 6 reels with Wild symbols!
              </p>
            </div>
          </Card>

          {/* Progressive Jackpot Banner */}
          {currentJackpot > 0 && (
            <Card className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 border-yellow-400 p-4 text-center animate-pulse">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <div className="text-sm font-semibold text-white/90">PROGRESSIVE JACKPOT</div>
                  <div className="text-4xl font-bold text-white">{currentJackpot.toLocaleString()} coins</div>
                  <div className="text-xs text-white/80">Win 6 Bar symbols (💎) to claim!</div>
                </div>
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </Card>
          )}

          {/* Free Spins Banner */}
          {inFreeSpins && freeSpinsRemaining > 0 && (
            <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 border-pink-400 p-4 text-center">
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <div>
                  <div className="text-lg font-bold text-white">FREE SPINS ACTIVE!</div>
                  <div className="text-2xl font-bold text-white">{freeSpinsRemaining} spins remaining</div>
                  <div className="text-sm text-white/90">{freeSpinsMultiplier}x Multiplier</div>
                </div>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-black/40 border-white/20 p-4 text-center">
              <div className="text-sm text-white/70">Active Reels</div>
              <div className="text-3xl font-bold text-blue-400">{activeReels}/6</div>
            </Card>
            <Card className="bg-black/40 border-white/20 p-4 text-center">
              <div className="text-sm text-white/70">Current Win</div>
              <div className="text-3xl font-bold text-green-400">{totalWin}</div>
            </Card>
            <Card className="bg-black/40 border-white/20 p-4 text-center">
              <div className="text-sm text-white/70">Bet Amount</div>
              <div className="text-3xl font-bold text-yellow-400">{betAmount}</div>
            </Card>
          </div>

          {/* Slot Machine */}
          <Card className="bg-gradient-to-br from-black/60 to-black/40 border-2 border-yellow-500/50 p-8">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 overflow-x-auto px-2">
              {Array.from({ length: 6 }).map((_, reelIndex) => (
                <div
                  key={reelIndex}
                  className={`flex flex-col gap-1 sm:gap-2 transition-all duration-500 ${
                    reelIndex < activeReels ? 'opacity-100 scale-100' : 'opacity-30 scale-90'
                  }`}
                >
                  {Array.from({ length: 3 }).map((_, rowIndex) => {
                    const symbol = reels[reelIndex]?.[rowIndex];
                    const emoji = symbol ? SYMBOL_EMOJIS[symbol.type] : "❓";
                    
                    return (
                      <div
                        key={rowIndex}
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center text-3xl sm:text-4xl font-bold transition-all ${
                          isSpinning 
                            ? 'animate-spin bg-gradient-to-br from-purple-600 to-blue-600' 
                            : symbol?.isWild
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 animate-pulse'
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        } ${reelIndex >= activeReels ? 'grayscale' : ''}`}
                      >
                        {isSpinning ? "🎰" : emoji}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {!roundId ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-white/70 mb-2 block">
                      Select Bet Amount
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {betOptions.map((bet) => (
                        <Button
                          key={bet}
                          variant={betAmount === bet ? "default" : "outline"}
                          onClick={() => setBetAmount(bet)}
                          className={betAmount === bet ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        >
                          {bet}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full text-xl font-bold h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={startGame}
                    disabled={balance < betAmount}
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Start Game ({betAmount} coins)
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    size="lg"
                    className="text-xl font-bold h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={performSpin}
                    disabled={isSpinning}
                  >
                    <Zap className="w-6 h-6 mr-2" />
                    {isSpinning ? "Spinning..." : inFreeSpins ? `Free Spin (${freeSpinsRemaining} left)` : "Spin"}
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="text-xl font-bold h-16"
                    onClick={endGame}
                    disabled={isSpinning}
                  >
                    End Game
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* How to Play */}
          <Card className="bg-black/40 border-white/20 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              How to Play
            </h3>
            <ul className="space-y-2 text-white/80">
              <li>• Start with 3 active reels and 3 rows</li>
              <li>• Match 3 or more symbols in a row to win</li>
              <li>• Wild symbols (⭐) expand the reels (up to 6 reels)</li>
              <li>• 3+ Wilds trigger 10 Free Spins with 2x multiplier</li>
              <li>• Win 6 Bar symbols (💎) to claim the Progressive Jackpot!</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
