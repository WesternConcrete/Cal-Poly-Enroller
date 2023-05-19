import React, { type ChangeEvent, forwardRef } from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import { TextButton } from "../components/buttons";

import { hooks } from "./store";
import { useCourseAssignmentStyles } from "./styles";
import { Course } from "./store/types";

export interface Props {
  id: string;
}

export default function CourseAssignment({ id }: Props) {
  const userIds = hooks.useUserIds();
  const { assigneeId } = hooks.useCourse(id) as Course;
  const assignCourse = hooks.useAssignCourse();
  const unassignCourse = hooks.useUnassignCourse();

  const handleUnassignment = () => {
    unassignCourse(id, assigneeId as string);
  };

  const handleChange = (e: ChangeEvent<{ name?: string | undefined; value: unknown; }>) => {
    const userId = (e.target as HTMLSelectElement).value;

    userId ? assignCourse(id, userId) : handleUnassignment();
  };

  const classNames = useCourseAssignmentStyles();

  return (
    <div className={classNames.container}>
      <Select
        value={assigneeId || ""}
        onChange={handleChange}
        variant="outlined"
        className={classNames.select}
      >
        <MenuItem value="" selected={!assigneeId}>
          &nbsp;
        </MenuItem>
        {userIds.map((userId) => (
          <MenuItem
            key={userId}
            value={userId}
            selected={userId === assigneeId}
          >
            <AssignableUsername id={userId} />
          </MenuItem>
        ))}
      </Select>

      {assigneeId && (
        <div className={classNames.unassignBtn}>
          <TextButton onClick={handleUnassignment}>Unassign</TextButton>
        </div>
      )}
    </div>
  );
}

export interface AssignableUsernameProps {
  id: string;
}
function AssignableUsername({ id }: AssignableUsernameProps) {
  const user = hooks.useUser(id);
  if (!user) {
    return null;
  }

  return <span>{user.username}</span>;
}
