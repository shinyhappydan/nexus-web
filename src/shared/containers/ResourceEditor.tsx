import * as React from 'react';
import {
  ExpandedResource,
  ResourceSource,
  Resource,
  NexusClient,
} from '@bbp/nexus-sdk';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';
import ResourceEditor from '../components/ResourceEditor';
import { useNexusContext } from '@bbp/react-nexus';
import { getNormalizedTypes } from '../components/ResourceEditor/editorUtils';
import useNotification, { parseNexusError } from '../hooks/useNotification';
import { InitNewVisitDataExplorerGraphView } from '../store/reducers/data-explorer';
import { getOrgAndProjectFromResourceObject, getResourceLabel } from '../utils';

const ResourceEditorContainer: React.FunctionComponent<{
  resourceId: string;
  orgLabel: string;
  projectLabel: string;
  rev: number;
  defaultExpanded?: boolean;
  defaultEditable?: boolean;
  onSubmit: (value: object) => void;
  onExpanded?: (expanded: boolean) => void;
  tabChange?: boolean;
  showMetadataToggle?: boolean;
  showFullScreen: boolean;
  showExpanded?: boolean;
  showControlPanel?: boolean;
}> = ({
  resourceId,
  orgLabel,
  projectLabel,
  rev,
  defaultEditable = false,
  defaultExpanded = false,
  onSubmit,
  onExpanded,
  tabChange,
  showMetadataToggle,
  showFullScreen = false,
  showControlPanel = true,
  showExpanded,
}) => {
  const nexus = useNexusContext();
  const dispatch = useDispatch();
  const navigate = useHistory();
  const notification = useNotification();
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const [editable, setEditable] = React.useState(defaultEditable);
  const [showMetadata, setShowMetadata] = React.useState<boolean>(false);
  const [{ busy, resource, error }, setResource] = React.useState<{
    busy: boolean;
    resource: ResourceSource | ExpandedResource | Resource | null;
    error: Error | null;
  }>({
    busy: false,
    resource: null,
    error: null,
  });

  React.useEffect(() => {
    setResource({
      resource,
      error: null,
      busy: true,
    });
    setEditable(defaultEditable);
    if (resource?.['@type']?.includes('File')) {
      setEditable(false);
    }

    getNewResource()
      .then(response =>
        setResource({
          resource: response as Resource,
          error: null,
          busy: false,
        })
      )
      .catch(error => {
        notification.error({
          message: 'Failed to load JSON payload',
          description: parseNexusError(error),
        });
        setResource({
          error,
          resource: null,
          busy: false,
        });
      });
  }, [
    resourceId,
    projectLabel,
    orgLabel,
    rev,
    expanded,
    showMetadata,
    tabChange,
    defaultEditable,
  ]);

  const handleFormatChange = () => {
    onExpanded && onExpanded(!expanded);
    setExpanded(!expanded);
  };

  const handleMetaDataChange = () => {
    setShowMetadata(!showMetadata);
  };
  const handleFullScreen = async () => {
    const data = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(resourceId),
      {
        rev,
      }
    )) as Resource;
    const orgProject = getOrgAndProjectFromResourceObject(data);
    dispatch(
      InitNewVisitDataExplorerGraphView({
        current: {
          _self: data._self,
          types: getNormalizedTypes(data['@type']),
          title: getResourceLabel(data),
          resource: [
            orgProject?.orgLabel ?? '',
            orgProject?.projectLabel ?? '',
            data['@id'],
            data._rev,
          ],
        },
        limited: true,
      })
    );
    navigate.push('/data-explorer/graph-flow');
  };
  async function getResourceSource(
    nexus: NexusClient,
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    rev: number
  ) {
    try {
      return await nexus.Resource.getSource(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        undefined,
        { rev }
      );
    } catch {
      return {} as ResourceSource;
    }
  }

  const getNewResource = async () => {
    if (expanded) {
      const expandedResource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
          format: 'expanded',
        }
      )) as ExpandedResource[];
      return expandedResource[0];
    }
    if (showMetadata) {
      return await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resourceId),
        {
          rev,
        }
      );
    }

    return await getResourceSource(
      nexus,
      orgLabel,
      projectLabel,
      resourceId,
      rev
    );
  };

  return (
    resource && (
      <ResourceEditor
        key={(resource as Resource)._self}
        busy={busy}
        rawData={resource}
        onSubmit={onSubmit}
        onFormatChange={handleFormatChange}
        onMetadataChange={handleMetaDataChange}
        editable={editable && !expanded && !showMetadata}
        expanded={expanded}
        showMetadata={showMetadata}
        showMetadataToggle={showMetadataToggle}
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        showFullScreen={showFullScreen}
        onFullScreen={handleFullScreen}
        showExpanded={showExpanded}
        showControlPanel={showControlPanel}
      />
    )
  );
};

export default ResourceEditorContainer;
