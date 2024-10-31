import React from 'react';

import { Typography } from '../Typography';
import { MaskableText } from './MaskableText';

import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { ManagerPreferences } from 'src/types/ManagerPreferences';

const mockPreferences: ManagerPreferences = {
  maskSensitiveData: true,
};

const meta: Meta<typeof MaskableText> = {
  component: MaskableText,
  title: 'Components/MaskableText',
};

type Story = StoryObj<typeof MaskableText>;

// We want to mock the user preference to TRUE to be able to mask the original data and see the visibility icon toggle.
const worker = setupWorker(
  http.get('*/v4/profile/preferences', () => {
    return HttpResponse.json(mockPreferences);
  })
);

export const Default: Story = {
  // This does not work:
  // parameters: {
  //   msw: {
  //     handlers: [
  //         http.get('*/v4/profile/preferences', () => {
  //           return HttpResponse.json(mockPreferences);
  //         })
  //     ],
  //   },
  // },
  args: {
    children: <Typography>Hide me</Typography>,
    isToggleable: true,
    text: 'Hide me',
  },
  decorators: [
    (Story, args) => {
      // This was an attempt via this post: https://blog.logrocket.com/using-storybook-and-mock-service-worker-for-mocked-api-responses/
      worker.use(
        http.get('*/v4/profile/preferences', () => {
          return HttpResponse.json(mockPreferences);
        })
      );
      // worker.start() didn't work here either.
      return <Story {...args} />;
    },
  ],
  render: (args) => {
    // This did not work either.
    // React.useEffect(() => {
    // worker.start();
    //   return () => worker.stop();
    // }, []);
    return <MaskableText {...args} />;
  },
};

export default meta;
