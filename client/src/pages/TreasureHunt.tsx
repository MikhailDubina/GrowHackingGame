import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Coins, 
  TrendingUp, 
  Sparkles, 
  Compass, 
  Map, 
  Radar,
  Trophy,
  Skull,
  Gift,
  Gem
} from "lucide-react";

type TileType = "hidden" | "treasure_gold" | "treasure_silver" | "treasure_bronze" | "trap";
type Difficulty = "easy" | "medium" | "hard";
type PowerUp = "detector" | "map" | "compass";

interface Tile {
  id: number;
  type: TileType;
  revealed: boolean;
  row: number;
  col: number;
}

interface GameConfig {
  traps: number;
  goldTreasures: number;
  silverTreasures: number;
  bronzeTreasures: number;
  goldMultiplier: number;
  silverMultiplier: number;
  bronzeMultiplier: number;
}

const DIFFICULTY_CONFIG: Record<Difficulty, GameConfig> = {
  easy: {
    traps: 3,
    goldTreasures: 3,
    silverTreasures: 5,
    bronzeTreasures: 7,
    goldMultiplier: 3,
    silverMultiplier: 1.5,
    bronzeMultiplier: 0.8,
  },
  medium: {
    traps: 5,
    goldTreasures: 4,
    silverTreasures: 5,
    bronzeTreasures: 6,
    goldMultiplier: 4,
    silverMultiplier: 2,
    bronzeMultiplier: 1,
  },
  hard: {
    traps: 8,
    goldTreasures: 5,
    silverTreasures: 4,
    bronzeTreasures: 3,
    goldMultiplier: 6,
    silverMultiplier: 3,
    bronzeMultiplier: 1.5,
  },
};

const POWER_UP_COSTS = {
  detector: 100,
  map: 200,
  compass: 300,
};

