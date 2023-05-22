import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { Draggable, DraggableProvided } from "react-beautiful-dnd";
import { useCardStyles } from "./styles";
import CompleteIcon from "../components/icons/complete";
import InProgressIcon from "../components/icons/in-progress";
import { FlowchartState } from "~/dashboard/Dashboard";
import { RequirementTypeSchema, RequirementType } from "~/scraping/catalog";
import { api } from "~/utils/api";

// // @ts-ignore
// import InProgressIcon from '@/images/in-progress.svg';
// @ts-ignore
// import CompletedIcon from '@/images/complete.svg';
// // @ts-ignore

export interface Props {
  requirement: Course;
  index: number;
}

type CompleteStatus = "complete" | "incomplete" | "in-progress";

export default function CourseCard({ requirement, index }: Props) {
  const classNames = useCardStyles();
  const { title, description, courseType, units } = requirement;

  let completeStatus: CompleteStatus, completeStatusClass: string;
  api.currentQuarterId.useQuery(undefined, {
    onSuccess: (data) => {
      if (
        !data ||
        data < requirement.quarterId
      ) {
        completeStatus = "incomplete";
        completeStatusClass = classNames.incomplete_status;
      } else if (data === requirement.quarterId) {
        completeStatus = "in-progress";
        completeStatusClass = classNames.in_progress_status;
      } else if (data > requirement.quarterId) {
        completeStatus = "complete";
        completeStatusClass = classNames.complete_status;
      }
    },
  });

  const { setRequirements } = React.useContext(FlowchartState);

  const courseTypeClass = (courseType: RequirementType) => {
    switch (courseType) {
      case RequirementTypeSchema.enum.support:
        return classNames.support;
      // case CourseType.CONCENTRATION:
      //   return classNames.concentration;
      // case CourseType.GWR:
      //   return classNames.gwe;
      case RequirementTypeSchema.enum.ge:
        return classNames.ge;
      default:
        return classNames.major;
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
              )} ${completeStatusClass}`}
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

// TODO: assign this in the if statement in CourseCard
function CompleteStatusIcon({ completeStatus }: CompleteStatusProps) {
  switch (completeStatus) {
    case "complete":
      return <CompleteIcon />;
    case "incomplete":
      return <div></div>;
    case "in-progress":
      return <InProgressIcon />;
    default:
      return <div>unset</div>;
  }
}
