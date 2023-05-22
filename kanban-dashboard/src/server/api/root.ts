import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  scrapeDegrees,
  scrapeDegreeRequirements,
  type RequirementCourse,
  type Degree,
  DegreeSchema,
  RequirementTypeSchema,
} from "~/scraping/catalog";
export type { Degree, RequirementCourse, RequirementTypeSchema } from "~/scraping/catalog";
import { z } from "zod";

const quarters: { id: number; title: string }[] = [
  {
    id: 0,
    title: "Fall 1",
  },
  {
    id: 1,
    title: "Winter 1",
  },
  {
    id: 2,
    title: "Spring 1",
  },
  {
    id: 3,
    title: "Fall 2",
  },
  {
    id: 4,
    title: "Winter 2",
  },
  {
    id: 5,
    title: "Spring 2",
  },
  {
    id: 6,
    title: "Fall 3",
  },
  {
    id: 7,
    title: "Winter 3",
  },
  {
    id: 8,
    title: "Spring 3",
  },
  {
    id: 9,
    title: "Fall 4",
  },
  {
    id: 10,
    title: "Winter 4",
  },
  {
    id: 11,
    title: "Spring 4",
  },
];

const courseType_arr = RequirementTypeSchema.options;

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  currentQuarterId: publicProcedure.query(() => {
    return quarters[Math.floor(Math.random() * quarters.length)].id;
  }),
  quarters: publicProcedure.query(() => {
    return quarters;
  }),
  degreeRequirements: publicProcedure
    .input(z.object({ degree: DegreeSchema.nullable() }))
    .query(async ({ input }) => {
      if (input.degree === null) {
        return [];
      }
      const courses = await scrapeDegreeRequirements(input.degree);
      // generate random info for the data that isn't being scraped yet
      return Array.from(courses.courses.values()).map(
        (course: RequirementCourse, i) => ({
          title: course.code,
          description: course.title, // TODO: gather this from the course catalog
          units: course.units,
          courseType:
            courseType_arr[Math.floor(Math.random() * courseType_arr.length)], // TODO: figure out course type from group
          quarterId: quarters[Math.floor(Math.random() * quarters.length)].id,
          id: i,
        })
      );
    }),
  degrees: publicProcedure.query(async (): Promise<Degree[]> => {
    return scrapeDegrees();
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
