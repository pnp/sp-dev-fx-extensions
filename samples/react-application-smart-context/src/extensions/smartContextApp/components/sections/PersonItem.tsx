import * as React from 'react';
import { Text, Link, Persona, PersonaSize } from '@fluentui/react';
import styles from '../SmartContextContent.module.scss';

export interface IPersonItemProps {
  person: {
    name: string;
    url: string;
    detail?: string;
  };
  index: number;
}

export const PersonItem: React.FC<IPersonItemProps> = ({ person, index }) => {
  const nameElement = person.url ? (
    <Link 
      href={person.url} 
      target="_blank" 
      rel="noopener noreferrer"
      data-interception="off"
      className={styles.personLink}
    >
      {person.name}
    </Link>
  ) : (
    <Text className={styles.personName}>{person.name}</Text>
  );

  return (
    <div 
      className={styles.personCard}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <Persona
        text={person.name}
        size={PersonaSize.size32}
        hidePersonaDetails={true}
        className={styles.personaIcon}
      />
      <div className={styles.personInfo}>
        {nameElement}
        {person.detail && <Text className={styles.personDetail}>{person.detail}</Text>}
      </div>
    </div>
  );
};
