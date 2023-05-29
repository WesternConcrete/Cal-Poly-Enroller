import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { useDashboardStyles } from "./styles";
import { FlowchartStateProvider } from "~/dashboard/state";

export interface Props {
  projectsUrlPath: string;
}

export default function Dashboard({ projectsUrlPath }: Props) {
  const classNames = useDashboardStyles();
  return (
    <FlowchartStateProvider>
      <div className={classNames.root}>
        <Menubar projectsUrlPath={projectsUrlPath} />
        <div className={classNames.content}>
          <Flowchart />
        </div>
      </div>
    </FlowchartStateProvider>
  );
}
