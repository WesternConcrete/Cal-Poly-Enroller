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
import { DraggingState, FlowchartState } from "~/dashboard/state";
import { Check, PlusCircle, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type PopoverProps } from "@radix-ui/react-popover";
import { useMutationObserver } from "@/hooks/use-mutation-observer";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

export interface Props {
  requirement: Requirement;
  index: number;
  collapsed?: boolean;
}

type CompleteStatus = "complete" | "incomplete" | "in-progress";

export default function CourseCard({ requirement, index, collapsed }: Props) {
  const { dragging, draggingItem, draggingOver } =
    React.useContext(DraggingState);

  const { selectedRequirements, setSelectedRequirements, requirements } =
    React.useContext(FlowchartState);

  const toggleRequirement = (requirement: Requirement) => {
    if (collapsed || (is_ge && !selectedRequirement)) {
      return;
    }
    if (selectedRequirements.includes(requirement.id)) {
      setSelectedRequirements(
        selectedRequirements.filter((req) => req !== requirement.id)
      );
    } else {
      setSelectedRequirements([...selectedRequirements, requirement.id]);
    }
  };

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

  const getCollapsed = () => {
    return (
      (dragging &&
        draggingItem === requirement.id.toString() &&
        draggingOver === "-1") ||
      (collapsed && !(draggingItem === requirement.id.toString()))
    );
  };

  const getHoveringOverCollapsedQuarter = () => {
    return (
      dragging &&
      draggingItem === requirement.id.toString() &&
      draggingOver === "-1"
    );
  };

  //will need to be updated. Only here for UI selecting GE's
  const is_ge = requirement.courseType === "ge";
  const [selectedRequirement, setSelectedRequirement] =
    React.useState<Requirement | null>(null);
  //^^^^

  const available_ge_options = requirements;

  return (
    <Draggable
      key={requirement.code}
      draggableId={requirement.id.toString()}
      index={index}
    >
      {(provided: DraggableProvided) => {
        return (
          <div
            className=""
            ref={provided.innerRef}
            onClick={() => toggleRequirement(requirement)}
            {...provided.draggableProps}
          >
            <div
              className={`
            p-[.4rem] 
            w-full 
            ${
              getCollapsed()
                ? "min-h-[30px] opacity-40 collapsed-course-width"
                : "min-h-[70px] regular-course-width"
            } 
            ${getHoveringOverCollapsedQuarter() ? "mt-[0.5rem]" : ""}
            rounded-[0.5rem] 
            relative 
            ${courseTypeClass(requirement.courseType)} 
            
            mb-[0.5rem] 
            flex 
            border-[1px] 
            border-solid 
            border-[#6B718B] 
            
            rounded-[0.5rem] 
            hover:border-[2px]
            ${
              selectedRequirements.includes(requirement.id) && !getCollapsed()
                ? "border-[2px] border-primaryGreen "
                : ""
            }

          `}
              {...provided.dragHandleProps}
            >
              {getCollapsed() ? (
                <>
                  <div className="grid justify-items-center h-full row-gap-[0.2rem] w-full text-center justify-center">
                    <div>
                      <div className={`font-bold text-[11px]`}>
                        {requirement.code}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {is_ge ? (
                    <>
                      {selectedRequirement ? (
                        <div className="grid justify-items-center grid-rows-[min-content,1fr,min-content] h-full row-gap-[0.2rem] w-full text-center justify-center">
                          <div>
                            <div
                              className={`mt-[0.5rem] font-bold text-[11px]`}
                            >
                              {selectedRequirement.code}
                            </div>
                            <div className="font-normal text-[9px]">
                              {selectedRequirement.title}
                            </div>
                            <div className="font-bold mt-[0.3rem] mb-[0.3rem] text-[9px]">
                              {selectedRequirement.units} units
                            </div>
                            <RequirementSelector
                              requirements={available_ge_options}
                              setSelectedRequirement={(req) =>
                                setSelectedRequirement(req)
                              }
                              selectedRequirement={selectedRequirement}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid justify-items-center grid-rows-[min-content,1fr,min-content] h-full row-gap-[0.2rem] w-full text-center justify-center">
                          <div>
                            <div
                              className={`mt-[0.5rem] font-bold text-[11px]`}
                            >
                              GE AREA B
                            </div>
                            <RequirementSelector
                              requirements={available_ge_options}
                              setSelectedRequirement={(req) =>
                                setSelectedRequirement(req)
                              }
                              selectedRequirement={
                                selectedRequirement as unknown as Requirement
                              }
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid justify-items-center grid-rows-[min-content,1fr,min-content] h-full row-gap-[0.2rem] w-full text-center justify-center">
                      <div>
                        <div className={`mt-[0.5rem] font-bold text-[11px]`}>
                          {requirement.code}
                        </div>
                        <div className={`overflow-hidden max-h-[100px]`}>
                          <div className="font-normal text-[9px]">
                            {requirement.title}
                          </div>
                          <div className="font-bold mt-[0.3rem] mb-[0.3rem] text-[9px]">
                            {requirement.units} units
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {selectedRequirements.includes(requirement.id) &&
                !getCollapsed() && (
                  <div className="absolute scale-30 top-[0.1rem] right-[0.1rem]">
                    <Check className="text-primaryGreen" />
                  </div>
                )}
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}

interface RequirementSelectorProps extends PopoverProps {
  requirements: Requirement[];
  setSelectedRequirement: (Requirement: Requirement) => void;
  selectedRequirement: Requirement;
}

export function RequirementSelector({
  requirements,
  setSelectedRequirement,
  selectedRequirement,
  ...props
}: RequirementSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [peekedRequirement, setPeekedRequirement] =
    React.useState<Requirement | null>(null);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen} {...props}>
        <PopoverTrigger asChild>
          {selectedRequirement ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 border-solid bg-white mt-[.6rem]"
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-solid bg-white mt-[.6rem]"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Select
            </Button>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[150px] p-0">
          <Command loop>
            <CommandList className="h-[var(--cmdk-list-height)] max-h-[300px]">
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No Requirements found.</CommandEmpty>

              <CommandGroup>
                {requirements.map((req) => (
                  <RequirementItem
                    key={req.code}
                    requirement={req}
                    isSelected={selectedRequirement?.id === req.id}
                    peekedRequirement={peekedRequirement}
                    onPeek={(req) => setPeekedRequirement(req)}
                    onSelect={() => {
                      setSelectedRequirement(req);
                      setOpen(false);
                    }}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface RequirementItemProps {
  requirement: Requirement;
  peekedRequirement: Requirement | null;
  isSelected: boolean;
  onSelect: () => void;
  onPeek: (Requirement: Requirement) => void;
}

function RequirementItem({
  requirement,
  isSelected,
  onSelect,
  onPeek,
  peekedRequirement,
}: RequirementItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  type Procedure = (...args: any[]) => void;

  function debounce<F extends Procedure>(func: F, waitMilliseconds: number): F {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
      const context = this;

      const doLater = function () {
        timeoutId = undefined;
        func.apply(context, args);
      };

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(doLater, waitMilliseconds);
    } as F;
  }

  const debouncedOnPeek = debounce(onPeek, 100);

  useMutationObserver(ref, (mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        if (mutation.attributeName === "aria-selected") {
          //debounce onPeek(requirement)
          debouncedOnPeek(requirement);
        }
      }
    }
  });

  return (
    <CommandItem
      key={requirement.id}
      onSelect={onSelect}
      ref={ref}
      className="aria-selected:bg-primary aria-selected:text-primary-foreground"
    >
      {requirement.code}
      <Check
        className={cn(
          "ml-auto h-4 w-4",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <div>
        <HoverCard>
          <HoverCardTrigger />
          {peekedRequirement?.code === requirement.code && (
            <HoverCardContent
              side="right"
              align="end"
              forceMount
              sticky="always"
            >
              <div className="grid gap-2">
                <h4 className="font-medium leading-none">
                  {peekedRequirement.code}
                </h4>
                <div className="text-sm text-muted-foreground">
                  {peekedRequirement.title}
                </div>
                <h5 className="text-sm font-medium leading-none">
                  {peekedRequirement.units} units
                </h5>
              </div>
            </HoverCardContent>
          )}
        </HoverCard>
      </div>
    </CommandItem>
  );
}
