import React from "react";
import { useState, useEffect } from "react";

import CurrentUser from "./CurrentUser";
import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { useDashboardStyles } from "./styles";

import { Requirement, type Degree } from "~/server/api/root";
import { api } from "~/utils/api";

type Setter<S> = React.Dispatch<React.SetStateAction<S>>;

type FlowchartStateType = {
  requirements: Requirement[];
  setRequirements: Setter<Requirement[]>;
  degree: Degree | null;
  setDegree: Setter<Degree | null>;
  startYear: number;
  setStartYear: Setter<number>;
  moveRequirement: (requirementId: number, quarterId: number) => void;
};

export const FlowchartState = React.createContext<FlowchartStateType>(
  {} as FlowchartStateType
);

export interface Props {
  projectsUrlPath: string;
}

export default function Dashboard({ projectsUrlPath }: Props) {
  // TODO: remove requirements state and replace with trpc query
  // TODO: remove StoreProvider and replace with trpc quarters query in flowchart
  // TODO: merge dashboard and flowhcart components
  // TODO: make moveRequirement a backend mutation
  const classNames = useDashboardStyles();
  const [degree, setDegree] = useState<Degree | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  // default to current year
  // TODO: create way to select start year
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const trpcClient = api.useContext();
  useEffect(() => {
    console.log("updating requirements!");
  }, [requirements]);
  const requirementsQuery = api.degreeRequirements.useQuery(
    { degree, startYear },
    { enabled: false, onSuccess: (data) => setRequirements(data) }
  );
  const moveRequirement = (requirementId: number, quarterId: number) => {
    trpcClient.degreeRequirements.setData(
      { degree, startYear },
      (requirements) => {
        if (!requirements) {
          console.error("No requirements found for degree:", degree);
          return [];
        }
        let found = false;
        const newRequirements = requirements.map((r) => {
          if (r.id === requirementId) {
            found = true;
            console.log("moving:", r, "to:", quarterId);
            r.quarterId = quarterId;
          }
          return r;
        });
        if (!found) {
          console.error(
            `Tried to move requirement with id: ${requirementId} but couldn't find it...`
          );
        }
        return newRequirements;
      }
    );
  };

  const flowchartContext = {
    degree,
    setDegree,
    requirements,
    setRequirements,
    startYear,
    setStartYear,
    moveRequirement,
  };

  // TODO: move nested courses fetch here to avoid loading spinner waterfall

  return (
    <FlowchartState.Provider value={flowchartContext}>
      <div className={classNames.root}>
        <Menubar projectsUrlPath={projectsUrlPath} />
        <div className={classNames.content}>
          <Flowchart />
        </div>
      </div>
    </FlowchartState.Provider>
  );
}
