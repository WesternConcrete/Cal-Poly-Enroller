import React, { Fragment } from "react";
import MuiAppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Drawer from "@material-ui/core/Drawer";

import FlowchartSelectingMenu from "./FlowchartSelectingMenu";
import { useCurrentUsername } from "./CurrentUser";
import { useMenubarStyles } from "./styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import { Select, MenuItem, InputLabel } from "@material-ui/core";
import { FlowchartState } from "~/dashboard/state";
import { api } from "~/utils/api";

export interface MenubarProps {
  projectsUrlPath: string;
}

export default function Menubar({ projectsUrlPath }: MenubarProps) {
  const { setDegree, startYear } = React.useContext(FlowchartState);
  const classes = useMenubarStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const currentUsername = useCurrentUsername();

  // @ts-ignore
  const handleMenu = (event) => {
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
    <Fragment>
      <MuiAppBar position="static">
        <Toolbar>
          <InputLabel id="select-degree">
            <Typography variant="h6">Degree</Typography>
          </InputLabel>
          <Select
            value={selectedDegreeDisplayName}
            onChange={({ target: { value } }) => updateDegree(value as string)}
            labelId="select-degree"
          >
            <MenuItem value="Select a Degree" key={-1}>
              Select a Degree
            </MenuItem>
            {degreesQuery.data &&
              degreesQuery.data.map((degree, idx) => {
                return (
                  <MenuItem value={degree.name} key={idx}>
                    {degree.name}, {degree.kind}
                  </MenuItem>
                );
              })}
          </Select>
          <div className={classes.title}>{/* spacer with flax grow */}</div>

          <div className={classes.currentUser}>
            <Typography variant="subtitle2" className={classes.currentUsername}>
              {currentUsername}
            </Typography>

            <IconButton color="inherit">
              <AccountCircle />
            </IconButton>
          </div>
        </Toolbar>
        <div className={classes.addButtonContainer} onClick={handleMenu}>
          <Fab color="primary" aria-label="add">
            <AddIcon />
          </Fab>
        </div>
      </MuiAppBar>

      <Drawer open={open} anchor="left" onClose={handleClose}>
        <div style={{ width: 300 }}>
          <FlowchartSelectingMenu />
        </div>
      </Drawer>
    </Fragment>
  );
}
