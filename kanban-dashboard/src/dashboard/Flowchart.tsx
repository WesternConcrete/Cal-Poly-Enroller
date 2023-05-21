import React, { useCallback, useEffect, useState } from "react";
import Paper from "@material-ui/core/Paper";
import Dialog from "@material-ui/core/Dialog";
import {
  DragDropContext,
  type DropResult,
  Droppable,
  type DroppableProvided,
  // @ts-ignore
} from "react-beautiful-dnd";
import AddIcon from "@material-ui/icons/Add";
import { hooks, emptyArray } from "./store";
import { useBoardStyles } from "./styles";
import Quarter from "./Quarter";
import { Fab } from "@material-ui/core";
import CourseEditorForm from "./CourseEditorForm";
import { useCurrentUserId } from "./CurrentUser";
import { handleCloseModal } from "../helpers/shared";
import { Course, CourseType } from "./store/types";
import { FlowchartState } from "~/dashboard/Dashboard";

export default function Flowchart() {
  const quarterIds = hooks.useStatusIds();
  const { moveRequirement } = React.useContext(FlowchartState);

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
    if (type !== "quarter") {
      console.warn("tried to drag unrecognized type:", type);
      return;
    }
    if (source && destination) {
      moveRequirement(parseInt(draggableId), destination.droppableId);
    }
  };
  return (
    <div className={classNames.board}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={classNames.lanes}>
          {(quarterIds || emptyArray).map((statusId, index) => (
            <div className={classNames.laneContainer} key={index}>
              <Quarter id={statusId} />
            </div>
          ))}
        </div>
      </DragDropContext>
      <div className={classNames.addButtonContainer}>
        <Fab color="primary" aria-label="add" onClick={() => openCourseForm()}>
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
}
