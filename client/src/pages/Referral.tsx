import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Users, Copy, Check, Gift, TrendingUp, Star, Sparkles, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Referral() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Generate unique referral code based on user ID
  const referralCode = user ? `GROW${user.id.toString().padStart(6, '0')}` : '';
  const referralLink = `https://growhackinggame.com/ref/${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join GrowHackingGame!',
          text: `Use my referral code ${referralCode} and get bonus coins!`,
          url: referralLink
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      copyToClipboard(referralLink);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to access the referral program.
          </p>
          <Button onClick={() => setLocation("/demo-login")} className="w-full">
            Go to Login
          </Button>
        </Card>
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
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Referral Program
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Invite friends and earn rewards together
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Referral Link Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Your Referral Link</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Referral Code</label>
              <div className="flex gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono text-lg font-bold bg-background/50"
                />
                <Button
                  onClick={() => copyToClipboard(referralCode)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono bg-background/50"
                />
                <Button
                  onClick={() => copyToClipboard(referralLink)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <Button
              onClick={shareReferral}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              size="lg"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Referral Link
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <Users className="w-10 h-10 text-blue-400 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
            <Gift className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-muted-foreground">Coins Earned</div>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30">
            <TrendingUp className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-bold mb-1">0</div>
            <div className="text-sm text-muted-foreground">Active Referrals</div>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">1</span>
              </div>
              <h3 className="font-bold mb-2">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Copy your unique referral link and share it with friends via social media, email, or messaging apps.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-400">2</span>
              </div>
              <h3 className="font-bold mb-2">Friend Signs Up</h3>
              <p className="text-sm text-muted-foreground">
                When your friend creates an account using your referral link, they get a welcome bonus!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">3</span>
              </div>
              <h3 className="font-bold mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                You both receive bonus coins! Plus, earn ongoing commissions from their activity.
              </p>
            </div>
          </div>
        </Card>

        {/* Reward Tiers */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Reward Tiers
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-bronze-500/10 to-bronze-600/10 rounded-lg border border-bronze-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-bronze-500/20 flex items-center justify-center">
                  <span className="text-2xl">🥉</span>
                </div>
                <div>
                  <h3 className="font-bold">Bronze Tier</h3>
                  <p className="text-sm text-muted-foreground">1-9 referrals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">500 coins</div>
                <div className="text-sm text-muted-foreground">per referral</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-400/10 to-gray-500/10 rounded-lg border border-gray-400/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-400/20 flex items-center justify-center">
                  <span className="text-2xl">🥈</span>
                </div>
                <div>
                  <h3 className="font-bold">Silver Tier</h3>
                  <p className="text-sm text-muted-foreground">10-24 referrals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">750 coins</div>
                <div className="text-sm text-muted-foreground">per referral</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl">🥇</span>
                </div>
                <div>
                  <h3 className="font-bold">Gold Tier</h3>
                  <p className="text-sm text-muted-foreground">25-49 referrals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">1,000 coins</div>
                <div className="text-sm text-muted-foreground">per referral</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-bold">Diamond Tier</h3>
                  <p className="text-sm text-muted-foreground">50+ referrals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">1,500 coins</div>
                <div className="text-sm text-muted-foreground">per referral</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Benefits */}
        <Card className="p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Gift className="w-6 h-6 text-green-400" />
            Additional Benefits
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Lifetime Commissions</h3>
                <p className="text-sm text-muted-foreground">
                  Earn 5% commission on all purchases made by your referrals, forever!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Monthly Bonuses</h3>
                <p className="text-sm text-muted-foreground">
                  Top referrers each month receive exclusive bonus rewards and recognition!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Special Promotions</h3>
                <p className="text-sm text-muted-foreground">
                  Access to exclusive promotions and higher rewards during special events.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">No Limits</h3>
                <p className="text-sm text-muted-foreground">
                  There's no cap on how many people you can refer or how much you can earn!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Terms */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Referral rewards are subject to our{" "}
            <button onClick={() => setLocation("/legal/terms")} className="text-purple-400 hover:text-purple-300 underline">
              Terms and Conditions
            </button>
            . Fraudulent activity will result in account termination.
          </p>
        </div>
      </div>
    </div>
  );
}
