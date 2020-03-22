import { Icon, Link } from 'office-ui-fabric-react';
import styles from './Attachment.module.scss';
import * as React from 'react';
import { getTheme } from 'office-ui-fabric-react/lib/Styling';
import { FileTypeIcon, ApplicationType, IconType, ImageSize } from '@pnp/spfx-controls-react/lib/FileTypeIcon';
import { IAttachment } from '../../entities/IChatMessage';
import * as AdaptiveCards from 'adaptivecards';
//import AdaptiveCard from 'adaptivecards-reactnative'

const theme = getTheme();
const { palette, fonts } = theme;

export const AdaptiveCardAttachment = (props: { attachment: IAttachment }) => {
  let adaptiveCard = new AdaptiveCards.AdaptiveCard();

  let { contentType, content } = props.attachment;
  let _payload = {};
  let _render:JSX.Element = <div style={{marginTop: 5}}>Please click to see message</div>;

  if (contentType === 'application/vnd.microsoft.card.adaptive') {
    _payload = JSON.parse(content);
    try {
      adaptiveCard.parse(_payload);
      const result = adaptiveCard.render();
       _render = (
        <div
          style={{
            width: '100%',
            borderWidth: 1,
            outline: 'none',
            borderStyle: 'solid',
            borderColor: palette.neutralQuaternary
          }}
          ref={n => {
            n && n.appendChild(result);
          }}
        />
      );
    } catch (err) {
      console.error(err);
      _render = <div style={{ color: 'red' }}>{err.message}</div>;
    }
    _payload = JSON.parse(content);
  }


// render Attachment

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10
      }}>
      <>{_render}</>
    </div>
  );
};
