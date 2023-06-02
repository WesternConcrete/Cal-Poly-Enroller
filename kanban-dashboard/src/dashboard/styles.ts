import { makeStyles } from "@material-ui/core/styles";

export const useDashboardStyles = makeStyles((_theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flexGrow: 1,
    height: `calc(100vh - 65px)`, // 65 is height of appbar
  },
}));

export const useMenubarStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  addButtonContainer: {
    position: "absolute",
    bottom: theme.spacing(2),
    left: theme.spacing(2),
    cursor: "pointer",
  },
  menuBar: {
    minHeight: "50px",
  },
  title: {
    flexGrow: 1,
    fontSize: 15,
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  currentUser: {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
  },
  currentUsername: {
    marginRight: 4,
  },
}));

export const useUserItemStyles = makeStyles(() => ({
  editBtn: {
    marginLeft: 4,
  },
}));

export const useUserEditorStyles = makeStyles(() => ({
  root: {
    width: "100%",
  },
  listItem: {
    alignItems: "self-end",
  },
}));

export const useCommonStyles = makeStyles(() => ({
  dragHandle: {
    position: "absolute",
    left: 4,
    top: 10,
    color: "rgba(0, 0, 0, 0.54)",
  },
}));

export const useBoardStyles = makeStyles((theme) => ({
  board: {
    height: "100%",
    display: "flex",
    flexFlow: "column",
  },
  horzRow: {
    display: "flex",
    columnGap: 5,
    fontSize: 8,
  },
  lanes: {
    flexGrow: 1,
    display: "flex",
    overflowX: "scroll",
    scrollBehavior: "smooth",
  },
  laneContainer: {
    flexBasis: "100%",
    flexGrow: 0,
    overflowY: "scroll",
    display: "flex",
    minWidth: 120,
    flexDirection: "column",
    position: "relative",
    border: "1px solid #e1e4e8",
  },
  newStatusLane: {
    flexBasis: 350,
    minWidth: 200,

    margin: theme.spacing(1.5),

    border: "3px dashed #e1e4e8",
    borderRadius: 0,
  },
  dialog: {
    padding: theme.spacing(2),
  },

  addButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export const useLaneStyles = makeStyles((theme) => ({
  lane: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#eff1f3",
  },
  laneHeader: {
    padding: theme.spacing(1),
    display: "flex",
    width: "100%",
  },
  laneTitle: {
    flexGrow: 1,
    fontSize: 11,
    fontWeight: "bold",
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  buttons: {},
  form: {
    padding: theme.spacing(1.5),
  },
  tasks: {
    padding: theme.spacing(1.5),
  },
  dialog: {
    padding: theme.spacing(2),
  },
}));

export const useCardStyles = makeStyles((theme) => ({
  taskContainer: {
    marginBottom: theme.spacing(0.5),
    display: "flex",
    border: "1px solid #6B718B",
    borderRadius: theme.spacing(0.5),
  },
  task: {
    padding: theme.spacing(1),
    width: "100%",
    minHeight: "70px",
    position: "relative",
  },
  statusIcon: {
    position: "absolute",
    scale: 0.6,
    top: theme.spacing(0.1),
    right: theme.spacing(0.1),
  },
  support: {
    background: "#F5D2A4",
  },
  concentration: {
    background: "#F19ECA",
  },
  ge: {
    background: "#E2FCD6",
  },
  major: {
    background: "#FEFDA6",
  },
  gwe: {
    background: "#D09895",
  },
  complete_status: {
    opacity: 0.4,
    cursor: "pointer",
  },
  in_progress_status: {
    opacity: 1,
  },
  incomplete_status: {
    opacity: 1,
  },
  taskHeader: {
    display: "grid",
    gridTemplateRows: "min-content 1fr min-content",
    height: "100%",
    rowGap: theme.spacing(0.2),
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: theme.spacing(0.5),
    fontWeight: "bold",
    fontSize: 11,
  },
  courseName: {
    fontWeight: "normal",
    fontSize: 9,
  },
  unitCount: {
    fontWeight: "bold",
    marginTop: theme.spacing(0.3),
    marginBottom: theme.spacing(0.3),
    fontSize: 9,
  },
  dialog: {
    padding: theme.spacing(2),
  },
}));

export const useCourseDetailsStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1.5),
  },
  closeBtn: {
    marginLeft: theme.spacing(1.5),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },
  title: {
    width: "100%",
  },
  section: {
    marginTop: theme.spacing(3),
  },
}));

export const useCourseAssignmentStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
  },
  select: {
    width: "50%",
  },
  unassignBtn: {
    padding: theme.spacing(1),
  },
}));
