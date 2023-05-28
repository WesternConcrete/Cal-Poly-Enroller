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
import { useBoardStyles } from "./styles";
import Quarter from "./Quarter";
import { Fab } from "@material-ui/core";
import CourseEditorForm from "./CourseEditorForm";
import { useCurrentUserId } from "./CurrentUser";
import { handleCloseModal } from "../helpers/shared";
import { FlowchartState } from "~/dashboard/Dashboard";
import { api } from "~/utils/api";

export default function Flowchart() {
  const quartersQuery = api.quarters.useQuery({ startYear: 2021 });
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
      moveRequirement(parseInt(draggableId), parseInt(destination.droppableId));
    }
  };
  return (
    <div className={classNames.board}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={classNames.lanes}>
          {quartersQuery.data
            ? (quartersQuery.data || []).map((quarter) => (
                <div className={classNames.laneContainer} key={quarter.id}>
                  <Quarter quarter={quarter} />
                </div>
              ))
            : null}
        </div>
      </DragDropContext>
    </div>
  );
}
