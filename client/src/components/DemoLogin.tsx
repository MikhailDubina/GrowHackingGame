import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Rocket } from 'lucide-react';

export function DemoLogin() {
  const quickDemoMutation = trpc.demoAuth.quickDemo.useMutation({
    onSuccess: () => {
      window.location.href = '/home';
    },
  });

  const handleQuickDemo = async () => {
    try {
      await quickDemoMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to create guest account:', error);
      alert('Не удалось создать гостевой аккаунт');
    }
  };

  const isLoading = quickDemoMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Rocket className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Демо режим</CardTitle>
          <CardDescription className="text-lg mt-2">
            Попробуйте платформу бесплатно!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quick Demo Button */}
          <div className="space-y-3">
            <Button
              onClick={handleQuickDemo}
              disabled={isLoading}
              className="w-full h-14 text-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-6 w-6" />
                  Быстрый старт
                </>
              )}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Начните играть сразу без регистрации
            </p>
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Что включено:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✅ Начальный баланс: 1000 монет</li>
              <li>✅ Полный доступ ко всем играм</li>
              <li>✅ Сохранение прогресса</li>
              <li>✅ Участие в лидерборде</li>
            </ul>
          </div>

          {/* Link to registration */}
          <div className="text-center text-sm">
            <p className="text-muted-foreground mb-2">
              Хотите играть на реальные деньги?
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/register'}
            >
              Создать реальный аккаунт
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
