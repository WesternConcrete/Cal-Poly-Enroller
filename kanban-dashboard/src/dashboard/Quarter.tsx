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
  const classNames = useLaneStyles();
  const { requirements, startYear } = useContext(FlowchartState);
  const title = `${TERM_SEASON[quarter.termNum].toUpperCase()} '${
    startYear - 2000 + quarter.year
  }`;

  const quarterRequirements = requirements.filter(
    (req) => req.quarterId === quarter.id
  );

  return (
    <div className={`${classNames.lane} board-status`} >
      <div className={classNames.laneHeader}>
        <div  className={classNames.laneTitle}>
          {title}
        </div>
      </div>
      <Droppable type="quarter" droppableId={quarter.id.toString()}>
        {(provided: DroppableProvided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classNames.tasks}
            >
              {quarterRequirements.map((requirement, index) => (
                <CourseCard
                  requirement={requirement}
                  index={index}
                  key={index}
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
