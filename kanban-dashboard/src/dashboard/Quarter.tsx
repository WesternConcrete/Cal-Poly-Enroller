import React, { useContext } from "react";
import { Droppable, type DroppableProvided } from "react-beautiful-dnd";
import CourseCard from "./CourseCard";
import { useLaneStyles } from "./styles";
import { FlowchartState } from "~/dashboard/state";
import { type Quarter } from "~/server/api/root";
import { TERM_SEASON } from "~/scraping/registrar";

export interface Props {
  quarter: Quarter;
}

export default function Quarter({ quarter }: Props) {
  const { requirements, startYear, indexMap, setIndexMap } = useContext(FlowchartState);
  const title = `${TERM_SEASON[quarter.termNum].toUpperCase()} '${
    startYear - 2000 + quarter.year
  }`;

  const quarterRequirements = requirements.filter(
    (req) => req.quarterId === quarter.id
  );
  
  const mappedQuarterRequirements = quarterRequirements.sort((a, b) => {
    const quarter_req_order = indexMap[a.quarterId] as string[]
    const a_index = quarter_req_order.indexOf(a.id)
    const b_index = quarter_req_order.indexOf(b.id)
    return a_index - b_index    
  })

  return (
    <div className={`flex flex-col h-full board-status`}>
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
              className="p-[.5rem] h-full"
            >
              {mappedQuarterRequirements.map((requirement, index) => (
                <CourseCard
                  requirement={requirement}
                  index={index}
                  key={index}
                  collapsed={false}
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
