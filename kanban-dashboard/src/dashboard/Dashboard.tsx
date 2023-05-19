import React from "react";

import { FlowchartData, UpdateFlowchartData } from "./store/types";
import CurrentUser from "./CurrentUser";
import { StoreProvider } from "./store";
import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { useDashboardStyles } from "./styles";
import type { Degree } from "~/server/api/root"

export interface Props {
  projectsUrlPath: string;
  degreeState: [Degree | undefined, React.SetStateAction<Degree>],
  state: FlowchartData;
  updateFlowchartData: UpdateFlowchartData;
}
export default function Dashboard({
  state,
  degreeState,
  updateFlowchartData,
  projectsUrlPath,
}: Props) {
  const classNames = useDashboardStyles();
    const [degree, setDegree] = degreeState;

  return (
    <StoreProvider state={state} updateFlowchartData={updateFlowchartData}>
      <CurrentUser userId={state.ids.user[0]}>
        <div className={classNames.root}>
          <Menubar projectsUrlPath={projectsUrlPath} setDegree={setDegree} />
          <div className={classNames.content}>
            <Flowchart />
          </div>
        </div>
      </CurrentUser>
    </StoreProvider>
  );
}
