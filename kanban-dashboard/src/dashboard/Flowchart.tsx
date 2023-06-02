import React from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
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
    <div className="h-full flex overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-grow-1 flex overflow-x-scroll scroll-behavior-smooth w-full">
          {quartersQuery.data
            ? (quartersQuery.data || []).map((quarter) => (
                <div className="flex-basis-[100%] flex-grow-0 overflow-x-hidden overflow-y-scroll w-full flex min-w-[120px] flex-col relative border-[1px] border-solid border-[#e1e4e8]" key={quarter.id}>
                  <Quarter quarter={quarter} />
                </div>
              ))
            : null}
        </div>
      </DragDropContext>
    </div>
  );
}
