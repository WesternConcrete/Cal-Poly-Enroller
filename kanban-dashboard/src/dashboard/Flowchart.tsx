import React, { useCallback, useEffect, useState } from "react";
import Paper from "@material-ui/core/Paper";
import Dialog from "@material-ui/core/Dialog";
import {
  DragDropContext,
  DropResult,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd';
import AddIcon from '@material-ui/icons/Add';
import { hooks, emptyArray } from './store';
import { useBoardStyles } from './styles';
import StatusLane from './StatusLane';
import { Fab } from '@material-ui/core';
import CourseEditorForm from './CourseEditorForm';
import { useCurrentUserId } from './CurrentUser';
import {handleCloseModal} from "../helpers/shared"
import { Course, CourseType } from './store/types';

import { api } from "~/utils/api";
import { UUID } from "crypto";

export default function Flowchart() {
  const currentUserId = useCurrentUserId();
  const statusIds = hooks.useStatusIds();
  const createCourse = hooks.useCreateCourse();
  const moveStatus = hooks.useMoveStatus();
  const moveCourse = hooks.useMoveStatusCourse();

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const openCourseForm = () => setIsCourseFormOpen(true);
  const closeCourseForm = () => setIsCourseFormOpen(false);

  const classNames = useBoardStyles();

  const handleDragEnd = ({
    type,
    source,
    destination,
    draggableId,
  }: DropResult) => {
    if (source && destination) {
      if (type === "statusLane" && moveStatus) {
        moveStatus(source.index, destination.index);
      }

      if (type === "taskCard" && moveCourse) {
        moveCourse(
          draggableId,
          source.droppableId,
          source.index,
          destination.droppableId,
          destination.index
        );
      }
    }
  };
  const courseQuery = api.poly.courses.useQuery();
  useEffect(() => {
    if (courseQuery.isSuccess && courseQuery.data) {
      courseQuery.data.forEach((course) => {
        createCourse({
          title: course.classcode,
          statusId: course.status,
          creatorId: currentUserId,
          description: course.classname,
        });
      });
    }
  }, [courseQuery.isLoading]);

  const handleSubmitNewCourse = (_title: string, _desc: string) => {
    if (createCourse && currentUserId) {
      // pass
    }
    closeCourseForm();
  };

  return (
    <div className={classNames.board}>
      <Dialog
        open={isCourseFormOpen}
        onClose={(event, reason) =>
          handleCloseModal(event, reason, closeCourseForm)
        }
      >
        <Paper className={classNames.dialog}>
          <CourseEditorForm
            onSubmit={handleSubmitNewCourse}
            onCancel={closeCourseForm}
          />
        </Paper>
      </Dialog>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          type="statusLane"
          droppableId="projectBoard"
          direction="horizontal"
        >
          {(provided: DroppableProvided) => {
            return (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={classNames.lanes}
              >
                {(statusIds || emptyArray).map((statusId, index) => (
                  <div className={classNames.laneContainer} key={index}>
                    <StatusLane id={statusId} />
                  </div>
                ))}
                {provided.placeholder}
              </div>
            );
          }}
        </Droppable>
      </DragDropContext>
      <div className={classNames.addButtonContainer}>
        <Fab color="primary" aria-label="add" onClick={() => openCourseForm()}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}
