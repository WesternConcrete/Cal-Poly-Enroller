import React, { useState } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {
  Draggable,
  DraggableProvided,
  DraggableProvidedDragHandleProps,
  Droppable,
  DroppableProvided,
// @ts-ignore
} from 'react-beautiful-dnd';
import { hooks, emptyArray } from './store';
import CourseCard from './CourseCard';
import { useCardStyles, useLaneStyles } from './styles';
import { useCurrentUserId } from './CurrentUser';
import { Status } from './store/types';

export interface Props {
  id: string;
}

export default function StatusLane({ id }: Props) {
  const currentUserId = useCurrentUserId();
  const createCourse = hooks.useCreateCourse();
  const updateStatus = hooks.useUpdateStatus();
  const deleteStatus = hooks.useDeleteStatus();
  const { title, taskIds } = hooks.useStatus(id) as Status;

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const openCourseForm = () => setIsCourseFormOpen(true);
  const closeCourseForm = () => setIsCourseFormOpen(false);

  const [isStatusEditorOpen, setIsStatusEditorOpen] = useState(false);
  const openStatusEditor = () => setIsStatusEditorOpen(true);
  const closeStatusEditor = () => setIsStatusEditorOpen(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const openDeleteConfirm = () => setIsDeleteConfirmOpen(true);
  const closeDeleteConfirm = () => setIsDeleteConfirmOpen(false);

  const handleSubmitNewCourse = (title: string, desc: string) => {
    if (createCourse && currentUserId) {
      createCourse({
        title,
        statusId: id,
        creatorId: currentUserId,
        description: desc,
      });
    }
    closeCourseForm();
  };

  const handleSubmitEditStatus = (title: string) => {
    if (updateStatus) {
      updateStatus(id, { title });
    }
    closeStatusEditor();
  };

  const handleConfirmDelete = () => {
    if (deleteStatus) {
      deleteStatus(id);
    }
  };

  const classNames = useLaneStyles();

  return (
    <Paper className={`${classNames.lane} board-status`} elevation={0}>
      <div className={classNames.laneHeader}>
        <Typography align="center" className={classNames.laneTitle}>
          {title}
        </Typography>
      </div>
      <Droppable type="taskCard" droppableId={id.toString()}>
        {(provided: DroppableProvided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classNames.tasks}
            >
              {(taskIds || emptyArray).map((taskId, index) => (
                <Draggable
                  key={taskId}
                  draggableId={taskId.toString()}
                  index={index}
                >
                  {(provided: DraggableProvided) => {
                    return (

                      <div
                        className={classNames.taskContainer}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <CourseCard
                          statusId={id}
                          id={taskId}
                          dragHandleProps={provided.dragHandleProps}
                        />
                      </div>
                    );
                  }}
                </Draggable>
              ))}
            </div>
          );
        }}
      </Droppable>
    </Paper>
  );
}

export interface StatusOptionsProps {
  onClickEdit: () => void;
  onClickDelete: () => void;
}

export function StatusOptions({
  onClickEdit,
  onClickDelete,
}: StatusOptionsProps) {
  return (
    <List>
      <ListItem button onClick={onClickEdit}>
        <ListItemText primary="Edit Column" />
      </ListItem>
      <ListItem button onClick={onClickDelete}>
        <ListItemText primary="Delete Column" />
      </ListItem>
    </List>
  );
}
