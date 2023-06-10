import { t } from "~/server/api/trpc";
import {
  RequirementTypeSchema,
  RequirementType,
  scrapeCourseGEFullfillments,
  GEData,
  GEAreasEnumSchema,
  GESubAreasEnumSchema,
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

const YearSchema = z
  .number()
  .gte(0, { message: "year < 0" })
  .lt(4, { message: "year >= 4" });
const SchoolYearTermSchema = z.union([
  z.literal(2),
  z.literal(4),
  z.literal(8),
]);

export const GroupSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("ge"),
    area: GEAreasEnumSchema,
    subArea: GESubAreasEnumSchema,
  }),
  z.object({ kind: z.literal("uscp"), degreeId: z.string() }),
  z.object({ kind: z.literal("gwr"), degreeId: z.string() }),
  z.object({
    kind: z.literal("elective"),
    groupId: z.number(),
    degreeId: z.string(),
  }),
]);

const RequirementSchema = z.object({
  code: z.string(), // TODO: validate course code
  id: z.string(),
  title: z.string(),
  courseType: RequirementTypeSchema,
  units: z.number().nonnegative(),
  quarterId: z.number().gte(2000, { message: "term code < 2000" }), // see termCode function in scraping/registrar.ts for details
  groupId: GroupSchema.optional(),
});

export type Requirement = z.infer<typeof RequirementSchema>;
export type JustCourseInfo = Pick<Requirement, "title" | "code" | "units">;

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
            childGroups: {
              select: {
                id: true,
                unitsOf: true,
                coursesKind: true,
                courseKindInfo: true,
                groupKind: true,
              },
            },
            coursesKind: true,
            courseKindInfo: true,
            groupKind: true,
            unitsOf: true,
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
        let courses = [];

        for (let group of reqGroups) {
          courses = courses.concat(
            group.courses.map((req) => ({
              code: req.courseCode,
              id: `${group.groupKind}-${group.coursesKind}-${req.courseCode}`,
              title: req.course.title,
              courseType: group.coursesKind as RequirementType,
              quarterId: randomQuarter(input.startYear),
              units: req.course.maxUnits,
            }))
          );
        }

        for (let group of reqGroups) {
            for (let childGroup of group.childGroups ?? []) {
            switch (childGroup.groupKind) {
              case "or":
                if (!childGroup.unitsOf || !group.unitsOf)
                  childGroup.unitsOf = 4;
                let numCourses = (childGroup.unitsOf ?? group.unitsOf) / 4;
                if (numCourses < 1) numCourses = 1;
                let code;
                let title;
                if (group.coursesKind === "elective") {
                  code = group.courseKindInfo
                    ? group.courseKindInfo + " " + "Elective"
                    : "Elective";
                  title = "";
                } else {
                  console.warn("skipping group:", { group });
                  return;
                }
                for (let i = 0; i < numCourses; i++) {
                  courses.push({
                    code,
                    title,
                    id: `${group.groupKind}-${group.coursesKind}-${group.courseKindInfo}-${i}`,
                    courseType: group.coursesKind as RequirementType,
                    quarterId: randomQuarter(input.startYear),
                    units: childGroup.unitsOf ?? group.unitsOf,
                    groupId: {
                      kind: "elective",
                      groupId: childGroup.id,
                      degreeId: input.degreeId,
                    },
                  });
                }
                break;
              case "and":
              // FIXME: fetch courses

              // let subGroupCourses =
              //   (await ctx.prisma.courseRequirementGroup.findUnique({
              //     where: {
              //       id: childGroup.id,
              //     },
              //     select: {
              //       courses: {
              //         select: {
              //           courseCode: true,
              //           course: {
              //             select: {
              //               title: true,
              //             },
              //           },
              //         },
              //       },
              //     },
              //   })) ?? { courses: [] };
              // courses = courses.concat(
              //   subGroupCourses.courses.map((req) => ({
              //     code: req.courseCode,
              //     title: req.course.title,
              //     id: `${group.groupKind}-${group.coursesKind}-${req.courseCode}`,
              //     courseType: group.coursesKind as RequirementType,
              //     quarterId: randomQuarter(input.startYear),
              //     units: group.unitsOf,
              //   }))
              // );
            }
          };
        }
        courses = courses.concat(
          geReqs.map((req) => ({
            code: !!req.subArea.match(/[A-E]\d/)
              ? `GE ${req.subArea}`
              : `GE ${req.subArea
                  .replace("Div", "-Div")
                  .replace("Elective", "")} Area ${req.area}${
                  req.subArea.includes("Elective") ? " Elective" : ""
                }`,
            id: `${req.area}-${req.subArea}`,
            title: `${req.subArea}`,
            courseType: "ge",
            quarterId: randomQuarter(input.startYear),
            units: req.units,
            groupId: {
              kind: "ge",
              area: req.area,
              subArea: req.subArea,
              degreeId: input.degreeId,
            },
          }))
        );
        console.dir(courses, { depth: null });
        let courseSet = new Set(courses.map((c) => c.id));
        if (courseSet.size !== courses.length)
          throw new Error(
            `only ${courseSet.size} unique ids in ${courses.length} courses`
          );
        return courses;
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
  fulllfillments: t.procedure
    .input(z.object({ group: GroupSchema.optional() }))
    .output(
      z.array(
        z.object({ code: z.string(), title: z.string(), units: z.number() })
      )
    )
    .query(async ({ ctx, input }) => {
      if (!input.group) return [];
      let reqs: GEData;
      let courses: JustCourseInfo[];
      switch (input.group.kind) {
        case "uscp":
          reqs = await scrapeCourseGEFullfillments();
          courses = await ctx.prisma.course
            .findMany({
              select: { code: true, title: true, maxUnits: true },
            })
            .then((cs) =>
              cs
                .filter((c) => reqs.get("USCP")!.fullfilledBy.includes(c.code))
                .map((cs) => ({
                  code: cs.code,
                  title: cs.title,
                  units: cs.maxUnits,
                }))
            );
          break;
        case "gwr":
          reqs = await scrapeCourseGEFullfillments();
          courses = await ctx.prisma.course
            .findMany({
              select: { code: true, title: true, maxUnits: true },
            })
            .then((cs) =>
              cs
                .filter((c) => reqs.get("GWR").fullfilledBy!.includes(c.code))
                .map((cs) => ({
                  code: cs.code,
                  title: cs.title,
                  units: cs.maxUnits,
                }))
            );
          break;
        case "ge":
          reqs = await scrapeCourseGEFullfillments();
          const { area, subArea } = input.group;
          courses = await ctx.prisma.course
            .findMany({
              select: { code: true, title: true, maxUnits: true },
            })
            .then((cs) =>
              cs
                .filter((c) =>
                  reqs
                    .get(area)
                    ?.subareas[subArea].fullfilledBy.includes(c.code)
                )
                .map((cs) => ({
                  code: cs.code,
                  title: cs.title,
                  units: cs.maxUnits,
                }))
            );
          break;
        case "elective":
          courses = await ctx.prisma.courseRequirementGroup
            .findUnique({
              where: {
                id: input.group.groupId,
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
              },
            })
            .then((courses) => {
              if (!courses) return [];

              return courses.courses.map((course) => ({
                code: course.courseCode,
                title: course.course.title,
                units: course.course.maxUnits,
              }));
            });
          break;
      }
      return courses ?? [];
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
