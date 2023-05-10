import React from 'react';

import { FlowchartData, UpdateFlowchartData } from './store/types';
import CurrentUser from './CurrentUser';
import { StoreProvider } from './store';
import Menubar from './Menubar';
import Flowchart from './Flowchart';
import { useDashboardStyles } from './styles';

export interface Props {
  projectsUrlPath: string,
  title: string,
  state: FlowchartData,
  updateFlowchartData: UpdateFlowchartData,
}
export default function Dashboard({ state, title, updateFlowchartData, projectsUrlPath }: Props) {
  const classNames = useDashboardStyles();

  return (
    <StoreProvider state={state} updateFlowchartData={updateFlowchartData}>
      <CurrentUser userId={state.ids.user[0]}>
        <div className={classNames.root}>
          <Menubar projectsUrlPath={projectsUrlPath} title={title} />
          <div className={classNames.content}>
            <Flowchart/>
          </div>
        </div>
      </CurrentUser>
    </StoreProvider>
  );
}
