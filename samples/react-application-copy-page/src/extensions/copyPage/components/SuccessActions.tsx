import * as React from 'react';
import {
  Stack,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  DefaultButton,
  Text,
  Icon,
  Link
} from '@fluentui/react';

/* eslint-disable @rushstack/no-new-null */
interface Props {
  message: { type: MessageBarType; text: string } | null;
  onReset: () => void;
  targetSite?: { title: string; url: string };
  isTemplate?: boolean;
}
/* eslint-enable @rushstack/no-new-null */

const SuccessActions: React.FC<Props> = ({ message, onReset,  targetSite, isTemplate }) => (
  <Stack tokens={{ childrenGap: 16 }}>
    {targetSite && (
      <Stack
        horizontal
        verticalAlign="center"
        tokens={{ childrenGap: 12 }}
        styles={{
          root: {
            background: '#f3f2f1',
            padding: 12,
            borderRadius: 4,
            marginTop: 8,
          }
        }}
      >
        <Icon iconName="CheckMark" styles={{ root: { fontSize: 20, color: '#0078d4' } }} />
        <Stack>
          {isTemplate
            ? <>Template was saved in: </>
            : <>Page was copied to: </>
          }
          <Link
            href={String(targetSite.url)}
            target="_blank"
            styles={{ root: { fontSize: 14, fontWeight: 600 } }}
          >
            {targetSite.title}
          </Link>
          <Text variant="tiny" styles={{ root: { color: '#605E5C' } }}>
            {targetSite.url}
          </Text>
        </Stack>
      </Stack>

    )}

    {message && (
      <MessageBar messageBarType={message.type} isMultiline={false}>
        {message.text}
      </MessageBar>
    )}

    <Stack horizontal tokens={{ childrenGap: 10 }}>
      <PrimaryButton text="Make Another Copy" onClick={onReset} />
      {targetSite && (
        <DefaultButton
          text="Go to the target site"
          onClick={() => window.open(`${targetSite.url}/SitePages`, '_blank', 'noopener,noreferrer')}
        />
      )}
    </Stack>
  </Stack>
);

export default SuccessActions;
