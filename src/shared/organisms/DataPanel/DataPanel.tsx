import React, { Fragment, useEffect, useReducer, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { animate, spring } from 'motion';
import { Button, Checkbox, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import {
  FileDoneOutlined,
  DownloadOutlined,
  PlusOutlined,
  CloseOutlined,
  CloseSquareOutlined,
} from '@ant-design/icons';
import {
  makeOrgProjectTuple,
  TDataSource,
  TResourceTableData,
} from '../../molecules/MyDataTable/MyDataTable';
import { RootState } from '../../../shared/store/reducers';
import useOnClickOutside from '../../../shared/hooks/useClickOutside';
import DeprecatedIcon from '../../../shared/components/Icons/DepreactedIcon/DeprecatedIcon';
import './styles.less';
import isValidUrl from '../../../utils/validUrl';

type Props = {
  authenticated?: boolean;
  token?: string;
};
type TDataPanel = {
  resources: TResourceTableData;
  openDataPanel: boolean;
};
export class DataPanelEvent<T> extends Event {
  detail: T | undefined;
}
export const DATA_PANEL_STORAGE_EVENT = 'datapanelupdated';
export const DATA_PANEL_STORAGE = 'datapanel-storage';

const DataPanel: React.FC<Props> = ({}) => {
  const location = useLocation();
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const datapanelRef = useRef<HTMLDivElement>(null);
  const dataLS = localStorage.getItem(DATA_PANEL_STORAGE);
  const [{ openDataPanel, resources }, updateDataPanel] = useReducer(
    (previous: TDataPanel, newPartialState: Partial<TDataPanel>) => ({
      ...previous,
      ...newPartialState,
    }),
    {
      resources: JSON.parse(dataLS!),
      openDataPanel: false,
    }
  );
  const handleRemoveItemFromDataPanel = (record: TDataSource) => {
    console.log('@@handleRemoveItemFromDataPanel', record);
    const selectedRowKeys = resources.selectedRowKeys.filter(
      t => t !== record.key
    );
    console.log('@@handleRemoveItemFromDataPanel', selectedRowKeys);
    const selectedRows = resources.selectedRows.filter(
      t => t.key !== record.key
    );
    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({ selectedRowKeys, selectedRows })
    );
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys, selectedRows },
        },
      })
    );
    updateDataPanel({ resources: { selectedRowKeys, selectedRows } });
  };
  const totalSelectedResources = resources?.selectedRowKeys?.length;
  const handleOpenDataPanel: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    updateDataPanel({ openDataPanel: true });
  };
  const handleCloseDataPanel = () => {
    updateDataPanel({ openDataPanel: false });
    datapanelRef.current &&
      animate(
        datapanelRef.current,
        {
          height: '0px',
          opacity: 0,
          display: 'none',
        },
        {
          duration: 1,
          easing: spring(),
        }
      );
  };
  const handleClearSelectedItems = () => {
    updateDataPanel({
      resources: { selectedRowKeys: [], selectedRows: [] },
    });
    localStorage.removeItem(DATA_PANEL_STORAGE);
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys: [], selectedRows: [] },
        },
      })
    );
  };
  const columns: ColumnsType<TDataSource> = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      render: text => (isValidUrl(text) ? `${text.split('/').pop()}` : text),
    },
    {
      key: 'project',
      title: 'project',
      dataIndex: 'project',
      render: text => {
        if (text) {
          const { org, project } = makeOrgProjectTuple(text);
          return (
            <Fragment>
              <Tag className="org-project-tag" color="white">
                {org}
              </Tag>
              <Link to={`/orgs/${org}/${project}`}>{project}</Link>
            </Fragment>
          );
        }
        return '';
      },
    },
    {
      key: 'description',
      title: 'description',
      dataIndex: 'description',
    },
    {
      key: 'type',
      title: 'type',
      dataIndex: 'type',
    },
    {
      key: 'actions',
      title: 'actions',
      dataIndex: 'actions',
      render: (_, record) => {
        return (
          <Button
            className="remove-data-item"
            onClick={() => handleRemoveItemFromDataPanel(record)}
          >
            Remove
            <CloseSquareOutlined />
          </Button>
        );
      },
    },
  ];
  const dataSource: TDataSource[] = resources?.selectedRows || [];
  useEffect(() => {
    const dataPanelEventListner = (
      event: DataPanelEvent<{ datapanel: TResourceTableData }>
    ) => {
      updateDataPanel({
        resources: event.detail?.datapanel,
        openDataPanel: false,
      });
    };
    window.addEventListener(
      DATA_PANEL_STORAGE_EVENT,
      dataPanelEventListner as EventListener
    );
    return () => {
      window.removeEventListener(
        DATA_PANEL_STORAGE_EVENT,
        dataPanelEventListner as EventListener
      );
    };
  }, []);
  useEffect(() => {
    if (openDataPanel && datapanelRef.current) {
      animate(
        datapanelRef.current,
        {
          height: '500px',
          display: 'flex',
          opacity: 1,
        },
        {
          duration: 2,
          easing: spring(),
        }
      );
    }
  }, [datapanelRef.current, openDataPanel]);
  useOnClickOutside(datapanelRef, () => {
    if (openDataPanel) {
      handleCloseDataPanel();
    }
  });
  if (
    !(authenticated && token) ||
    !(
      dataSource.length &&
      (location.pathname === '/' ||
        location.pathname === '/search' ||
        location.pathname === '/my-data')
    )
  ) {
    return null;
  }
  return (
    <div className="datapanel">
      <div ref={datapanelRef} className="datapanel-content">
        <div className="datapanel-content-wrapper">
          <div className="header">
            <div className="title">
              <span>Your saved items</span>
              <Button
                type="link"
                className="clear-data"
                onClick={handleClearSelectedItems}
              >
                Clear all data
              </Button>
            </div>
            <Button
              onClick={handleCloseDataPanel}
              type="link"
              className="btn-icon-trigger"
              icon={<CloseOutlined />}
            />
          </div>
          <div className="items">
            <Table<TDataSource>
              rowKey={record => `dp-${record.key}`}
              columns={columns}
              dataSource={dataSource}
              bordered={false}
              showSorterTooltip={false}
              showHeader={false}
              className="my-data-panel-table"
              rowClassName="my-data-panel-table-row"
              pagination={false}
              scroll={{ y: 400 }}
            />
          </div>
        </div>
      </div>
      <div className="datapanel-bar">
        <div className="left">
          <div className="selected-items" onClick={handleOpenDataPanel}>
            <FileDoneOutlined />
            <span>{totalSelectedResources} elements selected</span>
          </div>
        </div>
        <div className="download-options">
          <Checkbox>ASC</Checkbox>
          <Checkbox>SWC</Checkbox>
          <Checkbox>
            H5 <DeprecatedIcon style={{ marginBottom: 5 }} />{' '}
          </Checkbox>
          <Checkbox>OBJ</Checkbox>
          <Button type="link">
            <DownloadOutlined />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataPanel;
