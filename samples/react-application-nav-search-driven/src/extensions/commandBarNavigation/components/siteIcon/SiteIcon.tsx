import * as React from "react";
import { PersonaInitialsColor } from '@fluentui/react/lib/Persona';
import styles from './SiteIcon.module.scss';
import { ISiteIconProps } from './ISiteIconProps';

export const SiteIcon: React.FC<ISiteIconProps> = (props) => {
  let iconColor: string = '';
  let iconAcronym: string = '';

  /**
   * This function generates an acronym for a site title by
   * either picking the first char of the first two parts (split by blank)
   * or the first 2 chars of the title
   * @returns string: The 2-characters acronym
   */
  const generateSiteAcronym = (): string => {
    let acronym: string = '';
    const siteTitleWords: string[] = props.siteTitle.split(' ');
    if (siteTitleWords.length > 1) {
      acronym = siteTitleWords[0].substring(0, 1) + siteTitleWords[1].substring(0, 1);
    }
    else {
      acronym = siteTitleWords[0].substring(0, 2);
    }

    return acronym;
  }

  const generateRandomColor = (): string => {
    let color: string = '';
    const colorCode = Math.floor((Math.random() * 15)); // PersonaInitialsColor 0-14
    color = PersonaInitialsColor[colorCode];
    return color;
  }

  if ((props.iconUrl === null || props.iconUrl === '') && 
        (props.iconAcronym === null || props.iconAcronym === '') &&
        (props.iconColor === null || props.iconColor === '')) {
    iconColor = generateRandomColor();
    iconAcronym = generateSiteAcronym();
  }
  else {
    iconColor = props.iconColor;
    iconAcronym = props.iconAcronym;
  }

  let iconElement = null;
    if (props.iconUrl !== null && props.iconUrl !== '') {
      iconElement = React.createElement('div', {
          className: styles.siteIcon
        },
        React.createElement('img', {
          src: props.iconUrl,
          height: 28,
          width: 28
        })
      );
    }
    else {
      if (iconAcronym !== null && iconAcronym !== '') {
        iconElement = React.createElement('div', {
            className: styles.siteIcon
          },
          React.createElement('div', {
            className: styles.siteIconInner,
            style: { backgroundColor: iconColor }          
          },
          iconAcronym)
        );        
      }
      else {
        iconElement = React.createElement('div', {
            className: styles.siteIcon
          },
          React.createElement('div', {
            className: styles.siteIconInner,
            style: { backgroundColor: 'transparent' }          
          })
        ); 
      }
    }
    return iconElement;
}