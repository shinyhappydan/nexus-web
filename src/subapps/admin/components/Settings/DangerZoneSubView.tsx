import React, { useReducer } from 'react';
import { Button, notification, Tooltip, List } from 'antd';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { useHistory, useRouteMatch } from 'react-router';
import { useSelector } from 'react-redux';
import { useMutation } from 'react-query';
import { NexusClient } from '@bbp/nexus-sdk';
import { makeOrganizationUri } from '../../../../shared/utils';
import { RootState } from '../../../../shared/store/reducers';
import DangerZoneAction, {
  TDangerZoneActionProps,
} from '../../../../shared/modals/DangerZone/DangerZoneAction';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';
import './styles.less';

type TDangerZoneItem = {
  key: React.Key;
  title: string;
  description: string;
  action: React.ReactElement;
};
type Props = {
  project: {
    _label: string;
    _rev: number;
    description?: string;
    base?: string;
    vocab?: string;
    mode: string;
    _deprecated: boolean;
  };
};
const deprecateProject = async ({
  nexus,
  orgLabel,
  projectLabel,
  rev,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.Project.deprecate(orgLabel, projectLabel, rev);
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not deprecate your project', { cause: error });
  }
};
const deleteProject = async ({
  nexus,
  apiEndpoint,
  orgLabel,
  projectLabel,
  rev,
}: {
  nexus: NexusClient;
  apiEndpoint: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
}) => {
  try {
    await nexus.httpDelete({
      path: `${apiEndpoint}/projects/${orgLabel}/${projectLabel}?rev=${rev}&prune=true`,
    });
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not delete your project', { cause: error });
  }
};
type TDangerZoneActionState = Omit<
  TDangerZoneActionProps,
  'onClose' | 'status'
>;
const DangerZoneSubView = ({ project }: Props) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const {
    params: { orgLabel, projectLabel },
  } = match;
  const [
    { open, matchTerm, title, description, action, handler },
    updateModalState,
  ] = useReducer(
    (
      previous: TDangerZoneActionState,
      nextState: Partial<TDangerZoneActionState>
    ) => ({
      ...previous,
      ...nextState,
    }),
    {
      open: false,
      matchTerm: `${orgLabel}/${projectLabel}`.toLowerCase(),
      title: '',
      description: '',
      action: 'deprecate',
      handler: () => {},
    }
  );
  const onClose = () => updateModalState({ open: false });

  const { mutateAsync: deprecateProjectAsync, status } = useMutation(
    deprecateProject,
    {
      onSuccess: () => {
        history.push(makeOrganizationUri(orgLabel));
        notification.success({
          message: <strong>{`Project ${orgLabel}/${projectLabel}`}</strong>,
          description: 'Project has been deprecated successfully',
        });
      },
      onError: error => {
        notification.error({
          message: `Error deprecating project ${projectLabel}`,
          // @ts-ignore
          description: <code>{error.cause.message}</code>,
        });
      },
    }
  );
  const {
    mutateAsync: deleteProjectAsync,
    status: deletionStatus,
  } = useMutation(deleteProject, {
    onSuccess: () => {
      history.push(makeOrganizationUri(orgLabel));
      notification.success({
        message: <strong>{`Project ${orgLabel}/${projectLabel}`}</strong>,
        description: 'Project has been deleted successfully',
      });
    },
    onError: error => {
      notification.error({
        message: `Error deleting project ${projectLabel}`,
        // @ts-ignore
        description: <code>{error.cause.reason}</code>,
      });
    },
  });
  const handleDeprecation = () =>
    deprecateProjectAsync({ nexus, orgLabel, projectLabel, rev: project._rev });
  const handleDeletion = () =>
    deleteProjectAsync({
      nexus,
      apiEndpoint,
      orgLabel,
      projectLabel,
      rev: project._rev,
    });
  const handleOpenDeprecationModal = () =>
    updateModalState({
      open: true,
      title: 'Deprecate Project',
      description:
        'This action cannot be undone. This will permanently deprecated',
      action: 'deprecate',
      handler: handleDeprecation,
    });
  const handleOpenDeleteModal = () =>
    updateModalState({
      open: true,
      title: 'Delete Project',
      description: 'This action cannot be undone. This will permanently delete',
      action: 'delete',
      handler: handleDeletion,
    });
  const dangerZoneDataSource: TDangerZoneItem[] = [
    {
      key: 'deprecate-project-section',
      title: 'Deprecte this project',
      description: 'Mark this project as deprecated and read-only.',
      action: (
        <AccessControl
          path={[`${orgLabel}/${projectLabel}`]}
          permissions={['projects/write']}
          noAccessComponent={() => (
            <Tooltip title="You have no permissions to deprecate this project">
              <Button disabled danger style={{ margin: 0, marginRight: 10 }}>
                <span>Deprecate this Project</span>
                <HasNoPermission />
              </Button>
            </Tooltip>
          )}
        >
          <Button
            danger
            className="deprecate-btn"
            style={{ margin: 0, marginRight: 10 }}
            type="ghost"
            htmlType="button"
            disabled={project._deprecated}
            onClick={handleOpenDeprecationModal}
          >
            Deprecate this Project
          </Button>
        </AccessControl>
      ),
    },
    {
      key: 'delete-project-section',
      title: 'Delete this project',
      description:
        'Once you delete a project, there is no going back. Please be certain. ',
      action: (
        <AccessControl
          path={[`${orgLabel}/${projectLabel}`]}
          permissions={['projects/delete']}
          noAccessComponent={() => (
            <Tooltip title="You have no permissions to delete this project">
              <Button disabled danger style={{ margin: 0, marginRight: 10 }}>
                <span>Delete this Project</span>
                <HasNoPermission />
              </Button>
            </Tooltip>
          )}
        >
          <Button
            danger
            style={{ margin: 0, marginRight: 10 }}
            type="primary"
            htmlType="button"
            onClick={handleOpenDeleteModal}
          >
            Delete this Project
          </Button>
        </AccessControl>
      ),
    },
  ];

  return (
    <>
      <div className="settings-view settings-danger-zone-view">
        <h2>Danger Zone</h2>
        <div className="settings-view-container">
          <div className="danger-actions">
            <List<TDangerZoneItem>
              size="large"
              bordered
              className="danger-zone-container"
              rowKey={item => item.key}
              dataSource={dangerZoneDataSource}
              renderItem={item => {
                return (
                  <List.Item key={item.key} extra={item.action}>
                    <List.Item.Meta
                      className="danger-zone-item"
                      title={<div className="title">{item.title}</div>}
                      description={item.description}
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>
      <DangerZoneAction
        {...{ open, matchTerm, title, description, action, handler }}
        status={status === 'loading' || deletionStatus === 'loading'}
        onClose={onClose}
      />
    </>
  );
};

export default DangerZoneSubView;
