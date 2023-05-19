import {
  Status,
  Course,
  User,
  Tag,
  Comment,
  CourseType,
  CompleteStatus,
} from "./types";
const { v4: uuid } = require("uuid");

export const makeUser = (user: Partial<User> = {}): User => {
  return {
    id: user.id ?? uuid(),
    username: user.username ?? "",
    ...user,
  };
};

export const makeCourse = (task: Partial<Course> = {}): Course => {
  return {
    id: task.id ?? uuid(),
    title: task.title ?? "",
    description: task.description ?? "",
    statusId: task.statusId ?? "",
    tagIds: task.tagIds ?? [],
    units: task.units ?? 4,
    courseType: task.courseType ?? CourseType.MAJOR,
    completeStatus: task.completeStatus ?? CompleteStatus.COMPLETE,
    creatorId: task.creatorId ?? "",
    assigneeId: task.assigneeId,
    rootCommentIds: task.rootCommentIds ?? [],
  };
};

export const makeStatus = (status: Partial<Status> = {}): Status => {
  return {
    id: status.id ?? uuid(),
    title: status.title ?? "",
    taskIds: status.taskIds ?? [],
  };
};

export const makeTag = (tag: Partial<Tag>): Tag => {
  return {
    id: tag.id ?? uuid(),
    value: tag.value ?? "",
    taskIds: tag.taskIds ?? [],
  };
};
export const makeComment = (comment: Partial<Comment>): Comment => {
  return {
    id: comment.id ?? uuid(),
    creatorId: comment.creatorId ?? "",
    value: comment.value ?? "",
    taskId: "",
    parentCommentId: "",
    childCommentIds: [],
  };
};
