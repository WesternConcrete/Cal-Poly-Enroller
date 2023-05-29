import React from "react";
import {
  DragDropContext,
  type DropResult,
} from "react-beautiful-dnd";
import { useBoardStyles } from "./styles";
import Quarter from "./Quarter";
import { FlowchartState, useMoveRequirement } from "~/dashboard/state";
import { api } from "~/utils/api";

export default function Flowchart() {
  const { startYear } = React.useContext(FlowchartState);
  const moveRequirement = useMoveRequirement();
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
