import * as React from 'react';
import { Button } from 'antd';

import NewWorkflowStepContainer from '../containers/NewWorkflowStepContainer';
import TemplatesContainer from '../containers/TemplatesContainer';
import ProjectMetaContaier from '../containers/ProjectMetaContainer';
import ActivitiesLinkingContainer from '../containers/ActivitiesLinkingContainer';

import './ProjectPanel.less';

const ProjectPanel: React.FC<{
  projectLabel: string;
  orgLabel: string;
  onUpdate(): void;
  workflowStepLabel?: string;
  workflowStepSelfUrl?: string;
  siblings?: {
    name: string;
    '@id': string;
  }[];
}> = ({
  projectLabel,
  orgLabel,
  onUpdate,
  workflowStepLabel,
  workflowStepSelfUrl,
  siblings,
}) => {
  const [showInfo, setShowInfo] = React.useState<boolean>(false);

  return (
    <div className="project-panel">
      <span className="project-panel__name">{projectLabel}</span>
      <div className="project-panel__actions">
        <NewWorkflowStepContainer
          projectLabel={projectLabel}
          orgLabel={orgLabel}
          onSuccess={onUpdate}
          parentStepLabel={workflowStepLabel}
          parentStepSelfUrl={workflowStepSelfUrl}
          siblings={siblings}
        />
        <TemplatesContainer />
        <Button onClick={() => setShowInfo(true)}>Project Info</Button>
        {showInfo && (
          <ProjectMetaContaier
            projectLabel={projectLabel}
            orgLabel={orgLabel}
            onClose={() => setShowInfo(false)}
          />
        )}
        <ActivitiesLinkingContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
        />
      </div>
    </div>
  );
};

export default ProjectPanel;
