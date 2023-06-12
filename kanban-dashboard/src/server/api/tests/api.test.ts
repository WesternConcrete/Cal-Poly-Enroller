vi.mock("~/server/db"); // 1
import prismaMock from "~/server/__mocks__/db";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "~/server/api/root";

import { z } from "zod";
import { generateMock as m } from "@anatine/zod-mock";
import {
  CourseRequirement,
  Subject,
  Course,
  CourseRequirementGroup,
  GERequirement,
  Concentration,
  Degree,
  GEAreaFullfillmentCourse,
} from "@prisma/client";
import { GEDataSchema } from "~/scraping/catalog";

// Enum: Term
enum TermEnum {
  F = "F",
  W = "W",
  SP = "SP",
  SU = "SU",
}

// Enum: GEArea
enum GEAreaEnum {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  ELECTIVE = "ELECTIVE",
}

// Enum: GESubArea
enum GESubAreaEnum {
  LowerDivision = "LowerDivision",
  UpperDivision = "UpperDivision",
  LowerDivisionElective = "LowerDivisionElective",
  UpperDivisionElective = "UpperDivisionElective",
  F = "F",
  E = "E",
  Elective = "Elective",
  A1 = "A1",
  A2 = "A2",
  A3 = "A3",
  A4 = "A4",
  B1 = "B1",
  B2 = "B2",
  B3 = "B3",
  B4 = "B4",
  C1 = "C1",
  C2 = "C2",
  C3 = "C3",
  C4 = "C4",
  D1 = "D1",
  D2 = "D2",
  D3 = "D3",
  D4 = "D4",
}

// Enum: RequirementKind
enum RequirementKindEnum {
  major = "major",
  support = "support",
  elective = "elective",
}

// Enum: RequirementGroupKind
enum RequirementGroupKindEnum {
  or = "or",
  and = "and",
}
// Course schema
const courseSchema: z.ZodType<Course> = z.object({
  code: z.string(),
  subjectCode: z.string(),
  title: z.string(),
  number: z.number(),
  description: z.string(),
  minUnits: z.number(),
  maxUnits: z.number(),
  termsTypicallyOffered: z.string(),
  USCP: z.boolean(),
  GWR: z.boolean(),
});

// Subject schema
const subjectSchema: z.ZodType<Subject> = z.object({
  code: z.string(),
  name: z.string(),
});

// GERequirement schema
const geRequirementSchema: z.ZodType<GERequirement> = z.object({
  area: z.nativeEnum(GEAreaEnum),
  subArea: z.nativeEnum(GESubAreaEnum),
  units: z.number(),
  recommendedCompletionYear: z.number().nullable(),
  recommendedCompletionTerm: z.nativeEnum(TermEnum).nullable(),
  degreeId: z.string(),
});

// CourseRequirement schema
const courseRequirementSchema: z.ZodType<CourseRequirement> = z.object({
  courseCode: z.string(),
  units: z.number(),
  course: courseSchema.nullable(),
  kind: z.nativeEnum(RequirementKindEnum),
  recommendedCompletionYear: z.number().nullable(),
  recommendedCompletionTerm: z.nativeEnum(TermEnum).nullable(),
  requirementGroupId: z.number(),
});

// CourseRequirementGroup schema
const courseRequirementGroupSchema: z.ZodType<CourseRequirementGroup> =
  z.object({
    id: z.number(),
    groupKind: z.nativeEnum(RequirementGroupKindEnum),
    coursesKind: z.nativeEnum(RequirementKindEnum),
    courseKindInfo: z.string().nullable(),
    courses: z.lazy(() => z.array(courseRequirementSchema)),
    parentId: z.number().nullable(),
    parent: z.lazy(() => courseRequirementGroupSchema).nullable(),
    unitsOf: z.number().nullable(),
    degreeId: z.string().nullable(),
    degree: z.lazy(() => degreeSchema).nullable(),
    concentrationId: z.string().nullable(),
    concentration: z.lazy(() => concentrationSchema).nullable(),
  });

// Concentration schema
const concentrationSchema: z.ZodType<Concentration> = z.object({
  id: z.string(),
  name: z.string(),
  degreeId: z.string(),
});

// Degree schema
const degreeSchema: z.ZodType<Degree> = z.object({
  id: z.string(),
  name: z.string(),
  link: z.string(),
  kind: z.string(),
});

// GEAreaFullfillmentCourse schema
const geAreaFullfillmentCourseSchema: z.ZodType<GEAreaFullfillmentCourse> =
  z.object({
    id: z.number(),
    area: z.nativeEnum(GEAreaEnum),
    subArea: z.nativeEnum(GESubAreaEnum),
    courseId: z.string(),
  });

