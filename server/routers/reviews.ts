import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getRawDb } from "../db";
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
      const db = await getRawDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      // Check if user already submitted a review
      const [existingReview] = await db.execute<Review[]>(
        `SELECT * FROM reviews WHERE userId = ? LIMIT 1`,
        [userId]
      );

      if (existingReview && existingReview.length > 0) {
        throw new Error("You have already submitted a review");
      }

      // Insert review
      const reviewId = nanoid();
      await db.execute(
        `INSERT INTO reviews (id, userId, rating, comment, isApproved) VALUES (?, ?, ?, ?, ?)`,
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
      const db = await getRawDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const reviews = await db.execute<(Review & { username: string })[]>(
        `SELECT r.*, u.username 
         FROM reviews r 
         JOIN users u ON r.userId = u.id 
         WHERE r.isApproved = TRUE 
         ORDER BY r.createdAt DESC 
         LIMIT 10`
      );

      return reviews[0] || [];
    }),

  /**
   * Get user's own review
   */
  getMyReview: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getRawDb();
      if (!db) {
        throw new Error("Database connection failed");
      }

      const userId = ctx.user.id;

      const [review] = await db.execute<Review[]>(
        `SELECT * FROM reviews WHERE userId = ? LIMIT 1`,
        [userId]
      );

      return review && review.length > 0 ? review[0] : null;
    }),
});
