import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getPool } from "../db";
import { nanoid } from "nanoid";

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  username: string;
}

export const reviewsRouter = router({
  /**
   * Submit a review
   */
  submitReview: protectedProcedure
    .input(
      z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pool = await getPool();
      if (!pool) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Check if user already submitted a review
      const existingReview = await pool.query<Review>(
        `SELECT * FROM reviews WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );

      if (existingReview.rows.length > 0) {
        throw new Error("You have already submitted a review");
      }

      // Insert review
      const reviewId = nanoid();
      await pool.query(
        `INSERT INTO reviews (id, "userId", rating, comment, "isApproved") VALUES ($1, $2, $3, $4, $5)`,
        [reviewId, userId, input.rating, input.comment, false]
      );

      return {
        success: true,
        message: "Review submitted successfully. It will be visible after approval.",
      };
    }),

  /**
   * Get approved reviews for display
   */
  getApprovedReviews: publicProcedure
    .query(async () => {
      const pool = await getPool();
      if (!pool) {
        throw new Error("Database connection failed");
      }

      const reviews = await pool.query<Review & { username: string }>(
        `SELECT r.*, u.username 
         FROM reviews r 
         JOIN users u ON r."userId" = u.id 
         WHERE r."isApproved" = TRUE 
         ORDER BY r."createdAt" DESC 
         LIMIT 10`
      );

      return reviews.rows || [];
    }),

  /**
   * Get user's own review
   */
  getMyReview: protectedProcedure
    .query(async ({ ctx }) => {
      const pool = await getPool();
      if (!pool) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      const review = await pool.query<Review>(
        `SELECT * FROM reviews WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );

      return review.rows.length > 0 ? review.rows[0] : null;
    }),
});
