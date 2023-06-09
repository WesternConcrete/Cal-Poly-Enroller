import React, { useContext } from "react";
import { Droppable, type DroppableProvided } from "react-beautiful-dnd";
import CourseCard from "./CourseCard";
import { useLaneStyles } from "./styles";
import { FlowchartState } from "~/dashboard/state";
import { type Quarter } from "~/server/api/root";

export interface Props {
  quarter: Quarter;
}

export default function CollapsedQuarter({ quarter }: Props) {
  const { requirements, startYear, indexMap, setIndexMap } = useContext(FlowchartState);
  const title = `COMPLETED COURSES`;

  const quarterRequirements = requirements.filter(
    (req) => req.quarterId === quarter.id
  );
  quarterRequirements.forEach(
    (req, index) => {
      if(indexMap[req.id] === undefined) {
        const copy = indexMap
        copy[req.id] = index
        setIndexMap(copy)
      }
    }
  );
  
  const mappedQuarterRequirements = quarterRequirements.sort((a, b) => {
    return indexMap[a.id] - indexMap[b.id]
  })

  return (
    <div className={`flex flex-col h-full board-status flex flex-col h-full]`}>
      <div className="p-[.5rem] flex w-full">
        <div className="flex-grow-1 text-[11px] font-bold border-b-[1px] border-solid border-gray">
          {title}
        </div>
      </div>
      <Droppable type="quarter" droppableId={quarter.id.toString()}>
        {(provided: DroppableProvided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-[.5rem] h-full`}
            >
              {mappedQuarterRequirements.map((requirement, index) => (
                <CourseCard
                  requirement={requirement}
                  index={index}
                  key={index}
                  collapsed={true}
                />
              ))}
              {provided.placeholder}
            </div>
          );
        }}
      </Droppable>
    </div>
  );
}
