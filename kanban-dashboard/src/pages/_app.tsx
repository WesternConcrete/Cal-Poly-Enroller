import React from "react";
import Head from "next/head";
import { type AppType } from "next/app";
import "~/styles/globals.css"
// import { ThemeProvider } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import "../dashboard/overrides.css";
// import theme from "../styles/theme";
import { api } from "~/utils/api";

const App: AppType = ({ Component, pageProps }) => {

  return (
    <React.Fragment>
      <Head>
        <title>Kanban Dashboard App</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
        <Component {...pageProps} />
    </React.Fragment>
  );
};

export default api.withTRPC(App);
