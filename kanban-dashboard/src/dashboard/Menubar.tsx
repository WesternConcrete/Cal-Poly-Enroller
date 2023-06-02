import React, { Fragment } from "react";

import FlowchartSelectingMenu from "./FlowchartSelectingMenu";
import { useCurrentUsername } from "./CurrentUser";
import { useMenubarStyles } from "./styles";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { FlowchartState } from "~/dashboard/state";
import { api } from "~/utils/api";

export interface MenubarProps {}

export default function Menubar({}: MenubarProps) {
  const { setDegree, startYear } = React.useContext(FlowchartState);
  const classes = useMenubarStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const currentUsername = useCurrentUsername();

  const handleMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const degreesQuery = api.degrees.useQuery(undefined, {
    staleTime: Infinity, // don't refresh until the user refreshes
  });

  const trpcClient = api.useContext();

  const [selectedDegreeDisplayName, setSelectedDegreeDisplayName] =
    React.useState<string>("Select a Degree");
  const updateDegree = (name: string) => {
    if (!degreesQuery.data) {
      return;
    }
    for (const degree of degreesQuery.data) {
      // TODO: create record of string id: Degree for faster lookup
      if (degree.name === name) {
        console.log("fetching degree requirements for:", degree);
        trpcClient.degreeRequirements.prefetch({ degree, startYear });
        setDegree(degree);
        setSelectedDegreeDisplayName(degree.name);
        break;
      }
    }
  };

  return (
      <div className="static">
        <Select
          value={selectedDegreeDisplayName}
          onValueChange={(value) => updateDegree(value)}
        >
          <SelectTrigger value="Select a Degree" key={-1}>
            <SelectValue placeholder="Select a Degree">Select a Degree</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {degreesQuery.data &&
              degreesQuery.data.map((degree, idx) => {
                return (
                  <SelectItem value={degree.name} key={idx}>
                    {degree.name}, {degree.kind}
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        <div className="flex flex-grow"></div>
      </div>
  );
}
