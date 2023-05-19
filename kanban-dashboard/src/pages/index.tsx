import React, { useEffect, useState } from "react";
import { Dashboard } from "../dashboard";
import {
  Flowchart as FlowchartState,
  FlowchartData,
} from "../dashboard/store/types";

import { api } from "~/utils/api";

export default function DashboardPage() {
  const project: FlowchartState = {
    meta: {
      id: "2658eced-fd21-446a-8d7c-4896f0d423b3",
      title: "Computer Science ML/AI (2021 - 2022)",
      description: "An example project with a basic Kanban setup",
    },
  };
  const [flowchart, setFlowchart] = useState<FlowchartData>();
  const quartersQuery = api.quarters.useQuery();
  useEffect(() => {
    setFlowchart(quartersQuery.data);
  }, [quartersQuery.data]);

  // TODO: move nested courses fetch here to avoid loading spinner waterfall
  return flowchart ? (
    <Dashboard
      state={flowchart}
      updateFlowchartData={(newFlowchart: FlowchartData) =>
        setFlowchart(newFlowchart)
      }
      title={project.meta.title}
      projectsUrlPath="/"
    />
  ) : (
    <div> Loading ...</div>
  );
}
