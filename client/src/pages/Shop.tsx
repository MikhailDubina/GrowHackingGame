import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Coins, Check, Sparkles, Zap, Gift, Tag, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getStripe } from "@/lib/stripe";

export default function Shop() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);

  // tRPC queries
  const { data: packagesData, isLoading } = trpc.shop.getPackages.useQuery();
  const { data: statsData, refetch: refetchStats } = trpc.game.getStats.useQuery();
  const simulatePurchaseMutation = trpc.shop.simulatePurchase.useMutation();
  const createCheckoutMutation = trpc.shop.createCheckoutSession.useMutation();
  const redeemPromoMutation = trpc.promo.redeemCode.useMutation();

  const balance = statsData?.balance || 0;
  const packages = packagesData?.packages || [];

  const handleRedeemPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Пожалуйста, введите промокод");
      return;
    }

    setIsRedeeming(true);
    try {
      const result = await redeemPromoMutation.mutateAsync({ code: promoCode.trim() });
      
      if (result.success) {
        // Clear promo code first
        setPromoCode("");
        
        // Show success message
        toast.success(result.message);
        
        // Refetch stats in background
        refetchStats();
        
        // Check if we need to return to a specific page
        const returnPath = localStorage.getItem('returnAfterPurchase');
        if (returnPath) {
          localStorage.removeItem('returnAfterPurchase');
          setTimeout(() => {
            window.location.href = returnPath;
          }, 1500);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Не удалось активировать промокод");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    setSelectedPackage(packageId);
    
    try {
      toast.info("Перенаправление на оплату...");
      
      // Try to use real Stripe checkout if configured
      const stripe = await getStripe();
      
      if (stripe) {
        // Create checkout session
        const result = await createCheckoutMutation.mutateAsync({ packageId });
        
        if (result.url) {
          // Redirect to Stripe checkout
          window.location.href = result.url;
          return;
        }
      }
      
      // Fallback to simulated purchase if Stripe is not configured
      toast.info("Используется демо режим...");
      const result = await simulatePurchaseMutation.mutateAsync({ packageId });
      
      if (result.success) {
        toast.success(`Успешно куплено ${result.coins} монет! Новый баланс: ${result.newBalance}`);
        
        // Check if we need to return to a specific page
        const returnPath = localStorage.getItem('returnAfterPurchase');
        if (returnPath) {
          localStorage.removeItem('returnAfterPurchase');
          setTimeout(() => {
            window.location.href = returnPath;
          }, 1500);
        } else {
          // Refetch stats to update balance
          await refetchStats();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Не удалось завершить покупку");
    } finally {
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">GrowHackingGame</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">{balance}</span>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            💰 МАГАЗИН
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Пополни счёт и продолжай играть! Все пакеты включают бонусные монеты!
          </p>
        </div>

        {/* Promo Code Section - Highlighted */}
        <Card className="max-w-2xl mx-auto mb-12 p-8 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-4">
              <Gift className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Есть промокод?</span>
            </div>
            <p className="text-muted-foreground">
              Введи промокод и получи бонусные монеты бесплатно!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Введи промокод (например: WELCOME100)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="pl-10 h-12 text-lg border-2"
                disabled={isRedeeming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && promoCode.trim() && !isRedeeming) {
                    handleRedeemPromo();
                  }
                }}
              />
            </div>
            <Button
              size="lg"
              onClick={handleRedeemPromo}
              disabled={isRedeeming || !promoCode.trim()}
              className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:opacity-90 px-8 h-12"
            >
              {isRedeeming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Активация...
                </>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Активировать
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            💡 Доступные промокоды: <code className="px-2 py-1 bg-muted rounded">WELCOME100</code>, 
            <code className="px-2 py-1 bg-muted rounded mx-1">BONUS50</code>, 
            <code className="px-2 py-1 bg-muted rounded">MEGA200</code>
          </div>
        </Card>

        {/* Packages Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Пакеты монет</h2>
          <p className="text-muted-foreground">Выбери пакет и оплати через Stripe</p>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка пакетов...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Пакеты не найдены. Проверьте настройки сервера.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {packages.map((pkg) => {
              const totalCoins = pkg.coins + pkg.bonusCoins;
              const isSelected = selectedPackage === pkg.id;
              const priceInDollars = (pkg.price / 100).toFixed(2);

              return (
                <Card
                  key={pkg.id}
                  className={`relative p-6 space-y-6 transition-all duration-300 hover:scale-105 ${
                    pkg.popular
                      ? "border-2 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                      : "border border-border"
                  }`}
                >
                  {/* Badges */}
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Популярный
                    </Badge>
                  )}

                  {/* Package Name */}
                  <div className="text-center pt-2">
                    <h3 className="text-2xl font-bold">{pkg.name}</h3>
                  </div>

                  {/* Coin Icon */}
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                      <Coins className="w-12 h-12 text-yellow-900" />
                    </div>
                  </div>

                  {/* Coin Amount */}
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold">{totalCoins.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground uppercase tracking-wide">
                      Монет
                    </div>
                    {pkg.bonusCoins > 0 && (
                      <div className="text-sm text-green-500 font-semibold">
                        +{pkg.bonusCoins} Бонус
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    <div className="text-3xl font-bold">${priceInDollars}</div>
                  </div>

                  {/* Buy Button */}
                  <Button
                    size="lg"
                    className="w-full font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Обработка...
                      </>
                    ) : (
                      "КУПИТЬ"
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Features Section */}
        <Card className="max-w-4xl mx-auto p-8">
          <h3 className="text-2xl font-bold text-center mb-8">Почему покупать монеты?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-semibold">Мгновенная доставка</h4>
              <p className="text-sm text-muted-foreground">
                Монеты добавляются на счёт сразу после покупки
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="font-semibold">Бонусные монеты</h4>
              <p className="text-sm text-muted-foreground">
                Каждый пакет включает дополнительные бонусные монеты
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-semibold">Безопасные платежи</h4>
              <p className="text-sm text-muted-foreground">
                Защищённые транзакции через Stripe
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
