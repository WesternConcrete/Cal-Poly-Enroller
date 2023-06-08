import { createTheme } from "@material-ui/core/styles";

export default createTheme({
  palette: {
    primary: {
      main: "#1a6b1e",
    },
    secondary: {
      main: "#6B718B",
    },
  },
  overrides: {
    MuiLink: {
      root: {
        cursor: "pointer",
      },
    },
    MuiInputBase: {
      input: { background: "#fff" },
      multiline: { background: "#fff" },
    },
    MuiSelect: {
      outlined: {
        paddingTop: 10.5,
        paddingBottom: 10.5,
      },
    },
  },
  props: {
    MuiButtonBase: {
      disableRipple: true, // No ripple on the whole application
    },
    MuiDialog: {
      transitionDuration: 0,
    },
    MuiPopover: {
      PaperProps: { square: true },
    },
    MuiTooltip: {
      enterDelay: 1200,
      arrow: true,
    },
    MuiIconButton: {
      size: "small",
    },
    MuiIcon: {
      fontSize: "small",
    },
    MuiButton: {
      disableElevation: true,
      variant: "contained",
      disableRipple: true,
    },
    MuiTextField: {
      variant: "outlined",
      margin: "dense",
      InputLabelProps: {
        shrink: true,
      },
    },
    MuiFormControl: {
      variant: "outlined",
      margin: "dense",
    },
  },
});
