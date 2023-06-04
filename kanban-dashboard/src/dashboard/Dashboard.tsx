import Menubar from "./Menubar";
import Flowchart from "./Flowchart";
import { FlowchartStateProvider } from "~/dashboard/state";

export interface Props {}

export default function Dashboard({}: Props) {
  return (
    <Flowchart />
  );
}
