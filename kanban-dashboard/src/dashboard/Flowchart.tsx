import React, { useContext } from "react";
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
import { Trash } from "lucide-react";

export default function Flowchart() {
  const { startYear, selectedRequirements, setSelectedRequirements } =
    React.useContext(FlowchartState);
  const moveRequirement = useMoveRequirement();
  const quartersQuery = api.quarters.useQuery({ startYear });

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

  const renderQuarterGroup = (
    title: string,
    sliceStart: number,
    sliceEnd: number
  ) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="text-center p-1 font-bold border-x">
        {title}
      </div>
      <div className="flex justify-center h-full overflow-y-hidden">
        {quartersQuery.data
          ? quartersQuery.data.slice(sliceStart, sliceEnd).map((quarter) => (
              <div
              className="flex-basis-[100%] flex-grow-0 overflow-x-hidden overflow-y-scroll flex w-[140px] flex-col relative border-[1px] border-solid border-[#e1e4e8]"
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
      {quartersQuery.data && <DragDropContext
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
            <div className="flex">

              <div   className="flex-basis-[100%] flex-grow-0 overflow-x-hidden overflow-y-scroll flex w-[220px] flex-col relative border-[1px] border-solid border-[#e1e4e8] bt-none">
                <CollapsedQuarter quarter={collapsedQuarterData} />
              </div>
              {renderQuarterGroup("Freshman", 0, 3)}
              {renderQuarterGroup("Sophomore", 3, 6)}
              {renderQuarterGroup("Junior", 6, 9)}
              {renderQuarterGroup("Senior", 9, Infinity)}
            </div>
          </div>
        </DraggingState.Provider>
      </DragDropContext>}
      
    </div>
  );
}
