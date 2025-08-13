import { override } from '@microsoft/decorators';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface IAppCustomizerProps {}

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ICopilotAprilFoolsApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

const Banner = () => {
  const [countdown, setCountdown] = React.useState(5);
  const [message, setMessage] = React.useState(
    '⚠ Microsoft Copilot has detected unauthorized productivity gain. Disabling Office access in...'
  );

const invertColors = () => {
    document.body.style.filter = 'invert(1)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 5000);
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setMessage('😜 Kidding! Happy April Fools!');
          setTimeout(() => {
            const banner = document.getElementById('aprilFoolsBanner');
            if (banner) banner.remove();
          }, 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return React.createElement('div', {
    id: 'aprilFoolsBanner',
    style: {
      position: 'fixed',
      top: 0,
      width: '100%',
      background: 'linear-gradient(90deg, #ff9800, #f44336)',
      color: 'white',
      padding: '10px',
      fontSize: '18px',
      textAlign: 'center',
      zIndex: 9999
    }
  },[
    `${message} ${countdown > 0 ? countdown : ''}`,
    React.createElement('button', {
      style: {
        marginLeft: '10px',
        padding: '5px 10px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: '#ffffff',
        color: '#f44336'
      },
      onClick: invertColors
    }, 'Do not Click Me')
  ]
 
);
};

/** A Custom Action which can be run during execution of a Client Side Application */
export default class CopilotAprilFoolsApplicationCustomizer
  extends BaseApplicationCustomizer<ICopilotAprilFoolsApplicationCustomizerProperties> {

    @override
    public onInit(): Promise<void> {
      const bannerContainer = document.createElement('div');
      document.body.appendChild(bannerContainer);
      ReactDOM.render(React.createElement(Banner), bannerContainer);
      return Promise.resolve();
    }
}
