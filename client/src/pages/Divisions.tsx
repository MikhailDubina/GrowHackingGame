import { useLocation } from 'wouter';
import { trpc } from '../lib/trpc';
import { ArrowLeft, Crown, Gift, Zap, Lock, Check, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Divisions() {
  const [, setLocation] = useLocation();
  
  const { data: userDivision, isLoading: loadingUser } = trpc.divisions.getUserDivision.useQuery();
  const { data: divisionsData, isLoading: loadingDivisions } = trpc.divisions.getAllDivisions.useQuery();
  
  const divisions = divisionsData?.divisions || [];
  const currentTier = userDivision?.tier || 1;
  
  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-amber-700 to-amber-900'; // Bronze
      case 2: return 'from-gray-400 to-gray-600'; // Silver
      case 3: return 'from-yellow-400 to-yellow-600'; // Gold
      case 4: return 'from-cyan-400 to-blue-600'; // Platinum
      case 5: return 'from-purple-400 to-pink-600'; // Diamond
      default: return 'from-gray-400 to-gray-600';
    }
  };
  
  const getBorderColor = (tier: number) => {
    switch (tier) {
      case 1: return 'border-amber-700';
      case 2: return 'border-gray-400';
      case 3: return 'border-yellow-400';
      case 4: return 'border-cyan-400';
      case 5: return 'border-purple-400';
      default: return 'border-gray-400';
    }
  };
  
  if (loadingUser || loadingDivisions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex items-center justify-center">
        <div className="text-2xl">Loading divisions...</div>
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
            <Crown className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Divisions</h1>
          </div>
        </div>
        
        {/* Current Division Card */}
        <Card className={`bg-gradient-to-br ${getTierColor(currentTier)} border-4 ${getBorderColor(currentTier)} p-6 mb-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-white/80 mb-1">Your Current Division</div>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{userDivision?.icon}</span>
                  <div>
                    <h2 className="text-3xl font-bold">{userDivision?.name}</h2>
                    <p className="text-white/80">Tier {userDivision?.tier}</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                ${userDivision?.monthlySpend || 0} / ${userDivision?.monthlySpendRequired || 0} this month
              </Badge>
            </div>
            
            {/* Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-semibold">Daily Bonus</span>
                </div>
                <div className="text-2xl font-bold">{userDivision?.benefits?.dailyBonusCoins || 0} coins</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-semibold">Challenge Bonus</span>
                </div>
                <div className="text-2xl font-bold">+{userDivision?.benefits?.challengeRewardBonus || 0}%</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-semibold">Shop Discount</span>
                </div>
                <div className="text-2xl font-bold">{userDivision?.benefits?.shopDiscount || 0}%</div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* All Divisions */}
        <h2 className="text-2xl font-bold mb-4">All Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((division: any) => {
            const isCurrentDivision = division.tier === currentTier;
            const isLocked = division.tier > currentTier;
            const benefits = typeof division.benefits === 'string' 
              ? JSON.parse(division.benefits) 
              : division.benefits;
            
            return (
              <Card
                key={division.id}
                className={`bg-gradient-to-br ${getTierColor(division.tier)} border-2 ${getBorderColor(division.tier)} p-6 relative overflow-hidden transition-all ${
                  isCurrentDivision ? 'ring-4 ring-white/50 scale-105' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {isCurrentDivision && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-500 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  </div>
                )}
                
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/40 text-white">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">{division.icon}</div>
                  <h3 className="text-2xl font-bold">{division.name}</h3>
                  <p className="text-white/80 text-sm">Tier {division.tier}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 mb-4 text-center">
                  <div className="text-sm text-white/80 mb-1">Monthly Spend Required</div>
                  <div className="text-2xl font-bold">
                    {division.monthlySpendRequired === 0 ? 'Free' : `$${division.monthlySpendRequired}`}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Daily Bonus</span>
                    <span className="font-bold">{benefits.dailyBonusCoins} coins</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Challenge Bonus</span>
                    <span className="font-bold">+{benefits.challengeRewardBonus}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Shop Discount</span>
                    <span className="font-bold">{benefits.shopDiscount}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Exclusive Games</span>
                    <span className="font-bold">{benefits.exclusiveGames ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Priority Support</span>
                    <span className="font-bold">{benefits.prioritySupport ? '✓' : '✗'}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Info */}
        <div className="mt-8 bg-blue-500/20 backdrop-blur-md rounded-xl p-4 border border-blue-400/30">
          <div className="flex items-start gap-3">
            <Crown className="text-blue-400 flex-shrink-0 mt-1" size={20} />
            <div className="text-white/90 text-sm">
              <p className="font-bold mb-1">How Divisions Work</p>
              <p>Your division is determined by your monthly spending. The more you spend, the higher your tier and the better your benefits! Divisions reset at the end of each month.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
