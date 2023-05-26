import React, { Fragment } from "react";
import Link from "next/link";
import MuiAppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import FlowchartsIcon from "@material-ui/icons/Apps";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Drawer from "@material-ui/core/Drawer";

import FlowchartSelectingMenu from "./FlowchartSelectingMenu";
import { useCurrentUsername } from "./CurrentUser";
import { useMenubarStyles } from "./styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const noop = () => {};

export interface MenubarProps {
  title: string;
  projectsUrlPath: string;
}

export default function Menubar({ title, projectsUrlPath }: MenubarProps) {
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

  return (
    <Fragment>
      <MuiAppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="subtitle2" className={classes.title} onClick={handleMenu}>
            {title}
          </Typography>

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
          <FlowchartSelectingMenu/>
        </div>
      </Drawer>
     
    </Fragment>
  );
}
