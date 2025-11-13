import { createContext, useContext, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';

interface TelegramContextType {
  webApp: any;
  user: any;
  isInTelegram: boolean;
  userId?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isInTelegram: false,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const telegram = useTelegram();

  return (
    <TelegramContext.Provider value={telegram}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegramContext() {
  return useContext(TelegramContext);
}
