import * as React from 'react';
import { useRouteMatch, useLocation, useHistory } from 'react-router';
import * as queryString from 'query-string';
import { ViewList, DEFAULT_ELASTIC_SEARCH_VIEW_ID, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';
import { Col, Row, Select } from 'antd';
import { getResourceLabel } from '../../../shared/utils';
import useNotification from '../../../shared/hooks/useNotification';
import { useAdminSubappContext } from '..';

const ElasticSearchQueryView: React.FunctionComponent = (): JSX.Element => {
  const subapp = useAdminSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const history = useHistory();
  const notification = useNotification();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
      viewId: '',
    },
  };
  const [{ _results: views }, setViews] = React.useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const query = queryString.parse(location.search).query;

  const [selectedView, setSelectedView] = React.useState<string>(
    viewId ? decodeURIComponent(viewId) : DEFAULT_ELASTIC_SEARCH_VIEW_ID
  );

  React.useEffect(() => {
    history.replace(
      `/${
        subapp.namespace
      }/${orgLabel}/${projectLabel}/query/${encodeURIComponent(selectedView)}`
    );
  }, [selectedView]);

  const { Option } = Select;

  const menu = (
    <Row>
      <Col span={24}>
        <Select
          value={selectedView as string}
          onChange={v => setSelectedView(v)}
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
        >
          {[views]
            .flat()
            .filter(
              v =>
                v['@type']?.includes('ElasticSearchView') ||
                v['@type']?.includes('AggregateElasticSearchView')
            )
            .map((view: View, index: number) => {
              return (
                <Option key={index} value={view['@id']}>
                  {getResourceLabel(view)}
                </Option>
              );
            })}
        </Select>
      </Col>
    </Row>
  );

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel)
      .then(result => {
        setViews(result);
      })
      .catch(error => {
        notification.error({
          message: 'Problem loading Views',
          description: error.message,
        });
      });
  }, [orgLabel, projectLabel]);

  return (
    <>
      {menu}
      <div className="view-view view-container -unconstrained-width">
        <ElasticSearchQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={query ? JSON.parse(`${query}`) : null}
          viewId={encodeURIComponent(selectedView)}
        />
      </div>
    </>
  );
};

export default ElasticSearchQueryView;
