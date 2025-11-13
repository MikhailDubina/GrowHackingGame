import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';
import { ArrowLeft, Trophy, Star, Award, Crown, Sparkles, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  requirement: number;
  rewardCoins: number;
  icon: string;
  rarity: string;
  progress: number;
  completed: boolean;
  claimedAt: string | null;
}

export default function Achievements() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [claiming, setClaiming] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.achievements.getAchievements.useQuery();
  const claimMutation = trpc.achievements.claimReward.useMutation();

  const achievements: Achievement[] = data?.achievements || [];
  const totalCompleted = data?.totalCompleted || 0;
  const totalRewards = data?.totalRewards || 0;

  const getRarityConfig = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary':
        return {
          color: 'from-yellow-400 to-orange-500',
          borderColor: 'border-yellow-500',
          bgColor: 'bg-yellow-500/10',
          icon: Crown,
        };
      case 'epic':
        return {
          color: 'from-purple-400 to-pink-500',
          borderColor: 'border-purple-500',
          bgColor: 'bg-purple-500/10',
          icon: Sparkles,
        };
      case 'rare':
        return {
          color: 'from-blue-400 to-cyan-500',
          borderColor: 'border-blue-500',
          bgColor: 'bg-blue-500/10',
          icon: Star,
        };
      default:
        return {
          color: 'from-gray-400 to-gray-500',
          borderColor: 'border-gray-500',
          bgColor: 'bg-gray-500/10',
          icon: Award,
        };
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'games_played', name: 'Games Played', icon: '🎮' },
    { id: 'wins', name: 'Wins', icon: '🏆' },
    { id: 'earnings', name: 'Earnings', icon: '💰' },
    { id: 'streaks', name: 'Streaks', icon: '🔥' },
  ];

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const handleClaim = async (achievementId: string) => {
    setClaiming(achievementId);
    try {
      const result = await claimMutation.mutateAsync({ achievementId });
      toast.success(`🎉 Claimed ${result.reward} coins!`, {
        description: 'Reward added to your balance',
        duration: 5000,
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Achievements</h1>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/40 border-white/20 p-4 text-center">
            <div className="text-sm text-white/70">Completed</div>
            <div className="text-3xl font-bold text-green-400">{totalCompleted}</div>
            <div className="text-xs text-white/50">/ {achievements.length}</div>
          </Card>
          <Card className="bg-black/40 border-white/20 p-4 text-center">
            <div className="text-sm text-white/70">Total Rewards</div>
            <div className="text-3xl font-bold text-yellow-400">{totalRewards}</div>
            <div className="text-xs text-white/50">coins earned</div>
          </Card>
          <Card className="bg-black/40 border-white/20 p-4 text-center">
            <div className="text-sm text-white/70">Progress</div>
            <div className="text-3xl font-bold text-blue-400">
              {achievements.length > 0 ? Math.round((totalCompleted / achievements.length) * 100) : 0}%
            </div>
            <div className="text-xs text-white/50">completion</div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-black/40 border-white/20 hover:bg-white/10'
              }`}
            >
              {typeof category.icon === 'string' ? (
                <span>{category.icon}</span>
              ) : (
                <category.icon className="w-4 h-4" />
              )}
              <span>{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const rarityConfig = getRarityConfig(achievement.rarity);
            const RarityIcon = rarityConfig.icon;
            const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);
            const canClaim = achievement.completed && !achievement.claimedAt;

            return (
              <Card
                key={achievement.id}
                className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 p-4 relative overflow-hidden transition-all hover:scale-105`}
              >
                {/* Rarity Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={`bg-gradient-to-r ${rarityConfig.color} text-white border-0`}>
                    {achievement.rarity}
                  </Badge>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center mb-3">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${rarityConfig.color} flex items-center justify-center`}>
                    {achievement.completed ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      <RarityIcon className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-white mb-1">{achievement.name}</h3>
                  <p className="text-sm text-white/70">{achievement.description}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-white/70 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress} / {achievement.requirement}</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${rarityConfig.color} transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Reward & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold">{achievement.rewardCoins}</span>
                  </div>
                  
                  {achievement.claimedAt ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500">
                      Claimed
                    </Badge>
                  ) : canClaim ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(achievement.id)}
                      disabled={claiming === achievement.id}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {claiming === achievement.id ? 'Claiming...' : 'Claim'}
                    </Button>
                  ) : (
                    <Badge className="bg-black/40 text-white/50 border-white/20">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-xl text-white/50">No achievements in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
