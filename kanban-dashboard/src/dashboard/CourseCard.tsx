import React, { useCallback, useState } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { OptionsPopper } from "../components/options-popper";
import { hooks } from "./store";
import CourseDetails from "./CourseDetails";
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
  dragHandleProps: DraggableProvidedDragHandleProps;
}

export default function CourseCard({ requirement, dragHandleProps }: Props) {
  const classNames = useCardStyles();
  const { title, assigneeId, description, courseType, units, completeStatus } =
    requirement;
  const assignee = hooks.useUser(assigneeId as string);
  const deleteCourse = hooks.useDeleteCourse();

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);
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
    <Paper
      className={`${classNames.task} ${courseTypeClass(
        courseType
      )} ${completeStatusClass(completeStatus)}`}
      {...dragHandleProps}
    >
      <div className={classNames.taskHeader}>
        <div>
          <Typography className={classNames.title}>{title}</Typography>

          <Typography variant="subtitle2">{description}</Typography>
        </div>

        {/* <OptionsPopper>
          <List>
            <ListItem button onClick={openDetails}>
              <ListItemText primary="View & Edit"/>
            </ListItem>
            <ListItem button onClick={handleClickDelete}>
              <ListItemText primary="Delete"/>
            </ListItem>
          </List>
        </OptionsPopper> */}
        <CompleteStatusIcon completeStatus={completeStatus} />
      </div>

      {isDetailsOpen && (
        <CourseDetails id={id} isOpen={isDetailsOpen} close={closeDetails} />
      )}
    </Paper>
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