describe("api testing", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  const trpc = appRouter.createCaller({ prisma: prismaMock });

  describe("quarters", async () => {
    it("should return 12 quarters", async () => {
      const quarters = await trpc.quarters.all({ startYear: 2021 });
      expect(quarters.length).toEqual(12);
    });
    it("should return the current quarter", async () => {
      const mockCurrentQuarter = vi.fn();
      vi.doMock("~/scraping/registrar", async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...mod,
          scrapeCurrentQuarter: mockCurrentQuarter,
        };
      });
      mockCurrentQuarter.mockResolvedValue(2233);
      const currentQuarter = await trpc.quarters.current();
      expect(currentQuarter).toBeDefined();
      expect(currentQuarter).toEqual(2233);
    });
  });
  describe("concentrations", async () => {
    const degreeId = "123";
    const mConcs = m(z.array(concentrationSchema).length(3)).map((c) => ({
      ...c,
      degreeId,
    }));
    prismaMock.concentration.findMany.mockResolvedValue(mConcs);
    let concs = await trpc.degrees.concentrations({ degreeId });
    concs.forEach((c) =>
      expect(mConcs.find((s) => s.id === c.id && s.id === c.id)).toBeDefined()
    );
  });
  describe("degrees", async () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it("getting all degrees succeeds", async () => {
      prismaMock.degree.findMany.mockResolvedValue(
        m(z.array(degreeSchema).length(10))
      );
      const degrees = await trpc.degrees.all();
      expect(degrees).toBeDefined();
      expect(degrees.length).toEqual(10);
    });
    it("should return degree requirements", async () => {
      const degreeId = "123";
      let gs = m(z.array(courseRequirementGroupSchema).length(1)).map((g) => ({
        ...g,
        degreeId,
        subGroups: [],
        courses: m(z.array(courseRequirementSchema).length(3)),
      }));
      prismaMock.courseRequirementGroup.findMany.mockResolvedValue(gs);
      prismaMock.gERequirement.findMany.mockResolvedValue([]);
      if (new Set(gs.map((g) => g.id)).size !== 3) {
        expect(
          async () =>
            await trpc.degrees.requirements({
              degreeId,
              startYear: 2021,
            })
        ).toThrowError();
      } else {
        const requirements = await trpc.degrees.requirements({
          degreeId,
          startYear: 2021,
        });

        expect(requirements.length).toEqual(3);
      }
    });
    it("should return ge requirements", async () => {
      const degreeId = "123";
      let ges = m(z.array(geRequirementSchema).length(3)).map((g) => ({
        ...g,
        degreeId,
      }));
      prismaMock.courseRequirementGroup.findMany.mockResolvedValue([]);
      prismaMock.gERequirement.findMany.mockResolvedValue(ges);
      if (new Set(ges.map((g) => `${g.area}-${g.subArea}`)).size !== 3) {
        expect(
          async () =>
            await trpc.degrees.requirements({
              degreeId,
              startYear: 2021,
            })
        ).toThrowError();
      } else {
        const requirements = await trpc.degrees.requirements({
          degreeId,
          startYear: 2021,
        });

        expect(requirements.length).toEqual(3);
      }
    });
  });
  describe("fullfillments", async () => {
    it("uscp", async () => {
      const mockedGEFullfillments = vi.fn();

      vi.doMock("~/scraping/catalog", async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...mod,
          scrapeCourseGEFullfillments: mockedGEFullfillments,
        };
      });
      let degreeId = "123";
      let course = m(courseSchema);
      prismaMock.course.findMany.mockResolvedValue([course]);
      mockedGEFullfillments.mockResolvedValue(
        new Map([["USCP", { fullFilledBy: [course.code] }]])
      );
      const fullfillments = await trpc.fulllfillments({
        group: { kind: "uscp", degreeId },
      });
      let { code, maxUnits: units, title } = course;
      expect(fullfillments).toEqual([{ code, units, title }]);
    });
    it("gwr", async () => {
      const mockedGEFullfillments = vi.fn();

      vi.doMock("~/scraping/catalog", async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...mod,
          scrapeCourseGEFullfillments: mockedGEFullfillments,
        };
      });
      let degreeId = "123";
      let course = m(courseSchema);
      prismaMock.course.findMany.mockResolvedValue([course]);
      let reqs = new Map([["GWR", { fullFilledBy: [course.code] }]]);
      expect(reqs.get("GWR")?.fullFilledBy).toBeDefined();
      mockedGEFullfillments.mockResolvedValue(reqs);
      const fullfillments = await trpc.fulllfillments({
        group: { kind: "gwr", degreeId },
      });
      let { code, maxUnits: units, title } = course;
      expect(fullfillments).toEqual([{ code, units, title }]);
    });
    it("ge", async () => {
      const mockedGEFullfillments = vi.fn();

      vi.doMock("~/scraping/catalog", async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...mod,
          scrapeCourseGEFullfillments: mockedGEFullfillments,
        };
      });
      let course = m(courseSchema);
      let area = m(z.nativeEnum(GEAreaEnum));
      let subArea = m(z.nativeEnum(GESubAreaEnum));
      prismaMock.course.findMany.mockResolvedValue([course]);
      let reqs = new Map([
        [area, { subareas: { [subArea]: { fullFilledBy: [course.code] } } }],
      ]);
      mockedGEFullfillments.mockResolvedValue(reqs);
      const fullfillments = await trpc.fulllfillments({
        group: { kind: "ge", area, subArea },
      });
      let { code, maxUnits: units, title } = course;
      expect(fullfillments).toEqual([{ code, units, title }]);
    });
    it("elective", async () => {
      const mockedGEFullfillments = vi.fn();

      vi.doMock("~/scraping/catalog", async (importOriginal) => {
        const mod = await importOriginal();
        return {
          ...mod,
          scrapeCourseGEFullfillments: mockedGEFullfillments,
        };
      });
      let degreeId = "123";
      let cg = m(courseRequirementGroupSchema);
      cg.groupKind = "or";
      cg.courses = [m(courseRequirementSchema)];
      prismaMock.courseRequirementGroup.findUnique.mockResolvedValue(cg);
      const fullfillments = await trpc.fulllfillments({
        group: { kind: "elective", groupId: cg.id, degreeId },
      });
      let course = cg.courses[0].course;
      expect(fullfillments[0]).toEqual({
        code: course.code,
        title: course.title,
        units: course.maxUnits,
      });
    });
  });
});
