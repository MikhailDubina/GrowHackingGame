import { router, publicProcedure } from "../_core/trpc";
import { globalStatsService } from "../services/globalStatsService";

export const systemRouter = router({
  /**
   * Get global platform statistics
   */
  globalStats: publicProcedure.query(async () => {
    return await globalStatsService.getGlobalStats();
  }),
});
