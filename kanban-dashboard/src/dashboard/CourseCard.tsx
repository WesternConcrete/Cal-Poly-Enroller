import React, { useMemo } from "react";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { Draggable, DraggableProvided } from "react-beautiful-dnd";
import { useCardStyles } from "./styles";
import CompleteIcon from "../components/icons/complete";
import InProgressIcon from "../components/icons/in-progress";
import { FlowchartState } from "~/dashboard/Dashboard";
import { RequirementTypeSchema, RequirementType } from "~/scraping/catalog";
import { api } from "~/utils/api";

export interface Props {
  requirement: Course;
  index: number;
}

type CompleteStatus = "complete" | "incomplete" | "in-progress";

export default function CourseCard({ requirement, index }: Props) {
  const classNames = useCardStyles();

  const COMPLETE_STATUS = {
    complete: {
      class: classNames.complete_status,
      icon: () => <CompleteIcon />,
    },
    incomplete: {
      class: classNames.incomplete_status,
      icon: () => <div></div>,
    },
    "in-progress": {
      class: classNames.in_progress_status,
      icon: () => <InProgressIcon />,
    },
  };
  const { data: currentQuarter } = api.currentQuarterId.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });
  const completeStatus: CompleteStatus = useMemo(() => {
    if (typeof currentQuarter !== "number") {
      console.error("currentQuarter is not a number", currentQuarter);
      return "incomplete";
    }
    if (!currentQuarter || currentQuarter < requirement.quarterId) {
      return "incomplete";
    } else if (currentQuarter === requirement.quarterId) {
      return "in-progress";
    } else if (currentQuarter > requirement.quarterId) {
      return "complete";
    } else {
      return "incomplete";
    }
    console.log(completeStatus);
  }, [currentQuarter, requirement.quarterId]);

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
      key={requirement.code}
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
                requirement.courseType
              )} ${COMPLETE_STATUS[completeStatus].class}`}
              {...provided.dragHandleProps}
            >
              <div className={classNames.taskHeader}>
                <div>
                  <Typography className={classNames.title}>
                    {requirement.code}
                  </Typography>

                  <Typography variant="subtitle2">
                    {requirement.title}
                  </Typography>
                </div>
                {COMPLETE_STATUS[completeStatus].icon()}
              </div>
            </Paper>
          </div>
        );
      }}
    </Draggable>
  );
}
