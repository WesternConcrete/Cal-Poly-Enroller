import { z } from "zod";
import { FlowchartData } from "~/dashboard/store/types";

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

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  quarters: publicProcedure.query(({ ctx }) => {
        return quarters;
    }),
});
