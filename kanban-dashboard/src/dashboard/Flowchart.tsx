import React, { useContext } from "react";
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
      const requirementId = parseInt(draggableId);
      const quarterId = parseInt(destination.droppableId);
      moveRequirement(requirementId, quarterId);
    }
  };

  const renderQuarterGroup = (
    title: string,
    sliceStart: number,
    sliceEnd: number
  ) => (
    <div className="flex flex-col">
      <div className="bg-black text-white text-center p-[1rem] font-bold">
        {title}
      </div>
      <div className="flex gap-0">
        {quartersQuery.data
          ? quartersQuery.data.slice(sliceStart, sliceEnd).map((quarter) => (
              <div
                className="flex-shrink-0 w-[120px] overflow-x-hidden overflow-y-scroll flex flex-col relative border-[1px] border-solid border-[#e1e4e8] mx-0"
                key={quarter.id}
              >
                <Quarter quarter={quarter} />
              </div>
            ))
          : null}
      </div>
    </div>
  );

  return (
    <div className="h-full flex overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-grow-1 flex w-full">
          <div className="flex gap-1">
            {renderQuarterGroup("Freshmen", 0, 3)}
            {renderQuarterGroup("Sophomore", 3, 6)}
            {renderQuarterGroup("Junior", 6, 9)}
            {renderQuarterGroup("Senior", 9, Infinity)}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
