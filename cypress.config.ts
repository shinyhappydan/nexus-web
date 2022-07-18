import { createNexusClient, ResourcePayload } from '@bbp/nexus-sdk';
import { defineConfig } from 'cypress';
import {
  createNexusOrgAndProject,
  createResource,
  deprecateNexusOrgAndProject,
} from './cypress/plugins/nexus';
import { uuidv4 } from './src/shared/utils';
const fetch = require('node-fetch');

export default defineConfig({
  viewportWidth: 1200,
  video: false,
  e2e: {
    experimentalSessionAndOrigin: true,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      on('task', {
        'project:setup': async function({
          nexusApiUrl,
          authToken,
          orgLabel,
          projectLabelBase,
        }: {
          nexusApiUrl: string;
          authToken: string;
          orgLabel: string;
          projectLabelBase: string;
        }) {
          const orgDescription =
            'An organization used for Cypress automated tests';
          const projectLabel = `${projectLabelBase}-${uuidv4()}`;
          const projectDescription =
            'An project used for Cypress automated tests';

          try {
            const nexus = createNexusClient({
              uri: nexusApiUrl,
              fetch,
              token: authToken,
            });
            await createNexusOrgAndProject({
              nexus,
              orgLabel,
              orgDescription,
              projectLabel,
              projectDescription,
            });
          } catch (e) {
            console.log('Error encountered in project:setup task.', e);
          }
          return { projectLabel };
        },
        'project:teardown': async ({
          nexusApiUrl,
          authToken,
          orgLabel,
          projectLabel,
        }: {
          nexusApiUrl: string;
          authToken: string;
          orgLabel: string;
          projectLabel: string;
        }) => {
          try {
            const nexus = createNexusClient({
              uri: nexusApiUrl,
              fetch,
              token: authToken,
            });

            deprecateNexusOrgAndProject({
              nexus,
              orgLabel,
              projectLabel,
            });
          } catch (e) {
            console.log('Error encountered in project:teardown task.', e);
          }

          return null;
        },
        'resource:create': async ({
          nexusApiUrl,
          authToken,
          resourcePayload,
          orgLabel,
          projectLabel,
        }: {
          nexusApiUrl: string;
          authToken: string;
          resourcePayload: ResourcePayload;
          orgLabel: string;
          projectLabel: string;
        }) => {
          try {
            const nexus = createNexusClient({
              uri: nexusApiUrl,
              fetch,
              token: authToken,
            });

            return await createResource({
              nexus,
              orgLabel,
              projectLabel,
              resource: resourcePayload,
            });
          } catch (e) {
            console.log(
              'Error encountered in analysisResource:create task.',
              e
            );
          }
          return null;
        },
      });
    },
  },
});
