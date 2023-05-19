import React, { useEffect, useState } from "react";
import { Dashboard } from "../dashboard";
import { FlowchartData } from "../dashboard/store/types";
import { type Degree } from "~/server/api/root";

import { api } from "~/utils/api";

export default function DashboardPage() {
  const degreeState = useState<Degree>();
  const [flowchart, setFlowchart] = useState<FlowchartData>();
  const quartersQuery = api.quarters.useQuery();
  useEffect(() => {
    // TODO: make quarters query return quarters not global state
    setFlowchart(quartersQuery.data);
  }, [quartersQuery.data]);

  // TODO: move nested courses fetch here to avoid loading spinner waterfall
  return flowchart ? (
    <Dashboard
      state={flowchart}
      degreeState={degreeState}
      updateFlowchartData={(newFlowchart: FlowchartData) =>
        setFlowchart(newFlowchart)
      }
      projectsUrlPath="/"
    />
  ) : (
    <div> Loading ...</div>
  );
}
