import React, { type MouseEventHandler, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import StarIcon from "@material-ui/icons/Star";
import DuplicateIcon from "@material-ui/icons/FileCopy";
import FavoriteIcon from "@material-ui/icons/Favorite";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Fade from "@material-ui/core/Fade";
import { yellow } from "@material-ui/core/colors";
import { DialogContentText } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "300px",
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  title: {
    margin: theme.spacing(2),
  },
  listItem: {
    padding: theme.spacing(1),
  },
  createButton: {
    margin: theme.spacing(2),
    marginTop: "auto",
  },
  selectedItem: {
    border: "2px solid",
    borderColor: theme.palette.primary.main,
    transition: "border-color 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.secondary.main,
    },
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  starIcon: {
    color: yellow[800],
  },
  actionMenu: {
    marginLeft: theme.spacing(2),
  },
  itemText: {
    flex: "initial",
  },
}));

export default function FlowchartSelectingMenu() {
  const classes = useStyles();
  // Replace this with your own state management logic
  const [flowcharts, setFlowcharts] = useState([
    "Flowchart 1",
    "Flowchart 2",
    "Flowchart 3",
  ]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [newFlowchartName, setNewFlowchartName] = useState("");
  const [newFlowchartConcentration, setNewFlowchartConcentration] =
    useState("");
  const [selectedFlowchart, setSelectedFlowchart] = useState("");
  const [favoritedFlowcharts, setFavoritedFlowcharts] = useState(
    [] as string[]
  );
  const [anchorEl, setAnchorEl] = useState(null as HTMLAnchorElement | null);

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event: Event) => {
    setAnchorEl(event.currentTarget as HTMLAnchorElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const createFlowchart = () => {
    // Add flowchart creation logic here
    console.log(
      "Create flowchart: ",
      newFlowchartName,
      newFlowchartConcentration
    );
    setFlowcharts([...flowcharts, newFlowchartName]);
    setOpenCreateModal(false);
  };

  const deleteFlowchart = () => {
    // Add flowchart deletion logic here
    console.log("Delete flowchart: ", selectedFlowchart);
    setFlowcharts(flowcharts.filter((f) => f !== selectedFlowchart));
    setOpenDeleteModal(false);
  };

  const duplicateFlowchart = (flowchart: string) => {
    // Add your logic here
    console.log(`Duplicate flowchart: ${flowchart}`);
  };

  const favoriteFlowchart = (flowchart: string) => {
    // Add your logic here
    console.log(`Favorite flowchart: ${flowchart}`);
    if (!favoritedFlowcharts.includes(flowchart)) {
      setFavoritedFlowcharts([...favoritedFlowcharts, flowchart]);
    } else {
      setFavoritedFlowcharts(
        favoritedFlowcharts.filter((fav) => fav !== flowchart)
      );
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.title}>
        Saved Flowcharts
      </Typography>
      <List>
        {flowcharts.map((flowchart, index) => (
          <ListItem
            key={index}
            button
            className={`${classes.listItem} ${
              flowchart === selectedFlowchart ? classes.selectedItem : ""
            }`}
            onClick={() => setSelectedFlowchart(flowchart)}
          >
            <ListItemText className={classes.itemText} primary={flowchart} />
            {favoritedFlowcharts.includes(flowchart) && (
              <StarIcon className={classes.starIcon} />
            )}
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="more"
                href=""
                onClick={handleClick}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                TransitionComponent={Fade}
                className={classes.actionMenu}
              >
                <MenuItem
                  onClick={() => {
                    favoriteFlowchart(flowchart);
                    handleClose();
                  }}
                >
                  <IconButton edge="end" aria-label="favorite">
                    <FavoriteIcon />
                  </IconButton>
                  Favorite
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    duplicateFlowchart(flowchart);
                    handleClose();
                  }}
                >
                  <IconButton edge="end" aria-label="duplicate">
                    <DuplicateIcon />
                  </IconButton>
                  Duplicate
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenDeleteModal(true);
                    setSelectedFlowchart(flowchart);
                    handleClose();
                  }}
                >
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                  Delete
                </MenuItem>
              </Menu>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setOpenCreateModal(true)}
        className={classes.createButton}
      >
        Create New Flowchart
      </Button>

      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <DialogTitle>Create New Flowchart</DialogTitle>
        <DialogContent>
          <TextField
            variant="outlined"
            margin="dense"
            id="flowchart-name"
            label="Flowchart Name"
            fullWidth
            onChange={(e) => setNewFlowchartName(e.target.value)}
          />
          <TextField
            variant="outlined"
            id="concentration"
            label="Concentration"
            fullWidth
            select
            value={newFlowchartConcentration}
            onChange={(e) =>
              setNewFlowchartConcentration(e.target.value )
            }
          >
            {/* Add your concentration options here */}
            <MenuItem value={"Concentration 1"}>Concentration 1</MenuItem>
            <MenuItem value={"Concentration 2"}>Concentration 2</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
          <Button onClick={createFlowchart}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Flowchart</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the flowchart "{selectedFlowchart}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={deleteFlowchart}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
