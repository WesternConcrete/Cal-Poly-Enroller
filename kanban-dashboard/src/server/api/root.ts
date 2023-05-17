import { createTRPCRouter } from "~/server/api/trpc";
import { polyRouter } from "~/server/api/routers/poly";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  poly: polyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
