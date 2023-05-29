import { type UUID } from "crypto";
import { z } from "zod";
import { CompleteStatus, type FlowchartData } from "~/dashboard/store/types";
import { type Course, CourseType } from "~/dashboard/store/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
const completeStatus_arr = Object.values(CompleteStatus);

const courses = [
  {
    title: "CSC 101",
    description: "Intro to Computer Science",
    units: 4,
  },
  {
    title: "CSC 102",
    description: "Data Structures and Algorithms",
    units: 4,
  },
  {
    title: "CSC 202",
    description: "Discrete Structures",
    units: 4,
  },
  {
    title: "CSC 225",
    description: "Introduction to Computer Organization",
    units: 4,
  },
  {
    title: "CSC 248",
    description: "Introduction to Database Systems",
    units: 4,
  },
  {
    title: "CSC 307",
    description: "Systems Programming",
    units: 4,
  },
  {
    title: "CSC 357",
    description: "Design & Analysis of Algorithms",
    units: 4,
  },
  {
    title: "CSC 453",
    description: "Operating Systems",
    units: 4,
  },
  {
    title: "CSC 491",
    description: "Senior Project Lab I",
    units: 4,
  },
  {
    title: "CSC 492",
    description: "Senior Project Lab II",
    units: 4,
  },
  {
    title: "CSC 497",
    description: "Research Senior Project I",
    units: 4,
  },
  {
    title: "CPE 102",
    description: "Introduction to Computer Science II",
    units: 4,
  },
  {
    title: "CPE 103",
    description: "Object-Oriented Design",
    units: 4,
  },
  {
    title: "CPE 357",
    description: "Introduction to Software Engineering",
    units: 4,
  },
  {
    title: "MATH 141",
    description: "Calculus I",
    units: 4,
  },
  {
    title: "MATH 142",
    description: "Calculus II",
    units: 4,
  },
  {
    title: "MATH 206",
    description: "Statistical Methods for Engineers",
    units: 4,
  },
  {
    title: "MATH 244",
    description: "Applied Linear Models",
    units: 4,
  },
] as Partial<Course>[];

const generateQuarterSchedules = () => {
  return [...courses, ...courses].map((course) => {
    const courseType =
      courseType_arr[Math.round(Math.random() * courseType_arr.length)];
    const completeStatus =
      completeStatus_arr[Math.round(Math.random() * completeStatus_arr.length)];
    const status = statuses[Math.round(Math.random() * statuses.length)];
    return {
      ...course,
      courseType,
      completeStatus,
      status,
    };
  });
};

export const polyRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  quarters: publicProcedure.query(() => {
    return quarters;
  }),
  courses: publicProcedure.query(() => {
    return generateQuarterSchedules();
  }),
});
