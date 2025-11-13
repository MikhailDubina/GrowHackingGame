import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Shield, Zap, TrendingUp, ArrowRight, Sparkles, Gift, Star, Gamepad2, Trophy, User } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

function ReviewsDisplay() {
  const { data: reviews = [] } = trpc.reviews.getApprovedReviews.useQuery();

  if (reviews.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {reviews.slice(0, 6).map((review: any) => (
        <Card key={review.id} className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold">{review.username}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{review.comment}</p>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  let { user, loading, error, isAuthenticated, logout } = useAuth();
  const { data: statsData } = trpc.game.getStats.useQuery();
  // Fallback stats with error handling
  const { data: globalStats, error: statsError } = trpc.system.globalStats.useQuery();
  const displayStats = globalStats || { totalPlayers: 25, totalGames: 49, totalPayouts: 16030 };
  const balance = statsData?.balance || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* 18+ Warning Banner */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold">
            <span className="text-xl">18+</span>
            <span>Азартные игры призваны развлекать. Помните, что Вы рискуете деньгами, когда делаете ставки. Не тратьте больше, чем можете позволить себе проиграть.</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">GrowHackingGame</span>
          </div>

          <nav className="hidden lg:flex items-center gap-3 xl:gap-6 flex-wrap">
            <Link href="/treasure-hunt">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                🏆 Treasure Hunt
              </a>
            </Link>
            <Link href="/match-three">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                💎 Match Three
              </a>
            </Link>
            <Link href="/challenges">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                🎯 Challenges
              </a>
            </Link>
            <Link href="/achievements">
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                🏅 Achievements
              </a>
            </Link>
            <Link href="/leaderboard">
              <a className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </a>
            </Link>
            
            {/* Highlighted Shop Button */}
            <Link href="/shop">
              <Button 
                className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:opacity-90 shadow-lg shadow-yellow-500/50 animate-pulse"
                size="lg"
              >
                <Gift className="w-5 h-5 mr-2" />
                <span className="font-bold">Shop</span>
                {balance === 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <Link href="/profile">
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span>{user?.username || 'Player'}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/demo-login">
                <Button variant="outline">Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Low Balance Alert */}
      {isAuthenticated && balance < 50 && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-b border-yellow-500/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium">
                {balance === 0 
                  ? "⚠️ Your balance is empty! Get coins now to continue playing!" 
                  : `⚠️ Low balance: ${balance} coins. Top up to keep playing!`}
              </span>
            </div>
            <Link href="/shop">
              <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90">
                Get Coins Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                background: `linear-gradient(${Math.random() * 360}deg, rgba(59, 130, 246, 0.5), rgba(236, 72, 153, 0.5))`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Glowing orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600/20 to-pink-600/20 rounded-full border border-blue-600/30 mb-4">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🎮 Новая игровая платформа
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                GrowHackingGame
              </span>
              <br />
              <span className="text-foreground">Играй. Выигрывай. Расти.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Захватывающие игры с реальными выигрышами. Используй промокоды для бонусных монет!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link href="/demo-login">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300">
                      🎮 Демо режим (бесплатно)
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2 hover:scale-105 hover:border-purple-500 hover:shadow-lg transition-all duration-300">
                      💰 Реальный режим
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/treasure-hunt">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-yellow-600 to-amber-600 hover:opacity-90">
                      🏆 Treasure Hunt
                    </Button>
                  </Link>
                  <Link href="/match-three">
                    <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90">
                      💎 Match Three
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Promo Code Hint */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                💡 Используй промокоды: <code className="px-2 py-1 bg-muted rounded">WELCOME100</code>, 
                <code className="px-2 py-1 bg-muted rounded mx-1">BONUS50</code>, 
                <code className="px-2 py-1 bg-muted rounded">MEGA200</code>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Наши игры
            </h2>
            <p className="text-xl text-muted-foreground">Выбери свою любимую игру и начни выигрывать</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 md:p-8 space-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🏆</div>
              <h3 className="text-2xl font-bold">Treasure Hunt</h3>
              <p className="text-muted-foreground">
                Ищи сокровища на игровом поле! Три уровня сложности: Easy (бесплатно), Medium и Hard.
              </p>
              <Link href="/treasure-hunt">
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:shadow-lg hover:shadow-yellow-500/50 transition-all duration-300">
                  Играть сейчас
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 md:p-8 space-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 group">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💎</div>
              <h3 className="text-2xl font-bold">Match Three</h3>
              <p className="text-muted-foreground">
                Инновационный слот с расширяющимися барабанами! Wild символы и высокие выплаты.
              </p>
              <Link href="/match-three">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
                  Играть сейчас
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 md:p-8 space-y-4 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 relative overflow-hidden group">
              <div className="absolute top-2 right-2 z-10">
                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold rounded-full animate-bounce">
                  🔥 HOT
                </span>
              </div>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎰</div>
              <h3 className="text-2xl font-bold">Premium Slots</h3>
              <p className="text-muted-foreground">
                Играй в топовые слоты от Pragmatic Play! The Dog House, Gates of Olympus и другие.
              </p>
              <Link href="/slots">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300">
                  Смотреть слоты
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Global Stats Section */}
      <section className="py-12 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center bg-card/80 backdrop-blur-sm border-blue-500/30 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {displayStats?.totalPlayers?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Игроков</div>
            </Card>
            
            <Card className="p-6 text-center bg-card/80 backdrop-blur-sm border-purple-500/30 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {displayStats?.totalPayouts?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Монет выплачено</div>
            </Card>
            
            <Card className="p-6 text-center bg-card/80 backdrop-blur-sm border-pink-500/30 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                {displayStats?.totalGames?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Игр сыграно</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Почему мы?</h2>
            <p className="text-xl text-muted-foreground">Честная игра с прозрачными правилами</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 space-y-4 hover:scale-105 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold">Безопасность</h3>
              <p className="text-muted-foreground">
                Защищённые платежи через Stripe. Ваши данные в безопасности.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:scale-105 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-300">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold">Мгновенная игра</h3>
              <p className="text-muted-foreground">
                Без загрузок и ожидания. Начни играть прямо сейчас!
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:scale-105 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/30 transition-colors duration-300">
                <Gift className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold">Промокоды</h3>
              <p className="text-muted-foreground">
                Используй промокоды и получай бонусные монеты!
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:scale-105 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold">Два режима</h3>
              <p className="text-muted-foreground">
                Демо режим для практики или реальный режим для выигрышей!
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Готов начать?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Присоединяйся к тысячам игроков уже сегодня!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo-login">
              <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:opacity-90">
                Начать играть
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2">
                <Gift className="mr-2 w-6 h-6" />
                Получить монеты
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What Players Say</h2>
            <p className="text-muted-foreground text-lg">Real reviews from real players</p>
          </div>
          
          <ReviewsDisplay />
          
          <div className="text-center mt-8">
            <Link href="/reviews">
              <Button size="lg" variant="outline">
                <Star className="mr-2 w-5 h-5" />
                Leave a Review
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4">
          {/* Responsible Gaming Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-3xl">18+</span>
              <div className="text-sm text-muted-foreground">
                <p className="font-bold text-foreground mb-2">Ответственная игра</p>
                <p>Азартные игры призваны развлекать. Помните, что Вы рискуете деньгами, когда делаете ставки. Не тратьте больше, чем можете позволить себе проиграть.</p>
                <p className="mt-2">Если вы или кто-то из ваших знакомых испытывает проблемы с азартными играми, обратитесь за помощью.</p>
              </div>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Link href="/legal/privacy">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/legal/terms">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</a>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/legal/aml">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">AML Policy</a>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/legal/kyc">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">KYC Policy</a>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/legal/responsible-gaming">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Responsible Gaming</a>
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/legal/self-exclusion">
              <a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Self-Exclusion</a>
            </Link>
          </div>
          
          <div className="text-center text-muted-foreground">
            <p>&copy; 2025 GrowHackingGame. Все права защищены.</p>
            <p className="text-sm mt-2">Играй ответственно. Понимай правила перед игрой.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
