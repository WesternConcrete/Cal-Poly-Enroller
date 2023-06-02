import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { useDashboardStyles } from "./styles";
import { FlowchartStateProvider } from "~/dashboard/state";

export interface Props {}

export default function Dashboard({}: Props) {
  const classNames = useDashboardStyles();
  return (
    <FlowchartStateProvider>
      <div className={classNames.root}>
        <Menubar />
        <div className={classNames.content}>
          <Flowchart />
        </div>
      </div>
    </FlowchartStateProvider>
  );
}
