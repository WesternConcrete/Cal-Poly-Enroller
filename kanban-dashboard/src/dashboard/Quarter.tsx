import React, { useContext } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import CourseCard from "./CourseCard";
import { useLaneStyles } from "./styles";
import { FlowchartState } from "~/dashboard/Dashboard";

export interface Props {
  quarter: { title: string; id: number; current?: boolean };
}

export default function Quarter({ quarter }: Props) {
  const title = quarter.title;
  const classNames = useLaneStyles();
  const { requirements } = useContext(FlowchartState);

  return (
    <Paper className={`${classNames.lane} board-status`} elevation={0}>
      <div className={classNames.laneHeader}>
        <Typography align="center" className={classNames.laneTitle}>
          {title}
        </Typography>
      </div>
      <Droppable type="quarter" droppableId={quarter.id.toString()}>
        {(provided: DroppableProvided) => {
          return (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={classNames.tasks}
            >
              {requirements
                .filter((req) => req.quarterId === quarter.id)
                .map((requirement, index) => (
                  <CourseCard requirement={requirement} index={index} />
                ))}
            </div>
          );
        }}
      </Droppable>
    </Paper>
  );
}
