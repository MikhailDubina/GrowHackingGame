import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { achievementService } from '../services/achievementService';

export const achievementsRouter = router({
  getAchievements: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Not authenticated');
    }
    
    const achievements = await achievementService.getUserAchievements(ctx.user.id);
    
    return {
      achievements,
      totalCompleted: achievements.filter((a: any) => a.completed).length,
      totalRewards: achievements
        .filter((a: any) => a.claimedAt)
        .reduce((sum: number, a: any) => sum + a.reward, 0),
    };
  }),
  
  claimReward: publicProcedure
    .input(z.object({
      achievementId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
      
      const result = await achievementService.claimReward(ctx.user.id, input.achievementId);
      
      return result;
    }),
});
