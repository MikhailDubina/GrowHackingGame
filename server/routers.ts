import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { gameRouter } from "./routers/game";
import { shopRouter } from "./routers/shop";
import { webhookRouter } from "./routers/webhook";
import { leaderboardRouter } from "./routers/leaderboard";
import { matchThreeRouter } from "./routers/matchThree";
import { demoAuthRouter } from "./routers/demoAuth";
import { treasureHuntRouter } from "./routers/treasureHunt";
import { promoRouter } from "./routers/promo";
import { dailyChallengesRouter } from './routers/dailyChallenges';
import { achievementsRouter } from './routers/achievements';
import { divisionsRouter } from './routers/divisions';
import { referralRouter } from './routers/referral';
import { reviewsRouter } from './routers/reviews';
import { authRouter } from './routers/auth';
import { telegramRouter } from './routers/telegram';
import { telegramStarsRouter } from './routers/telegramStars';

export const appRouter = router({
  system: systemRouter,
  game: gameRouter,
  shop: shopRouter,
  webhook: webhookRouter,
  leaderboard: leaderboardRouter,
  matchThree: matchThreeRouter,
  demoAuth: demoAuthRouter,
  treasureHunt: treasureHuntRouter,
  promo: promoRouter,
  dailyChallenges: dailyChallengesRouter,
  achievements: achievementsRouter,
  divisions: divisionsRouter,
  referral: referralRouter,
  reviews: reviewsRouter,
  auth: authRouter,
  telegram: telegramRouter,
  telegramStars: telegramStarsRouter,

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
