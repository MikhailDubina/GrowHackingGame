import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  User, 
  Coins, 
  Trophy, 
  TrendingUp,
  Flame,
  Target,
  Calendar,
  ArrowLeft,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { data: profileData, isLoading } = trpc.leaderboard.getProfile.useQuery({});
  const { data: statsData } = trpc.game.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const profile = profileData;
  const balance = statsData?.balance || 0;
  const user = profile?.user;
  const stats = profile?.stats;
  const recentGames = profile?.recentGames || [];

  // Calculate win rate
  const winRate = stats?.totalGamesPlayed 
    ? ((stats.totalWins / stats.totalGamesPlayed) * 100).toFixed(1)
    : "0.0";

  // Prepare chart data
  const chartData = recentGames.map((game) => ({
    date: new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    profit: game.totalProfit,
    games: game.gamesPlayed,
  }));

  // Calculate total profit from chart data
  const totalChartProfit = recentGames.reduce((sum, game) => sum + game.totalProfit, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Profile</span>
            </div>
          </div>

          <Link href="/leaderboard">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* User Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {user?.name || `Player ${user?.id.slice(0, 8)}`}
                </h2>
                <p className="text-muted-foreground">{user?.email || 'No email'}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <div className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
                  <Coins className="w-8 h-8" />
                  {balance}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Wins</div>
                  <div className="text-2xl font-bold">{stats?.totalWins || 0}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                  <div className="text-2xl font-bold">{stats?.longestWinStreak || 0}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <div className="text-2xl font-bold">{winRate}%</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Profit</div>
                  <div className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(stats?.totalProfit || 0) >= 0 ? '+' : ''}{stats?.totalProfit || 0}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Performance (Last 30 Days)</h3>
            </div>

            {chartData.length > 0 ? (
              <>
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">Total Profit (30 days)</div>
                  <div className={`text-3xl font-bold ${totalChartProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalChartProfit >= 0 ? '+' : ''}{totalChartProfit} coins
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#888"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #333',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="profit" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No game history yet</p>
                <p className="text-sm mt-2">Start playing to see your performance!</p>
              </div>
            )}
          </Card>

          {/* Additional Stats */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Games Played</div>
                <div className="text-xl font-bold">{stats?.totalGamesPlayed || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Losses</div>
                <div className="text-xl font-bold">{stats?.totalLosses || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
                <div className="text-xl font-bold">{stats?.currentWinStreak || 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Bet Size</div>
                <div className="text-xl font-bold">{stats?.avgBetSize || 0}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
