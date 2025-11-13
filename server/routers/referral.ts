import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { referralService } from '../services/referralService';

export const referralRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Not authenticated');
    }
    
    const stats = await referralService.getReferralStats(ctx.user.id);
    
    return stats;
  }),
  
  applyCode: publicProcedure
    .input(z.object({
      code: z.string().min(6).max(6),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }
      
      const result = await referralService.applyReferralCode(ctx.user.id, input.code);
      
      return result;
    }),
});
