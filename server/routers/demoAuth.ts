import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { z } from "zod";
import { sdk } from "../_core/sdk";
import { TRPCError } from "@trpc/server";

/**
 * Demo Authentication Router
 * Allows users to create demo accounts without OAuth
 * Supports both demo (virtual coins) and real (real money) account types
 */

export const demoAuthRouter = router({
  /**
   * Create a demo user account
   */
  createDemoUser: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(20),
        accountType: z.enum(["demo", "real"]).default("demo"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { username, accountType } = input;
      
      // Generate a unique user ID based on account type
      const prefix = accountType === "real" ? "real" : "demo";
      const userId = `${prefix}_${username}_${Date.now()}`;
      
      try {
        // Create user in database
        await db.upsertUser({
          id: userId,
          name: username,
          email: null,
          loginMethod: accountType === "real" ? "real" : "demo",
          accountType: accountType,
          lastSignedIn: new Date(),
        });
        
        // Initialize user balance
        // Real accounts start with 0 coins, demo accounts start with 5000
        const startingBalance = accountType === "real" ? 0 : 5000;
        await db.initializeUserBalance(userId, startingBalance);
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(userId, {
          name: username,
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set cookie
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ONE_YEAR_MS,
          path: "/",
        });
        
        return {
          success: true,
          user: {
            id: userId,
            name: username,
            accountType: accountType,
            balance: startingBalance,
          },
        };
      } catch (error) {
        console.error("[DemoAuth] Failed to create user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create account",
        });
      }
    }),

  /**
   * Login with existing account
   */
  loginDemo: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = input;
      
      // Verify it's a valid account
      if (!userId.startsWith("demo_") && !userId.startsWith("real_")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid user ID",
        });
      }
      
      try {
        // Get user from database
        const user = await db.getUser(userId);
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Account not found",
          });
        }
        
        // Update last signed in
        await db.upsertUser({
          ...user,
          lastSignedIn: new Date(),
        });
        
        // Create session token
        const sessionToken = await sdk.createSessionToken(userId, {
          name: user.name || "User",
          expiresInMs: ONE_YEAR_MS,
        });
        
        // Set cookie
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: ONE_YEAR_MS,
          path: "/",
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            accountType: user.accountType || "demo",
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[DemoAuth] Failed to login user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to login to account",
        });
      }
    }),

  /**
   * Quick demo login - creates or logs in as guest (demo mode only)
   */
  quickDemo: publicProcedure.mutation(async ({ ctx }) => {
    const guestId = `demo_guest_${Date.now()}`;
    const guestName = `Guest${Math.floor(Math.random() * 10000)}`;
    
    try {
      // Create guest user
      await db.upsertUser({
        id: guestId,
        name: guestName,
        email: null,
        loginMethod: "demo",
        accountType: "demo",
        lastSignedIn: new Date(),
      });
      
      // Initialize balance with demo coins
      await db.initializeUserBalance(guestId, 5000);
      
      // Create session
      const sessionToken = await sdk.createSessionToken(guestId, {
        name: guestName,
        expiresInMs: ONE_YEAR_MS,
      });
      
      // Set cookie
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: ONE_YEAR_MS,
        path: "/",
      });
      
      return {
        success: true,
        user: {
          id: guestId,
          name: guestName,
          accountType: "demo",
          balance: 5000,
        },
      };
    } catch (error) {
      console.error("[DemoAuth] Quick demo failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create guest account",
      });
    }
  }),

  /**
   * Switch account type (demo to real or vice versa)
   */
  switchAccountType: publicProcedure
    .input(
      z.object({
        targetType: z.enum(["demo", "real"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Must be logged in to switch account type",
        });
      }

      const { targetType } = input;
      const currentUser = await db.getUser(ctx.user.id);

      if (!currentUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Update account type
      await db.upsertUser({
        ...currentUser,
        accountType: targetType,
      });

      return {
        success: true,
        accountType: targetType,
        message: `Switched to ${targetType} account mode`,
      };
    }),
});
