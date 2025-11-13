import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Trophy, 
  Coins, 
  TrendingUp, 
  Flame,
  Medal,
  Crown,
  Award,
  ArrowLeft
} from "lucide-react";

type SortBy = "totalProfit" | "totalWins" | "longestWinStreak";

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortBy>("totalProfit");

  const { data: leaderboardData, isLoading } = trpc.leaderboard.getLeaderboard.useQuery({
    limit: 50,
    sortBy,
  });

  const { data: myRankData } = trpc.leaderboard.getMyRank.useQuery({ sortBy });

  const leaderboard = leaderboardData?.leaderboard || [];
  const myRank = myRankData?.rank;
  const totalPlayers = myRankData?.totalPlayers || 0;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700 text-white";
    return "bg-muted";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Leaderboard</span>
            </div>
          </div>

          {myRank && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Your Rank:</span>
              <span className="font-bold">#{myRank}</span>
              <span className="text-sm text-muted-foreground">/ {totalPlayers}</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Sort Tabs */}
        <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="totalProfit" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Profit
            </TabsTrigger>
            <TabsTrigger value="totalWins" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Wins
            </TabsTrigger>
            <TabsTrigger value="longestWinStreak" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Streak
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {leaderboard.map((player) => (
              <Card
                key={player.userId}
                className={`p-4 transition-all hover:shadow-lg ${getRankBadge(player.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="font-bold text-lg">
                        {player.userName || `Player ${player.userId.slice(0, 8)}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {player.totalGamesPlayed} games played
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                      {sortBy === "totalProfit" && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Profit</div>
                          <div className={`text-xl font-bold ${player.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit}
                          </div>
                        </div>
                      )}

                      {sortBy === "totalWins" && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Total Wins</div>
                          <div className="text-xl font-bold text-primary">
                            {player.totalWins}
                          </div>
                        </div>
                      )}

                      {sortBy === "longestWinStreak" && (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Best Streak</div>
                          <div className="text-xl font-bold text-orange-500">
                            {player.longestWinStreak}
                          </div>
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Balance</div>
                        <div className="text-lg font-bold text-yellow-500">
                          {player.balance}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No players yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to play and claim the top spot!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
