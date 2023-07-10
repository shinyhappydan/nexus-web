import React, { useRef, useEffect, CSSProperties } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useHistory } from 'react-router';
import { clsx } from 'clsx';
import { RootState } from '../../store/reducers';
import {
  DATA_EXPLORER_GRAPH_FLOW_DIGEST,
  DATA_EXPLORER_GRAPH_FLOW_PATH,
  PopulateDataExplorerGraphFlow,
  ResetDataExplorerGraphFlow,
} from '../../store/reducers/data-explorer';
import {
  NavigationBackButton,
  NavigationCollapseButton,
} from '../../molecules/DataExplorerGraphFlowMolecules';
import NavigationStack from '../../organisms/DataExplorerGraphFlowNavigationStack/NavigationStack';
import DataExplorerContentPage from '../../organisms/DataExplorerGraphFlowContent/DataExplorerGraphFlowContent';
import ResourceResolutionCache from '../../components/ResourceEditor/ResourcesLRUCache';

import './styles.less';

const DataExplorerGraphFlow = () => {
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const digestFirstRender = useRef<boolean>(false);
  const { links, shrinked, current } = useSelector(
    (state: RootState) => state.dataExplorer
  );

  useEffect(() => {
    if (!digestFirstRender.current) {
      const state = sessionStorage.getItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      if (state) {
        dispatch(PopulateDataExplorerGraphFlow(state));
      }
    }
    digestFirstRender.current = true;
  }, [location.search, digestFirstRender.current]);

  useEffect(() => {
    const unlisten = history.listen(location => {
      if (!location.pathname.startsWith(DATA_EXPLORER_GRAPH_FLOW_PATH)) {
        dispatch(ResetDataExplorerGraphFlow({ initialState: null }));
        sessionStorage.removeItem(DATA_EXPLORER_GRAPH_FLOW_DIGEST);
      }
    });
    return () => unlisten();
  }, []);

  useEffect(() => {
    return () => {
      ResourceResolutionCache.clear();
    };
  }, [ResourceResolutionCache]);
  if (current === null) {
    return (
      <div className="data-explorer-resolver no-current">
        <div className="empty">
          <img
            src={require('../../images/graphNodes.svg')}
            alt="nodes"
            style={{ width: 500 }}
          />
          <div className="empty__title">No data explorer graph flow</div>
          <div className="empty__subtitle">
            Please select a node from any resource view editor to start
            exploring
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={clsx(
        'data-explorer-resolver',
        shrinked && 'shrinked',
        !links.length ? 'no-links' : 'with-links'
      )}
      style={
        {
          '--links-count': shrinked ? 3 : links.length,
        } as CSSProperties
      }
    >
      <div className="degf__navigation-stack">
        <NavigationStack />
      </div>
      <div className="degf__navigation-back">
        <NavigationCollapseButton />
        <NavigationBackButton />
      </div>
      <div className="degf__content">
        <DataExplorerContentPage />
      </div>
    </div>
  );
};

export default DataExplorerGraphFlow;
