import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { FlowchartStateProvider } from "~/dashboard/state";

export interface Props {}

export default function Dashboard({}: Props) {
  return (
    <FlowchartStateProvider>
     <div className="grid grid-rows-[auto,1fr] h-screen overflow-x-hidden">
  <div>
    <Menubar />
  </div>
  
  <div className="flex-grow h-full overflow-x-hidden">
    <Flowchart />
  </div>
</div>

    </FlowchartStateProvider>
  );
}
