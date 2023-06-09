import React, { useContext, useEffect } from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";
import { useBoardStyles } from "./styles";
import Quarter from "./Quarter";
import {
  FlowchartState,
  useMoveRequirement,
  DraggingState,
  STUDENT_YEAR_OPTIONS,
} from "~/dashboard/state";
import { api } from "~/utils/api";
import CollapsedQuarter from "./CollapsedQuarter";
import { Trash } from "lucide-react";
import { Requirement } from "~/server/api/root";

export default function Flowchart() {
  const { startYear, selectedRequirements, setSelectedRequirements, requirements, setIndexForQuarter } =
    React.useContext(FlowchartState);
  const moveRequirement = useMoveRequirement();
  const quartersQuery = api.quarters.all.useQuery({ startYear });

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
      selectedRequirements.includes((draggableId)) &&
      destination &&
      destination.droppableId === "-1"
    ) {
      setSelectedRequirements(
        selectedRequirements.filter((req) => req !== (draggableId))
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
      const requirementId = draggableId;
      const quarterId = parseInt(destination.droppableId);
      setIndexForQuarter(destination.droppableId, destination.index, requirementId)
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


  const { studentYear, studentTerm } =
  React.useContext(FlowchartState);



  const seasonMapping = {
    'Fall': 0,
    'Winter': 1,
    'Spring': 2,
    'Summer': 3,
  } as Record<string, number>;
  
  const yearMapping = {
    'Freshman': 0,
    'Sophomore': 3,
    'Junior': 6,
    'Senior': 9,
  };

  const year_index = STUDENT_YEAR_OPTIONS.findIndex((yr) => yr === studentYear)

  const renderTimeline = () => (
    STUDENT_YEAR_OPTIONS.map((yr, index) => {
      if(index > year_index) {
        return renderQuarterGroup(yr, yearMapping[yr], yearMapping[yr] + 3)
      } else if (index === year_index) {
        return renderQuarterGroup(yr, seasonMapping[studentTerm] + yearMapping[yr], yearMapping[yr] + 3)
      } else {
        return (<></>)
      }
    })
  )

  const isRenderedQuarter = (quarter: {
    id: number;
    year: number;
    termNum: 2 | 4 | 6 | 8;
  }, seasonMapping: Record<string, number>, year_index: number, currentSeason: string) => {
  
   
    if (quarter.year > year_index) {
      // console.log(quarter.year, year_index)
      // Render all quarters in future years
      return true;
    } else if (quarter.year === year_index) {
      // console.log( quarter.termNum, currentMappedSeason * 2)
      // For the current year, render the quarters that are in the current season or later
      if(currentSeason === 'Winter') {
        return quarter.termNum !== 8
      } else if (currentSeason === 'Spring') {
        return quarter.termNum !== 8 && quarter.termNum !== 2
      } else if (currentSeason === 'Summer') {
        return  quarter.termNum !== 8 && quarter.termNum !== 2 && quarter.termNum !== 4
      } else {
        return true
      }
    } else {
      // Do not render quarters in previous years
      return false;
    }
  };
  

  function getQuarterRequirements(quarter_id: number): Requirement[] {
    return requirements.filter(req => {
      return req.quarterId === quarter_id
    }) as unknown as Requirement[]
  } 

  React.useEffect(() => {
    if (quartersQuery.data) {
      quartersQuery.data.forEach((quarter) => {
        // Assuming you have some logic to determine if a quarter should be rendered
        
        const shouldRender = isRenderedQuarter(quarter, seasonMapping, year_index, studentTerm);
        if (!shouldRender) {
          // Assuming you have some function to get quarter requirements
          const quarterRequirements = getQuarterRequirements(quarter.id);
          quarterRequirements.forEach((requirement: Requirement) => {
            setIndexForQuarter("-1", 0, requirement.id)
            moveRequirement(requirement.id, -1);
          });
        }
      });
    }
  }, [requirements, studentYear, quartersQuery.data, studentTerm]); 
    
  

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
              {renderTimeline()}
              
            </div>
          </div>
        </DraggingState.Provider>
      </DragDropContext>}
      
    </div>
  );
}
