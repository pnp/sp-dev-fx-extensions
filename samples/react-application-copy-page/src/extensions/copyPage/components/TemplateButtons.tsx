import * as React from 'react';
import { DefaultButton, Stack } from '@fluentui/react';

interface Props {
  copyPage: (isTemplate: boolean, isGlobal: boolean) => void;
  disabled?: boolean;
}

const TemplateButtons: React.FC<Props> = ({ copyPage, disabled }) => (
  <Stack tokens={{ childrenGap: 10 }} styles={{ root: { width: '100%' } }}>
    <Stack horizontal tokens={{ childrenGap: 10 }} styles={{ root: { width: '100%' } }}>
      <DefaultButton
        text="Save as Local Template"
        onClick={() => copyPage(true, false)}
        disabled={disabled}
        styles={{ root: { flex: 1 } }}
        iconProps={{ iconName: 'Save' }} // Icon for local template button
      />
    </Stack>

  </Stack>
);

export default TemplateButtons;