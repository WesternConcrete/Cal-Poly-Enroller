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
import { FlowchartState } from "~/dashboard/state";
import { api } from "~/utils/api";

export default function Flowchart() {
  const { moveRequirement, startYear } = React.useContext(FlowchartState);
  const quartersQuery = api.quarters.useQuery({ startYear });

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
      // moveRequirement: (requirementId: number, quarterId: number) => void;
      const requirementId = parseInt(draggableId);
      const quarterId = parseInt(destination.droppableId);
      moveRequirement(requirementId, quarterId);
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
