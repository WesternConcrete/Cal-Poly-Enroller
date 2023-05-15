import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { actions, selectors, State } from './index';
import { Course } from './types';

export function useCreateUser() {
  const dispatch = useDispatch();
  return useCallback((user: { id?: string, username: string}) => {
    dispatch(actions.createUser(user));
  }, [dispatch]);
}
export function useUpdateUser() {
  const dispatch = useDispatch();
  return useCallback((id: string, user: { username?: string}) => {
    dispatch(actions.updateUser(id, user));
  }, [dispatch]);
}

export function useCreateCourse() {
  const dispatch = useDispatch();
  return useCallback((task: Partial<Course>) => {
    dispatch(actions.createCourse(task));
  }, [dispatch]);
}
export function useUpdateCourse() {
  const dispatch = useDispatch();
  return useCallback((id: string, task: { title?: string, description?: string }) => {
    dispatch(actions.updateCourse(id, task));
  }, [dispatch]);
}
export function useDeleteCourse() {
  const dispatch = useDispatch();
  return useCallback((id: string) => {
    dispatch(actions.deleteCourse(id));
  }, [dispatch]);
}
export function useAssignCourse() {
  const dispatch = useDispatch();
  return useCallback((taskId: string, userId: string) => {
    dispatch(actions.assignCourse(taskId, userId));
  }, [dispatch])
}
export function useUnassignCourse() {
  const dispatch = useDispatch();
  return useCallback((taskId: string, userId: string) => {
    dispatch(actions.unassignCourse(taskId, userId));
  }, [dispatch])
}


export function useCreateStatus() {
  const dispatch = useDispatch();
  return useCallback((status: { title: string }) => {
    dispatch(actions.createStatus(status));
  }, [dispatch]);
}
export function useUpdateStatus() {
  const dispatch = useDispatch();
  return useCallback((id: string, status: { title?: string }) => {
    dispatch(actions.updateStatus(id, status));
  }, [dispatch]);
}
export function useDeleteStatus() {
  const dispatch = useDispatch();
  return useCallback((id: string) => {
    dispatch(actions.deleteStatus(id));
  }, [dispatch]);
}


export function useCreateTag() {
  const dispatch = useDispatch();
  return useCallback((tag: { value: string }) => {
    dispatch(actions.createTag(tag));
  }, [dispatch]);
}
export function useCreateRootComment() {
  const dispatch = useDispatch();
  return useCallback((comment: { value: string, taskId: string, creatorId: string, ts: Date }) => {
    dispatch(actions.createRootComment(comment));
  }, [dispatch]);
}
export function useCreateChildComment() {
  const dispatch = useDispatch();
  return useCallback((comment: { value: string, parentCommentId: string, creatorId: string, ts: Date }) => {
    dispatch(actions.createChildComment(comment));
  }, [dispatch]);
}
export function useDeleteComment() {
  const dispatch = useDispatch();
  return useCallback((id: string) => {
    dispatch(actions.deleteComment(id));
  }, [dispatch]);
}



export function useMoveStatus() {
  const dispatch = useDispatch();
  return useCallback((src: number, dest: number) => {
    dispatch(actions.moveStatus(src, dest));
  }, [dispatch]);
}

export function useMoveStatusCourse() {
  const dispatch = useDispatch();
  return useCallback((taskId: string, srcStatusId: string, src: number, destStatusId: string, dest: number) => {
    dispatch(actions.moveStatusCourse(taskId, srcStatusId, src, destStatusId, dest));
  }, [dispatch]);
}


export function useUserIds() {
  return useSelector((state: State) => selectors.getUserIds(state));
}
export function useCourseIds() {
  return useSelector((state: State) => selectors.getCourseIds(state));
}
export function useStatusIds() {
  return useSelector((state: State) => selectors.getStatusIds(state));
}
export function useTagIds() {
  return useSelector((state: State) => selectors.getTagIds(state));
}
export function useCommentIds() {
  return useSelector((state: State) => selectors.getCommentIds(state));
}


export function useUser(id: string) {
  return useSelector((state: State) => selectors.getUser(state, { id }));
}
export function useCourse(id: string) {
  return useSelector((state: State) => selectors.getCourse(state, { id }));
}
export function useStatus(id: string) {
  return useSelector((state: State) => selectors.getStatus(state, { id }));
}
export function useTag(id: string) {
  return useSelector((state: State) => selectors.getTag(state, { id }));
}
export function useComment(id: string) {
  return useSelector((state: State) => selectors.getComment(state, { id }));
}

export function useCommentUsername(id: string) {
  return useSelector((state: State) => selectors.getCommentUsername(state, { id }));
}
