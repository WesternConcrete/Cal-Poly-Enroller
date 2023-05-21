import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { Draggable, DraggableProvided } from "react-beautiful-dnd";
import { hooks } from "./store";
import { useCardStyles } from "./styles";
import { CompleteStatus, Course, CourseType } from "./store/types";
import CompleteIcon from "../components/icons/complete";
import InProgressIcon from "../components/icons/in-progress";
import { FlowchartState } from "~/dashboard/Dashboard";

// // @ts-ignore
// import InProgressIcon from '@/images/in-progress.svg';
// @ts-ignore
// import CompletedIcon from '@/images/complete.svg';
// // @ts-ignore

export interface Props {
  requirement: Course;
  index: number;
}

export default function CourseCard({ requirement, index }: Props) {
  const classNames = useCardStyles();
  const { title, description, courseType, units, completeStatus } = requirement;

  const { setRequirements } = React.useContext(FlowchartState);

  const courseTypeClass = (courseType: CourseType) => {
    switch (courseType) {
      case CourseType.SUPPORT:
        return classNames.support;
      case CourseType.CONCENTRATION:
        return classNames.concentration;
      case CourseType.GWR:
        return classNames.gwe;
      case CourseType.GE:
        return classNames.ge;
      default:
        return classNames.major;
    }
  };

  const completeStatusClass = (completeStatus: CompleteStatus) => {
    switch (completeStatus) {
      case CompleteStatus.COMPLETE:
        return classNames.complete_status;
      case CompleteStatus.INPROGRESS:
        return classNames.in_progress_status;
      case CompleteStatus.INCOMPLETE:
        return classNames.incomplete_status;
      default:
        return classNames.incomplete_status;
    }
  };

  return (
    <Draggable
      key={requirement.id}
      draggableId={requirement.id.toString()}
      index={index}
    >
      {(provided: DraggableProvided) => {
        return (
          <div
            className={classNames.taskContainer}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <Paper
              className={`${classNames.task} ${courseTypeClass(
                courseType
              )} ${completeStatusClass(completeStatus)}`}
              {...provided.dragHandleProps}
            >
              <div className={classNames.taskHeader}>
                <div>
                  <Typography className={classNames.title}>{title}</Typography>

                  <Typography variant="subtitle2">{description}</Typography>
                </div>
                <CompleteStatusIcon completeStatus={completeStatus} />
              </div>
            </Paper>
          </div>
        );
      }}
    </Draggable>
  );
}

interface CompleteStatusProps {
  completeStatus: CompleteStatus;
}

function CompleteStatusIcon({ completeStatus }: CompleteStatusProps) {
  switch (completeStatus) {
    case CompleteStatus.COMPLETE:
      return <CompleteIcon />;
    case CompleteStatus.INCOMPLETE:
      return <div></div>;
    case CompleteStatus.INPROGRESS:
      return <InProgressIcon />;
    default:
      return <div>unset</div>;
  }
}
