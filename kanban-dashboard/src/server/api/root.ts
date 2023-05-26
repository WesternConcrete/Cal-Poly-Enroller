import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  scrapeDegrees,
  scrapeDegreeRequirements,
  type RequirementCourse,
  type Degree,
  DegreeSchema,
  RequirementTypeSchema,
} from "~/scraping/catalog";
export type {
  Degree,
  RequirementCourse,
  RequirementTypeSchema,
} from "~/scraping/catalog";
import { z } from "zod";
import {
  TERM_NUMBER,
  Term,
  scrapeCurrentQuarter,
  termCode,
} from "~/scraping/registrar";

type TermNum = 2 | 4 | 6 | 8;

const courseType_arr = RequirementTypeSchema.options;

const RequirementSchema = z.object({
  code: z.string(), // TODO: validate course code
  id: z.number(),
  title: z.string(),
  courseType: RequirementTypeSchema,
  units: z.number().positive(),
  year: z.number().gte(0).lt(4),
  termNum: z.number()
  // termNum: z.union([z.literal(2), z.literal(4), z.literal(6), z.literal(8)]),
});

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  currentQuarterId: publicProcedure.query(async () => {
    return await scrapeCurrentQuarter();
  }),
  quarters: publicProcedure
    .input(z.object({ startYear: z.number().gte(2000) }))
    .query(({ input: { startYear } }) => {
      let year = startYear;
      let termNum = TERM_NUMBER.fall;
      let quarters = [];
      const q = (year: number, term: Term) => ({
        id: termCode(year, term),
        title: `${term.toUpperCase()} '${year - 2000}`,
      });
      while (year < startYear + 4) {
        quarters.push(q(year, "fall"));
        year++;
        quarters.push(q(year, "winter"));
        quarters.push(q(year, "spring"));
      }
      return quarters;
    }),
  degreeRequirements: publicProcedure
    .input(z.object({ degree: DegreeSchema.nullable() }))
    .output(z.array(RequirementSchema))
    .query(async ({ input }) => {
      if (input.degree === null) {
        return [];
      }
      const courses = await scrapeDegreeRequirements(input.degree);
      // generate random info for the data that isn't being scraped yet
      return Array.from(courses.courses.values()).map(
        (course: RequirementCourse, i) => ({
          ...course,
          courseType:
            courseType_arr[Math.floor(Math.random() * courseType_arr.length)], // TODO: figure out course type from group
          year: Math.floor(Math.random() * 4),
          termNum: (Math.floor(Math.random() * 4) * 2) as TermNum,
          id: i,
        })
      );
    }),
  degrees: publicProcedure.query(async () => {
    return scrapeDegrees();
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
