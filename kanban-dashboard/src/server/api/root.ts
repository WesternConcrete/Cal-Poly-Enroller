import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { type UUID } from "crypto";
import { type FlowchartData } from "~/dashboard/store/types";
import { type Course, CourseType } from "~/dashboard/store/types";
import {
  scrapeDegrees,
  scrapeDegreeRequirements,
  type RequirementCourse,
  type Degree,
  DegreeSchema,
} from "~/scraping/catalog";
export type { Degree, RequirementCourse } from "~/scraping/catalog";
import { z } from "zod";

const quarters: FlowchartData = {
  entities: {
    user: {},
    task: {},
    status: {
      "c41ba2a3-5068-4a8f-b8b0-568ca295ef56": {
        id: "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
        title: "Fall 1",
        taskIds: [],
      },
      "49237786-3411-4ab5-974e-3b0078643bab": {
        id: "49237786-3411-4ab5-974e-3b0078643bab",
        title: "Winter 1",
        taskIds: [],
      },
      "c40bfef2-31c2-4228-a8cc-22b52974fbc7": {
        id: "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        title: "Spring 1",
        taskIds: [],
      },

      "c41ba2a3-5068-4a8f-b8b5-568ca295ef56": {
        id: "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
        title: "Fall 2",
        taskIds: [],
      },
      "49237786-3411-4ab5-9745-3b0078643bab": {
        id: "49237786-3411-4ab5-974e-3b0078643bab",
        title: "Winter 2",
        taskIds: [],
      },
      "c40bfef2-31c2-4228-a8c5-22b52974fbc7": {
        id: "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        title: "Spring 2",
        taskIds: [],
      },

      "c41ba2a3-5068-4a8f-b8b6-568ca295ef56": {
        id: "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
        title: "Fall 3",
        taskIds: [],
      },
      "49237786-3411-4ab5-9746-3b0078643bab": {
        id: "49237786-3411-4ab5-974e-3b0078643bab",
        title: "Winter 3",
        taskIds: [],
      },
      "c40bfef2-31c2-4228-a8c6-22b52974fbc7": {
        id: "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        title: "Spring 3",
        taskIds: [],
      },

      "c41ba2a3-5068-4a8f-b8b7-568ca295ef56": {
        id: "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
        title: "Fall 4",
        taskIds: [],
      },
      "49237786-3411-4ab5-9747-3b0078643bab": {
        id: "49237786-3411-4ab5-974e-3b0078643bab",
        title: "Winter 4",
        taskIds: [],
      },
      "c40bfef2-31c2-4228-a8c7-22b52974fbc7": {
        id: "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
        title: "Spring 4",
        taskIds: [],
      },
    },
    tag: {},
    comment: {},
  },
  ids: {
    user: [],
    task: [],
    status: [
      "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
      "49237786-3411-4ab5-974e-3b0078643bab",
      "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
      "c41ba2a3-5068-4a8f-b8b5-568ca295ef56",
      "49237786-3411-4ab5-9745-3b0078643bab",
      "c40bfef2-31c2-4228-a8c5-22b52974fbc7",
      "c41ba2a3-5068-4a8f-b8b6-568ca295ef56",
      "49237786-3411-4ab5-9746-3b0078643bab",
      "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
      "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
      "49237786-3411-4ab5-9747-3b0078643bab",
      "c40bfef2-31c2-4228-a8c7-22b52974fbc7",
    ],
    tag: [],
    comment: [],
  },
};

const statuses: UUID[] = [
  "c41ba2a3-5068-4a8f-b8b0-568ca295ef56",
  "49237786-3411-4ab5-974e-3b0078643bab",
  "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
  "c40bfef2-31c2-4228-a8cc-22b52974fbc7",
  "c41ba2a3-5068-4a8f-b8b5-568ca295ef56",
  "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
  "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
  "c41ba2a3-5068-4a8f-b8b6-568ca295ef56",
  "49237786-3411-4ab5-9746-3b0078643bab",
  "c40bfef2-31c2-4228-a8c6-22b52974fbc7",
  "c41ba2a3-5068-4a8f-b8b7-568ca295ef56",
  "49237786-3411-4ab5-9747-3b0078643bab",
  "c40bfef2-31c2-4228-a8c7-22b52974fbc7",
];

const courseType_arr = Object.values(CourseType);

// TODO: remove this once degree selection is added
const CSC_DEGREE: Degree = {
  name: "Computer Science",
  kind: "BS",
  link: "https://catalog.calpoly.edu/collegesandprograms/collegeofengineering/computersciencesoftwareengineering/bscomputerscience/",
  id: 1000,
};

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  quarters: publicProcedure.query(() => {
    return quarters;
  }),
  degreeRequirements: publicProcedure
    .input(z.object({ degree: DegreeSchema.default(CSC_DEGREE) }))
    .query(async ({ input }) => {
      const courses = await scrapeDegreeRequirements(input.degree);
      // generate random info for the data that isn't being scraped yet
      return Array.from(courses.courses.values()).map(
        (course: RequirementCourse) => ({
          title: course.code,
          description: course.title, // TODO: gather this from the course catalog
          units: course.units,
          courseType:
            courseType_arr[Math.round(Math.random() * courseType_arr.length)], // TODO: figure out course type from group
          status: statuses[Math.round(Math.random() * statuses.length)],
        })
      );
    }),
  degrees: publicProcedure.query(async (): Promise<Degree[]> => {
    return scrapeDegrees();
  }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
