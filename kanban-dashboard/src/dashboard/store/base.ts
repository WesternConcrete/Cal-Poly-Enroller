import makeNormalizedSlice, { Cardinalities, Schema } from "normalized-reducer";
import { FlowchartData } from "./types";

const { MANY, ONE } = Cardinalities;

export const schema: Schema = {
  user: {
    createdCourseIds: {
      type: "task",
      cardinality: MANY,
      reciprocal: "creatorId",
    },
    assignedCourseIds: {
      type: "task",
      cardinality: MANY,
      reciprocal: "assigneeId",
    },
    commentIds: { type: "comment", cardinality: MANY, reciprocal: "creatorId" },
  },
  task: {
    creatorId: {
      type: "user",
      cardinality: ONE,
      reciprocal: "createdCourseIds",
    },
    assigneeId: {
      type: "user",
      cardinality: ONE,
      reciprocal: "assignedCourseIds",
    },
    statusId: { type: "status", cardinality: ONE, reciprocal: "taskIds" },
    tagIds: { type: "tag", cardinality: MANY, reciprocal: "taskIds" },
    rootCommentIds: {
      type: "comment",
      cardinality: MANY,
      reciprocal: "taskId",
    },
  },
  status: {
    taskIds: { type: "task", cardinality: MANY, reciprocal: "statusId" },
  },
  tag: {
    taskIds: { type: "task", cardinality: MANY, reciprocal: "tagIds" },
  },
  comment: {
    creatorId: { type: "user", cardinality: ONE, reciprocal: "commentIds" },
    taskId: { type: "task", cardinality: ONE, reciprocal: "rootCommentIds" },
    parentCommentId: {
      type: "comment",
      cardinality: ONE,
      reciprocal: "childCommentIds",
    },
    childCommentIds: {
      type: "comment",
      cardinality: MANY,
      reciprocal: "parentCommentId",
    },
  },
};

export const {
  actionCreators,
  selectors,
  emptyState: emptyFlowchartData,
  actionTypes,
  reducer,
} = makeNormalizedSlice<FlowchartData>(
  schema,
  (actionType: string) => `project/${actionType}`
);