export default function TreasureHunt() {
  const [balance, setBalance] = useState(5000);
  const [bet, setBet] = useState(100);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [currentWin, setCurrentWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [usedPowerUps, setUsedPowerUps] = useState<PowerUp[]>([]);

  const config = DIFFICULTY_CONFIG[difficulty];

  const initializeGame = () => {
    const newTiles: Tile[] = [];
    const positions: number[] = [];

    // Create all positions
    for (let i = 0; i < 25; i++) {
      positions.push(i);
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let posIndex = 0;

    // Place traps
    for (let i = 0; i < config.traps; i++) {
      const pos = positions[posIndex++];
      newTiles.push({
        id: pos,
        type: "trap",
        revealed: false,
        row: Math.floor(pos / 5),
        col: pos % 5,
      });
    }

    // Place gold treasures
    for (let i = 0; i < config.goldTreasures; i++) {
      const pos = positions[posIndex++];
      newTiles.push({
        id: pos,
        type: "treasure_gold",
        revealed: false,
        row: Math.floor(pos / 5),
        col: pos % 5,
      });
    }

    // Place silver treasures
    for (let i = 0; i < config.silverTreasures; i++) {
      const pos = positions[posIndex++];
      newTiles.push({
        id: pos,
        type: "treasure_silver",
        revealed: false,
        row: Math.floor(pos / 5),
        col: pos % 5,
      });
    }

    // Place bronze treasures
    for (let i = 0; i < config.bronzeTreasures; i++) {
      const pos = positions[posIndex++];
      newTiles.push({
        id: pos,
        type: "treasure_bronze",
        revealed: false,
        row: Math.floor(pos / 5),
        col: pos % 5,
      });
    }

    // Fill remaining with hidden
    while (posIndex < 25) {
      const pos = positions[posIndex++];
      newTiles.push({
        id: pos,
        type: "hidden",
        revealed: false,
        row: Math.floor(pos / 5),
        col: pos % 5,
      });
    }

    // Sort by id
    newTiles.sort((a, b) => a.id - b.id);

    setTiles(newTiles);
    setGameActive(true);
    setCurrentWin(0);
    setMultiplier(1);
    setRevealedCount(0);
    setTreasuresFound(0);
    setGameOver(false);
    setWon(false);
    setUsedPowerUps([]);
    setBalance(balance - bet);
  };

  const revealTile = (tileId: number) => {
    if (!gameActive || gameOver) return;

    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.revealed) return;

    const newTiles = tiles.map(t => {
      if (t.id === tileId) {
        return { ...t, revealed: true };
      }
      return t;
    });

    setTiles(newTiles);
    setRevealedCount(revealedCount + 1);

    if (tile.type === "trap") {
      // Hit a trap - game over
      setGameOver(true);
      setWon(false);
      toast.error("💥 Trap! You lost this round.");
    } else if (tile.type.startsWith("treasure_")) {
      // Found treasure
      let treasureWin = 0;
      let newMultiplier = multiplier;

      if (tile.type === "treasure_gold") {
        treasureWin = bet * config.goldMultiplier;
        newMultiplier += config.goldMultiplier;
        toast.success(`🏆 Gold Treasure! +${treasureWin} coins`);
      } else if (tile.type === "treasure_silver") {
        treasureWin = bet * config.silverMultiplier;
        newMultiplier += config.silverMultiplier;
        toast.success(`💎 Silver Treasure! +${treasureWin} coins`);
      } else if (tile.type === "treasure_bronze") {
        treasureWin = bet * config.bronzeMultiplier;
        newMultiplier += config.bronzeMultiplier;
        toast.success(`🎁 Bronze Treasure! +${treasureWin} coins`);
      }

      setCurrentWin(currentWin + treasureWin);
      setMultiplier(newMultiplier);
      setTreasuresFound(treasuresFound + 1);

      // Check if all treasures found
      const totalTreasures = config.goldTreasures + config.silverTreasures + config.bronzeTreasures;
      if (treasuresFound + 1 >= totalTreasures) {
        setGameOver(true);
        setWon(true);
        setBalance(balance + currentWin + treasureWin);
        toast.success(`🎉 All treasures found! You won ${currentWin + treasureWin} coins!`);
      }
    }
  };

  const cashOut = () => {
    if (!gameActive || gameOver || currentWin === 0) return;

    setBalance(balance + currentWin);
    setGameOver(true);
    setWon(true);
    setGameActive(false);
    toast.success(`💰 Cashed out ${currentWin} coins!`);
  };

  const usePowerUp = (powerUp: PowerUp) => {
    if (!gameActive || gameOver || usedPowerUps.includes(powerUp)) return;
    if (balance < POWER_UP_COSTS[powerUp]) {
      toast.error("Not enough coins!");
      return;
    }

    setBalance(balance - POWER_UP_COSTS[powerUp]);
    setUsedPowerUps([...usedPowerUps, powerUp]);

    if (powerUp === "detector") {
      // Reveal if adjacent tiles have traps
      toast.info("🔍 Metal Detector activated! Watch for warnings...");
    } else if (powerUp === "map") {
      // Reveal 2 random safe tiles
      const hiddenSafeTiles = tiles.filter(t => !t.revealed && t.type !== "trap");
      const tilesToReveal = hiddenSafeTiles.slice(0, 2);
      
      const newTiles = tiles.map(t => {
        if (tilesToReveal.find(tr => tr.id === t.id)) {
          return { ...t, revealed: true };
        }
        return t;
      });
      
      setTiles(newTiles);
      setRevealedCount(revealedCount + 2);
      toast.success("🗺️ Map revealed 2 safe tiles!");
    } else if (powerUp === "compass") {
      // Show direction to nearest treasure
      toast.info("🧭 Compass points to treasures in the corners!");
    }
  };

  const getTileIcon = (tile: Tile) => {
    if (!tile.revealed) {
      return "?";
    }

    switch (tile.type) {
      case "treasure_gold":
        return <Trophy className="w-8 h-8 text-yellow-400" />;
      case "treasure_silver":
        return <Gem className="w-8 h-8 text-gray-300" />;
      case "treasure_bronze":
        return <Gift className="w-8 h-8 text-orange-400" />;
      case "trap":
        return <Skull className="w-8 h-8 text-red-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-gray-500" />;
    }
  };

  const getTileClass = (tile: Tile) => {
    if (!tile.revealed) {
      return "bg-gradient-to-br from-amber-900/50 to-amber-950/50 hover:from-amber-800/60 hover:to-amber-900/60 cursor-pointer border-2 border-amber-700/50";
    }

    switch (tile.type) {
      case "treasure_gold":
        return "bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-2 border-yellow-500 animate-pulse";
      case "treasure_silver":
        return "bg-gradient-to-br from-gray-400/30 to-gray-600/30 border-2 border-gray-400";
      case "treasure_bronze":
        return "bg-gradient-to-br from-orange-600/30 to-orange-800/30 border-2 border-orange-500";
      case "trap":
        return "bg-gradient-to-br from-red-600/30 to-red-900/30 border-2 border-red-500";
      default:
        return "bg-gradient-to-br from-gray-700/30 to-gray-900/30 border-2 border-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Treasure Hunt
          </h1>
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-slate-900/50 border-purple-500/30">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-400">Balance</p>
                <p className="text-2xl font-bold text-white">{balance}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-purple-500/30">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Bet</p>
                <p className="text-2xl font-bold text-white">{bet}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-purple-500/30">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Current Win</p>
                <p className="text-2xl font-bold text-green-400">{currentWin}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-slate-900/50 border-purple-500/30">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Multiplier</p>
                <p className="text-2xl font-bold text-purple-400">{multiplier.toFixed(1)}x</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Difficulty */}
          <div className="lg:col-span-2">
            <Card className="p-4 bg-slate-900/50 border-purple-500/30">
              <h3 className="text-lg font-bold mb-4 text-white">Difficulty</h3>
              <div className="space-y-2">
                <Button
                  variant={difficulty === "easy" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => !gameActive && setDifficulty("easy")}
                  disabled={gameActive}
                >
                  😊 Easy
                </Button>
                <Button
                  variant={difficulty === "medium" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => !gameActive && setDifficulty("medium")}
                  disabled={gameActive}
                >
                  😐 Medium
                </Button>
                <Button
                  variant={difficulty === "hard" ? "default" : "outline"}
                  className="w-full"
                  onClick={() => !gameActive && setDifficulty("hard")}
                  disabled={gameActive}
                >
                  😰 Hard
                </Button>
              </div>

              <div className="mt-6 text-sm text-gray-400">
                <p className="font-semibold text-white mb-2">Config:</p>
                <p>Traps: {config.traps}</p>
                <p>Gold: {config.goldTreasures} ({config.goldMultiplier}x)</p>
                <p>Silver: {config.silverTreasures} ({config.silverMultiplier}x)</p>
                <p>Bronze: {config.bronzeTreasures} ({config.bronzeMultiplier}x)</p>
              </div>
            </Card>
          </div>

          {/* Center - Game Board */}
          <div className="lg:col-span-7">
            <Card className="p-6 bg-gradient-to-br from-amber-950/30 to-amber-900/20 border-amber-700/50">
              {/* Game Grid */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {tiles.map((tile) => (
                  <button
                    key={tile.id}
                    onClick={() => revealTile(tile.id)}
                    disabled={!gameActive || gameOver || tile.revealed}
                    className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-300 ${getTileClass(tile)}`}
                  >
                    {getTileIcon(tile)}
                  </button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="space-y-3">
                {!gameActive ? (
                  <Button
                    onClick={initializeGame}
                    className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={balance < bet}
                  >
                    Start Game ({bet} coins)
                  </Button>
                ) : (
                  <>
                    {!gameOver && (
                      <Button
                        onClick={cashOut}
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        disabled={currentWin === 0}
                      >
                        💰 Cash Out ({currentWin} coins)
                      </Button>
                    )}
                    {gameOver && (
                      <Button
                        onClick={initializeGame}
                        className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        {won ? "🎉 Play Again" : "🔄 Try Again"}
                      </Button>
                    )}
                  </>
                )}

                {/* Stats */}
                <Card className="p-4 bg-slate-900/50 border-purple-500/30">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-400">Tiles Revealed</p>
                      <p className="text-xl font-bold text-white">{revealedCount}/25</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Treasures Found</p>
                      <p className="text-xl font-bold text-yellow-400">{treasuresFound}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Traps Remaining</p>
                      <p className="text-xl font-bold text-red-400">{config.traps - tiles.filter(t => t.revealed && t.type === "trap").length}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Power-ups */}
          <div className="lg:col-span-3">
            <Card className="p-4 bg-slate-900/50 border-purple-500/30">
              <h3 className="text-lg font-bold mb-4 text-white">Power-ups</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => usePowerUp("detector")}
                  disabled={!gameActive || gameOver || usedPowerUps.includes("detector") || balance < POWER_UP_COSTS.detector}
                >
                  <div className="flex items-center gap-2">
                    <Radar className="w-5 h-5" />
                    <span>Metal Detector</span>
                  </div>
                  <Badge variant="secondary">{POWER_UP_COSTS.detector}</Badge>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => usePowerUp("map")}
                  disabled={!gameActive || gameOver || usedPowerUps.includes("map") || balance < POWER_UP_COSTS.map}
                >
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    <span>Treasure Map</span>
                  </div>
                  <Badge variant="secondary">{POWER_UP_COSTS.map}</Badge>
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => usePowerUp("compass")}
                  disabled={!gameActive || gameOver || usedPowerUps.includes("compass") || balance < POWER_UP_COSTS.compass}
                >
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5" />
                    <span>Magic Compass</span>
                  </div>
                  <Badge variant="secondary">{POWER_UP_COSTS.compass}</Badge>
                </Button>
              </div>

              <div className="mt-6 p-3 bg-purple-950/30 rounded-lg border border-purple-500/30">
                <p className="text-sm text-gray-300">
                  <strong className="text-purple-400">Tip:</strong> Use power-ups strategically to maximize your chances of finding treasures!
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-slate-900/50 border-purple-500/30 mt-4">
              <h3 className="text-lg font-bold mb-3 text-white">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tiles revealed:</span>
                  <span className="text-white font-semibold">{revealedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Treasures:</span>
                  <span className="text-yellow-400 font-semibold">{treasuresFound}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Traps remaining:</span>
                  <span className="text-red-400 font-semibold">{config.traps - tiles.filter(t => t.revealed && t.type === "trap").length}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

