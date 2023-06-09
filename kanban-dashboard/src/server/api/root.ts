import { t } from "~/server/api/trpc";
import {
  scrapeDegrees,
  scrapeDegreeRequirements,
  type RequirementCourse,
  DegreeSchema,
  RequirementTypeSchema,
  RequirementType,
} from "~/scraping/catalog";
export type {
  Degree,
  RequirementCourse,
  RequirementTypeSchema,
} from "~/scraping/catalog";
import { z } from "zod";
import {
  TERM_NUMBER,
  type Term,
  scrapeCurrentQuarter,
  termCode,
} from "~/scraping/registrar";

const courseType_arr = RequirementTypeSchema.options;

const YearSchema = z
  .number()
  .gte(0, { message: "year < 0" })
  .lt(4, { message: "year >= 4" });
const SchoolYearTermSchema = z.union([
  z.literal(2),
  z.literal(4),
  z.literal(8),
]);

const RequirementSchema = z.object({
  code: z.string(), // TODO: validate course code
  id: z.string(),
  title: z.string(),
  courseType: RequirementTypeSchema,
  units: z.number().nonnegative(),
  quarterId: z.number().gte(2000, { message: "term code < 2000" }), // see termCode function in scraping/registrar.ts for details
});
export type Requirement = z.infer<typeof RequirementSchema>;

const QuarterSchema = z.object({
  id: z.number().gte(2000, { message: "term code < 2000" }), // see termCode function in scraping/registrar.ts for details
  year: YearSchema,
  termNum: SchoolYearTermSchema,
});

export type Quarter = z.infer<typeof QuarterSchema>;

const randomQuarter = (startYear: number) => {
  return termCode(
    Math.floor(Math.random() * 4) + startYear,
    SchoolYearTermSchema.parse([2, 4, 8][Math.floor(Math.random() * 3)])
  );
};
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = t.router({
  quarters: t.router({
    current: t.procedure.output(z.number().gt(2000)).query(async () => {
      return await scrapeCurrentQuarter();
    }),
    all: t.procedure
      .input(z.object({ startYear: z.number().gte(2000) }))
      .query(({ input: { startYear } }) => {
        const quarters = [];

        let calYear = startYear;
        let schoolYear = 0;

        const q = (termSeason: Term) => ({
          id: termCode(calYear, termSeason),
          termNum: TERM_NUMBER[termSeason] as z.infer<
            typeof SchoolYearTermSchema
          >,
          year: schoolYear,
        });
        while (schoolYear < 4) {
          // winter/spring quarter will be in yeear 5 senior year but this is still 4th year

          quarters.push(q("fall"));
          calYear++;
          quarters.push(q("winter"));
          quarters.push(q("spring"));
          schoolYear++;
        }
        return quarters;
      }),
  }),
  degrees: t.router({
    requirements: t.procedure
      .input(
        z.object({
          degreeId: z.string().nullable(),
          startYear: z.number().gte(2000),
        })
      )
      .output(z.array(RequirementSchema))
      .query(async ({ ctx, input }) => {
        if (!input.degreeId) return [];
        const reqGroups = await ctx.prisma.courseRequirementGroup.findMany({
          where: {
            degreeId: input.degreeId,
          },
          select: {
            courses: {
              select: {
                courseCode: true,
                course: {
                  select: {
                    title: true,
                    maxUnits: true,
                    minUnits: true,
                  },
                },
              },
            },
            coursesKind: true,
            groupKind: true,
          },
        });
        const geReqs = await ctx.prisma.gERequirement.findMany({
          where: {
            degreeId: input.degreeId,
          },
          select: {
            units: true,
            area: true,
            subArea: true,
          },
        });
        return reqGroups.flatMap((group) => {
          return group.courses.map((req) => ({
            code: req.courseCode,
            id: `${group.groupKind}-${group.coursesKind}-${req.courseCode}`,
            title: req.course.title,
            courseType: group.coursesKind as RequirementType,
            quarterId: randomQuarter(input.startYear),
            units: req.course.maxUnits,
          }));
        }).concat(geReqs.map((req) => ({
            code: `${req.area}-${req.subArea}`,
            id: `${req.area}-${req.subArea}`,
            title: `${req.subArea}`,
            courseType: "ge",
            quarterId: randomQuarter(input.startYear),
            units: req.units,
        })));
      }),
    all: t.procedure
      .output(z.array(z.object({ name: z.string(), id: z.string() })))
      .query(async ({ ctx }) => {
        let degrees = await ctx.prisma.degree.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        return degrees;
      }),
    concentrations: t.procedure
      .input(z.object({ degreeId: z.string() }))
      .output(z.array(z.object({ name: z.string(), id: z.string() })))
      .query(async ({ ctx, input }) => {
        return (
          (await ctx.prisma.concentration.findMany({
            where: {
              degreeId: input.degreeId,
            },
            select: {
              name: true,
              id: true,
            },
          })) ?? []
        );
      }),
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
