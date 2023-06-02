import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { FlowchartStateProvider } from "~/dashboard/state";

export interface Props {}

export default function Dashboard({}: Props) {
  return (
    <FlowchartStateProvider>
      <div className="h-[100vh] flex flex-col">
        <div />
        <div className="flex-grow-1 h-[calc(100vh - 65px)]">
          <Flowchart />
        </div>
      </div>
    </FlowchartStateProvider>
  );
}
