import { type Comment, type Status, type Tag, type Course, type User, type FlowchartData } from './types';
import { selectors } from './base';

export const getUserIds = (state: FlowchartData) => selectors.getIds(state, { type: 'user' }) as string[];
export const getCourseIds = (state: FlowchartData) => selectors.getIds(state, { type: 'task' }) as string[];
export const getStatusIds = (state: FlowchartData) => selectors.getIds(state, { type: 'status' }) as string[];
export const getTagIds = (state: FlowchartData) => selectors.getIds(state, { type: 'tag' }) as string[];
export const getCommentIds = (state: FlowchartData) => selectors.getIds(state, { type: 'comment' }) as string[];

export const getUser = (state: FlowchartData, args: { id: string }) => selectors.getEntity<User>(state, { type: 'user', id: args.id });
export const getCourse = (state: FlowchartData, args: { id: string }) => selectors.getEntity<Course>(state, { type: 'task', id: args.id });
export const getStatus = (state: FlowchartData, args: { id: string }) => selectors.getEntity<Status>(state, { type: 'status', id: args.id });
export const getTag = (state: FlowchartData, args: { id: string }) => selectors.getEntity<Tag>(state, { type: 'tag', id: args.id });
export const getComment = (state: FlowchartData, args: { id: string }) => selectors.getEntity<Comment>(state, { type: 'comment', id: args.id });


export const getCommentUsername = (state: FlowchartData, args: { id }) => {
  const comment = getComment(state, args);
  if (!comment) {
    return '';
  }

  const user = getUser(state, { id: comment.creatorId });
  if (!user) {
    return '';
  }

  return user.username;
};
