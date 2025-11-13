import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Sparkles, Crown, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SlotGame {
  id: string;
  name: string;
  provider: string;
  gameCode: string;
  thumbnail: string;
  rtp: string;
  volatility: string;
  description: string;
}

const SLOT_GAMES: SlotGame[] = [
  {
    id: "the-dog-house",
    name: "The Dog House",
    provider: "Pragmatic Play",
    gameCode: "vs20doghouse",
    thumbnail: "/slots/the-dog-house.webp",
    rtp: "96.51%",
    volatility: "High",
    description: "Join the gang in Dog House, the 5×3, 20 lines videoslot. All WILDs have multipliers on reels 2,3 and 4 and in the free spins round, stack the wins with the sticky WILDs feature."
  },
  {
    id: "gates-of-olympus",
    name: "Gates of Olympus",
    provider: "Pragmatic Play",
    gameCode: "vs20olympgate",
    thumbnail: "/slots/gates-of-olympus.webp",
    rtp: "96.50%",
    volatility: "High",
    description: "The Gates into Zeus' realm open wide to all players in Gates of Olympus, the 6×5 videoslot with 20 paylines where symbols come tumbling down, paying in clusters of 8 or more."
  },
  {
    id: "sweet-bonanza",
    name: "Sweet Bonanza",
    provider: "Pragmatic Play",
    gameCode: "vs20fruitsw",
    thumbnail: "/slots/sweet-bonanza.webp",
    rtp: "96.51%",
    volatility: "High",
    description: "Land 4 or more scatter symbols to trigger the Free Spins feature, where a progressive multiplier increases with every tumble win."
  },
  {
    id: "wolf-gold",
    name: "Wolf Gold",
    provider: "Pragmatic Play",
    gameCode: "ws3888wolfgold",
    thumbnail: "/slots/wolf-gold.webp",
    rtp: "96.01%",
    volatility: "Medium",
    description: "A 5×3 slot with 25 fixed paylines set in a North American desert with wildlife theme and Money Respin feature."
  }
];

export default function Slots() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<SlotGame | null>(null);
  const [gameLoaded, setGameLoaded] = useState(false);

  const launchGame = (game: SlotGame) => {
    setSelectedGame(game);
    setGameLoaded(false);
  };

  const closeGame = () => {
    setSelectedGame(null);
    setGameLoaded(false);
  };

  const getGameUrl = (gameCode: string) => {
    return `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${gameCode}&websiteUrl=https://growhackinggame.com&jurisdiction=99&lobby_url=https://growhackinggame.com&lang=en`;
  };

  if (selectedGame) {
    return (
      <div className="min-h-screen bg-background">
        {/* Game Header */}
        <div className="bg-card border-b border-border p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={closeGame}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Slots
              </Button>
              <div>
                <h1 className="text-xl font-bold">{selectedGame.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedGame.provider}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">RTP</p>
                <p className="font-bold text-green-400">{selectedGame.rtp}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Volatility</p>
                <p className="font-bold text-yellow-400">{selectedGame.volatility}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="container mx-auto p-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-300 mb-1">Demo Mode</p>
              <p className="text-muted-foreground">
                You are playing in demo mode with virtual credits. To play with real money, please visit the Shop to purchase coins.
              </p>
            </div>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: "calc(100vh - 240px)", minHeight: "600px" }}>
            {!gameLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading game...</p>
                </div>
              </div>
            )}
            <iframe
              src={getGameUrl(selectedGame.gameCode)}
              className="w-full h-full"
              frameBorder="0"
              allowFullScreen
              onLoad={() => setGameLoaded(true)}
              title={selectedGame.name}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Premium Slots
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Play top-rated slot games from Pragmatic Play
              </p>
            </div>
          </div>

          {/* 18+ Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-3xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">18+</span>
              <div className="text-sm text-muted-foreground">
                <p className="font-bold text-foreground mb-1">Demo Mode Only</p>
                <p>
                  These games are currently available in demo mode only. All games use virtual credits for entertainment purposes. 
                  Real money integration coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {SLOT_GAMES.map((game) => (
            <Card
              key={game.id}
              className="overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
              onClick={() => launchGame(game)}
            >
              {/* Game Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 overflow-hidden">
                <img
                  src={game.thumbnail}
                  alt={game.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Play Demo
                  </Button>
                </div>
                {game.id === "the-dog-house" && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Popular
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-base md:text-lg mb-1">{game.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{game.provider}</p>
                
                <div className="flex items-center justify-between text-xs mb-2 md:mb-3">
                  <div>
                    <span className="text-muted-foreground">RTP: </span>
                    <span className="font-semibold text-green-400">{game.rtp}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Volatility: </span>
                    <span className="font-semibold text-yellow-400">{game.volatility}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {game.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12 text-center">
          <Card className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">More Games Coming Soon!</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're working on adding more premium slot games and real money play. 
              Stay tuned for updates and new releases from top providers like Pragmatic Play, Evolution, and more!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
