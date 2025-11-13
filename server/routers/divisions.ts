import { publicProcedure, router } from '../_core/trpc';
import { divisionsService } from '../services/divisionsService';

export const divisionsRouter = router({
  getUserDivision: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Not authenticated');
    }
    
    const division = await divisionsService.getUserDivision(ctx.user.id);
    
    return division;
  }),
  
  getAllDivisions: publicProcedure.query(async () => {
    const divisions = await divisionsService.getAllDivisions();
    
    return { divisions };
  }),
});
