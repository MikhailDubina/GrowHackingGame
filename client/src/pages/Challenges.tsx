import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';
import { ArrowLeft, Trophy, Clock, CheckCircle, Gift } from 'lucide-react';

interface Challenge {
  id: string;
  challengeType: string;
  description: string;
  targetValue: number;
  rewardCoins: number;
  difficulty: string;
  progress: number;
  completed: boolean;
  claimedReward: boolean;
  progressPercentage: number;
}

export default function Challenges() {
  const [, setLocation] = useLocation();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimedToday, setClaimedToday] = useState<Set<string>>(new Set());

  const { data: challengesData, isLoading, refetch } = trpc.dailyChallenges.getChallenges.useQuery();
  const claimRewardMutation = trpc.dailyChallenges.claimReward.useMutation();
  const { data: statsData, refetch: refetchStats } = trpc.game.getStats.useQuery();

  const handleClaimReward = async (challengeId: string) => {
    setClaiming(challengeId);
    try {
      const result = await claimRewardMutation.mutateAsync({ challengeId });
      
      // Show success message
      toast.success(`🎉 Claimed ${result.reward} coins!`, {
        description: `New balance: ${result.newBalance} coins`,
        duration: 5000,
      });
      
      // Mark as claimed
      setClaimedToday(prev => new Set([...prev, challengeId]));
      
      // Refetch data
      await refetch();
      refetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'hard':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const color = getDifficultyColor(difficulty);
    return (
      <span className={`${color} text-white px-2 py-1 rounded text-xs font-bold uppercase`}>
        {difficulty}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenges...</div>
      </div>
    );
  }

  const challenges = challengesData?.challenges || [];
  const totalChallenges = challengesData?.totalChallenges || 0;
  const completedChallenges = challengesData?.completedChallenges || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft size={24} />
            <span className="text-lg">Back</span>
          </button>
          
          <div className="flex items-center gap-2 text-white">
            <Trophy className="text-yellow-400" size={24} />
            <span className="text-xl font-bold">Daily Challenges</span>
          </div>
          
          <div className="text-white text-right">
            <div className="text-sm opacity-80">Your Balance</div>
            <div className="text-xl font-bold">{statsData?.balance || 0} 💰</div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Today's Progress</h2>
              <p className="text-white/80">Complete challenges to earn bonus coins!</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-white">{completedChallenges}/{totalChallenges}</div>
              <div className="text-white/80 text-sm">Completed</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500"
              style={{ width: `${totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center border border-white/20">
              <Clock className="mx-auto mb-4 text-white/50" size={48} />
              <p className="text-white text-lg">No challenges available right now.</p>
              <p className="text-white/70 text-sm mt-2">Check back tomorrow for new challenges!</p>
            </div>
          ) : (
            challenges.map((challenge: Challenge) => {
              const isCompleted = challenge.completed;
              const isClaimed = challenge.claimedReward || claimedToday.has(challenge.id);
              const canClaim = isCompleted && !isClaimed;

              return (
                <div
                  key={challenge.id}
                  className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all ${
                    isCompleted
                      ? 'border-green-400 shadow-lg shadow-green-500/20'
                      : 'border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getDifficultyBadge(challenge.difficulty)}
                        {isCompleted && (
                          <CheckCircle className="text-green-400" size={20} />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {challenge.description}
                      </h3>
                      <p className="text-white/70 text-sm">
                        Reward: <span className="text-yellow-400 font-bold">{challenge.rewardCoins} coins</span>
                      </p>
                    </div>
                    
                    {canClaim && (
                      <button
                        onClick={() => handleClaimReward(challenge.id)}
                        disabled={claiming === challenge.id}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Gift size={20} />
                        {claiming === challenge.id ? 'Claiming...' : 'Claim Reward'}
                      </button>
                    )}
                    
                    {isClaimed && (
                      <div className="bg-green-500/20 text-green-400 px-6 py-3 rounded-lg font-bold flex items-center gap-2 border border-green-400/30">
                        <CheckCircle size={20} />
                        Claimed
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white/80">
                      <span>Progress: {challenge.progress} / {challenge.targetValue}</span>
                      <span>{Math.round(challenge.progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-blue-400 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, challenge.progressPercentage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-400/30">
          <div className="flex items-start gap-3">
            <Clock className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div className="text-white/90 text-sm">
              <p className="font-bold mb-1">Daily Reset</p>
              <p>New challenges appear every day at midnight. Complete them before they expire!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
