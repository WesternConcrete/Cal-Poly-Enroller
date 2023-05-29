import React, { useContext } from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { Droppable, DroppableProvided } from "react-beautiful-dnd";
import CourseCard from "./CourseCard";
import { useLaneStyles } from "./styles";
import { FlowchartState } from "~/dashboard/state";
import { api } from "~/utils/api";
import { Quarter } from "~/server/api/root";
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
              {quarterRequirements.map((requirement, index) => (
                <CourseCard requirement={requirement} index={index} />
              ))}
            </div>
          );
        }}
      </Droppable>
    </Paper>
  );
}

export interface StatusOptionsProps {
  onClickEdit: () => void;
  onClickDelete: () => void;
}

export function StatusOptions({
  onClickEdit,
  onClickDelete,
}: StatusOptionsProps) {
  return (
    <List>
      <ListItem button onClick={onClickEdit}>
        <ListItemText primary="Edit Column" />
      </ListItem>
      <ListItem button onClick={onClickDelete}>
        <ListItemText primary="Delete Column" />
      </ListItem>
    </List>
  );
}
