import React, { useEffect, useState } from "react";
import { Draggable, type DraggableProvided } from "react-beautiful-dnd";
import CompleteIcon from "../components/icons/complete";
import InProgressIcon from "../components/icons/in-progress";
import IncompleteIcon from "../components/icons/incomplete";
import {
  RequirementTypeSchema,
  type RequirementType,
} from "~/scraping/catalog";
import { type Requirement } from "~/server/api/root";
import { api } from "~/utils/api";

export interface Props {
  requirement: Requirement;
  index: number;
}

type CompleteStatus = "complete" | "incomplete" | "in-progress";

export default function CourseCard({ requirement, index }: Props) {
  const COMPLETE_STATUS = {
    complete: {
      class: "opacity-40 cursor-pointer",
      icon: () => <CompleteIcon />,
    },
    incomplete: {
      class: "opacity-100",
      icon: () => <IncompleteIcon />,
    },
    "in-progress": {
      class: "opacity-100",
      icon: () => <InProgressIcon />,
    },
  };
  const [completeStatus, setCompleteStatus] =
    useState<CompleteStatus>("incomplete");
  const { data: currentQuarter } = api.currentQuarterId.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });

  useEffect(() => {
    if (!currentQuarter || currentQuarter < requirement.quarterId) {
      setCompleteStatus("incomplete");
    } else if (currentQuarter === requirement.quarterId) {
      setCompleteStatus("in-progress");
    } else if (currentQuarter > requirement.quarterId) {
      setCompleteStatus("complete");
    } else {
      throw new Error("unreachable");
    }
  }, [currentQuarter, requirement.quarterId]);

  const courseTypeClass = (courseType: RequirementType) => {
    switch (courseType) {
      case RequirementTypeSchema.enum.support:
        return "bg-[#F5D2A4]";
      // case CourseType.CONCENTRATION:
      //   return classNames.concentration;
      // case CourseType.GWR:
      //   return classNames.gwe;
      case RequirementTypeSchema.enum.ge:
        return "bg-[#E2FCD6]";
      default:
        return "bg-[#FEFDA6]";
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
            className="mb-[0.5rem] flex border-[1px] border-solid border-[#6B718B] rounded-[0.5rem]"
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div
              className={`p-[.4rem] w-full min-h-[70px] rounded-[0.5rem] relative ${courseTypeClass(
                requirement.courseType
              )} ${COMPLETE_STATUS[completeStatus].class}`}
              {...provided.dragHandleProps}
            >
              <div className="grid justify-items-center grid-rows-[min-content,1fr,min-content] h-full row-gap-[0.2rem] w-full text-center justify-center">
                <div>
                  <div className="mt-[0.5rem] font-bold text-[11px]">
                    {requirement.code}
                  </div>

                  <div className="font-normal text-[9px]">
                    {requirement.title}
                  </div>
                  <div className="font-bold mt-[0.3rem] mb-[0.3rem] text-[9px]">
                    {requirement.units} units
                  </div>
                </div>
                <div className="absolute scale-60 top-[0.1rem] right-[0.1rem]">
                  {/* {COMPLETE_STATUS[completeStatus].icon()} */}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}
