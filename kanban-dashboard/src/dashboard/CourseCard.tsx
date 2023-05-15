import React, { useState } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { type DraggableProvidedDragHandleProps } from "react-beautiful-dnd";
import { OptionsPopper } from "../components/options-popper";
import { hooks } from "./store";
import CourseDetails from "./CourseDetails";
import { useCardStyles } from "./styles";
import { CourseType } from "./store/types";
import CompleteIcon from "../components/icons/complete";
// // @ts-ignore
// import InProgressIcon from '@/images/in-progress.svg';
// @ts-ignore
// import CompletedIcon from '@/images/complete.svg';
// // @ts-ignore

export interface Props {
  id: string;
  statusId: string;
  dragHandleProps: DraggableProvidedDragHandleProps;
}

export default function CourseCard({ id, dragHandleProps }: Props) {
  const classNames = useCardStyles();
  const { title, assigneeId, description, courseType, units } =
    hooks.useCourse(id);
  const assignee = hooks.useUser(assigneeId);
  const deleteCourse = hooks.useDeleteCourse();
  const handleClickDelete = () => {
    if (deleteCourse) {
      deleteCourse(id);
    }
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  const courseTypeClass = (courseType) => {
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

  return (
    <Paper
      className={`${classNames.task} ${courseTypeClass(courseType)}`}
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
        <CompleteIcon />
      </div>

      {isDetailsOpen && (
        <CourseDetails id={id} isOpen={isDetailsOpen} close={closeDetails} />
      )}
    </Paper>
  );
}
