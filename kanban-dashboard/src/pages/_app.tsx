import React from "react";
import Head from "next/head";
import "~/styles/globals.css";
// import { ThemeProvider } from "@material-ui/core/styles";
// import CssBaseline from "@material-ui/core/CssBaseline";
// import "../dashboard/overrides.css";
// import theme from "../styles/theme";
import { api } from "~/utils/api";
import { SessionProvider } from "next-auth/react";
import { type Session } from "next-auth";
import type { AppProps } from "next/app";
import { FlowchartStateProvider } from "~/dashboard/state";

const App = ({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) => {
  return (
    <React.Fragment>
      <Head>
        <title>Kanban Dashboard App</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <SessionProvider session={pageProps.session}>
        <FlowchartStateProvider>
          <Component {...pageProps} />
        </FlowchartStateProvider>
      </SessionProvider>
    </React.Fragment>
  );
};

export default api.withTRPC(App);
