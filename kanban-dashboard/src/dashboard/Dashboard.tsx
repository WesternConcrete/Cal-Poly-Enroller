import React from "react";
import { useState, useEffect } from "react";

import { Course, FlowchartData, UpdateFlowchartData } from "./store/types";
import CurrentUser from "./CurrentUser";
import { StoreProvider } from "./store";
import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { useDashboardStyles } from "./styles";

import { RequirementCourse, type Degree } from "~/server/api/root";
import { api } from "~/utils/api";

type Setter<S> = React.Dispatch<React.SetStateAction<S>>;

type FlowchartStateType = {
  requirements: Course[];
  setRequirements: Setter<Course[]>;
  degree: Degree | null;
  setDegree: Setter<Degree | null>;
};

const FlowchartState = React.createContext<FlowchartStateType>({} as FlowchartStateType);

export interface Props {
  projectsUrlPath: string;
}

export default function Dashboard({ projectsUrlPath }: Props) {
  const classNames = useDashboardStyles();
  const [degree, setDegree] = useState<Degree | null>(null);
  const [requirements, setRequirements] = useState<Course[]>([]);
  const [flowchart, setFlowchart] = useState<FlowchartData>();
  const quartersQuery = api.quarters.useQuery();
  const requirementsQuery = api.degreeRequirements.useQuery(
    { degree },
    { enabled: false, onSuccess: (data) => setRequirements(data) }
  );
  useEffect(() => {
    requirementsQuery.refetch();
  }, [degree]);
  useEffect(() => {
    // TODO: make quarters query return quarters not global state
    setFlowchart(quartersQuery.data);
  }, [quartersQuery.data]);

  // TODO: move nested courses fetch here to avoid loading spinner waterfall

  return flowchart ? (
    <StoreProvider state={flowchart} updateFlowchartData={setFlowchart}>
      <FlowchartState.Provider
        value={{ degree, setDegree, requirements, setRequirements }}
      >
        <div className={classNames.root}>
          <Menubar projectsUrlPath={projectsUrlPath} setDegree={setDegree} />
          <div className={classNames.content}>
            <Flowchart requirements={requirements} />
          </div>
        </div>
      </FlowchartState.Provider>
    </StoreProvider>
  ) : (
    <div>loading...</div>
  );
}
