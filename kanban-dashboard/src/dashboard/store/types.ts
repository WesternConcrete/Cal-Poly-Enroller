import { type UUID } from "crypto";
import { type State as NormalizedState } from "normalized-reducer";

export interface Flowchart {
  meta: FlowchartMeta;
}

export interface FlowchartMeta {
  id: UUID;
  title: string;
  description: string;
}

export interface FlowchartData extends NormalizedState {
  entities: {
    user: Record<string, User>;
    task: Record<string, Course>;
    status: Record<string, Status>;
    tag: Record<string, Tag>;
    comment: Record<string, Comment>;
  };
  ids: {
    user: string[];
    task: string[];
    status: string[];
    tag: string[];
    comment: string[];
  };
}

export interface User {
  id: string;
  username: string;
  createdCourseIds?: string[];
  assignedCourseIds?: string[];
  commentIds?: string[];
}

export interface Course {
  id: string,
  title: string,
  description: string,
  statusId: string,
  creatorId: string,
  courseType: CourseType,
  completeStatus: CompleteStatus,
  units: number,
  assigneeId?: string,
  tagIds?: string[],
  rootCommentIds?: string[],
}

export enum CourseType {
  MAJOR = "MAJOR",
  SUPPORT = "SUPPORT",
  CONCENTRATION = "CONCENTRATION",
  GWR = "GWR",
  GE = "GE",
}

export enum CompleteStatus {
  COMPLETE = "COMPLETE", 
  INPROGRESS = "INPROGRESS", 
  INCOMPLETE = "INCOMPLETE", 
}

export interface Status {
  id: string;
  title: string;
  taskIds?: string[];
}

export interface Tag {
  id: string;
  value: string;
  taskIds?: string[];
}

export interface Comment {
  id: string;
  value: string;
  creatorId: string;
  taskId?: string;
  parentCommentId?: string;
  childCommentIds?: string[];
}

export type UpdateFlowchartData = (projectData: FlowchartData) => Promise<void>;
