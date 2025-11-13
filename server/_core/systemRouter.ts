import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { globalStatsService } from '../services/globalStatsService';

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
  
  globalStats: publicProcedure.query(async () => {
    console.log('[SystemRouter] globalStats called');
    const stats = await globalStatsService.getGlobalStats();
    console.log('[SystemRouter] globalStats result:', stats);
    return stats;
  }),
});
