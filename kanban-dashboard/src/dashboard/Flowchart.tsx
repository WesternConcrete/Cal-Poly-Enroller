import React from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import { useBoardStyles } from "./styles";
import Quarter from "./Quarter";
import {
  FlowchartState,
  useMoveRequirement,
  DraggingState,
} from "~/dashboard/state";
import { api } from "~/utils/api";
import CollapsedQuarter from "./CollapsedQuarter";

export default function Flowchart() {
  const { startYear, selectedRequirements, setSelectedRequirements } =
    React.useContext(FlowchartState);
  const moveRequirement = useMoveRequirement();
  const quartersQuery = api.quarters.all.useQuery({ startYear });

  const classNames = useBoardStyles();

  const [dragging, setDragging] = React.useState(false);
  const [draggingItem, setDraggingItem] = React.useState(null);

  const handleDragStart = ({ draggableId }: Record<string, any>) => {
    setDragging(true);
    setDraggingItem(draggableId);
  };

  const handleDragEnd = ({
    type,
    source,
    destination,
    draggableId,
  }: DropResult) => {
    if (
      selectedRequirements.includes(parseInt(draggableId)) &&
      destination &&
      destination.droppableId === "-1"
    ) {
      setSelectedRequirements(
        selectedRequirements.filter((req) => req !== parseInt(draggableId))
      );
    }
    setDragging(false);
    setDraggingItem(null);

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

  const collapsedQuarterData = {
    id: -1,
    year: 0,
    termNum: 0 as any,
  };

  const [draggingOver, setDraggingOver] = React.useState(null);

  const handleDragUpdate = (update: { destination: any }) => {
    const { destination } = update;
    const draggingOverId = destination?.droppableId;
    setDraggingOver(draggingOverId);
  };

  return (
    <div className="h-full flex overflow-x-auto">
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
      >
        <DraggingState.Provider
          value={{
            dragging,
            setDragging,
            draggingItem,
            setDraggingItem,
            draggingOver,
            setDraggingOver,
          }}
        >
          <div className="flex-grow-1 flex overflow-x-scroll scroll-behavior-smooth w-full">
            <div
              className="flex-basis-[100%] flex-grow-0 overflow-x-hidden overflow-y-scroll w-full flex min-w-[220px] flex-col relative border-[1px] border-solid border-[#e1e4e8]"
              key={collapsedQuarterData.id}
            >
              <CollapsedQuarter quarter={collapsedQuarterData} />
            </div>
            {quartersQuery.data
              ? (quartersQuery.data || []).slice(3).map((quarter) => (
                  <div
                    className="flex-basis-[100%] flex-grow-0 overflow-x-hidden overflow-y-scroll w-full flex min-w-[140px] flex-col relative border-[1px] border-solid border-[#e1e4e8]"
                    key={quarter.id}
                  >
                    <Quarter quarter={quarter} />
                  </div>
                ))
              : null}
          </div>
        </DraggingState.Provider>
      </DragDropContext>
    </div>
  );
}
