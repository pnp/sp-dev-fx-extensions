import * as React from 'react';
import { Text } from '@fluentui/react/lib/Text';

import type { AccessLensContext } from '../../models/access-lens-context';
import strings from 'AccessLensCommandSetStrings';
import styles from './CurrentContextCard.module.scss';

export interface ICurrentContextCardProps {
  context: AccessLensContext;
}

export const CurrentContextCard: React.FC<ICurrentContextCardProps> = ({ context }) => {
  const { web, library, currentUser } = context;

  return (
    <div>
      <Text variant="mediumPlus" block style={{ marginBottom: 8, fontWeight: 600 }}>
        {strings.CurrentContextSectionTitle}
      </Text>
      <div className={styles.contextCard}>
        <table role="presentation">
          <tbody>
            <tr><th scope="row">{strings.ContextSiteWebLabel}</th><td>{web.title}</td></tr>
            <tr><th scope="row">{strings.ContextWebUrlLabel}</th><td>{web.absoluteUrl}</td></tr>
            <tr><th scope="row">{strings.ContextWebServerRelativeUrlLabel}</th><td>{web.serverRelativeUrl}</td></tr>
            <tr><th scope="row">{strings.ContextLibraryLabel}</th><td>{library.title}</td></tr>
            <tr><th scope="row">{strings.ContextLibraryPathLabel}</th><td>{library.serverRelativeUrl}</td></tr>
            <tr><th scope="row">{strings.ContextLibraryIdLabel}</th><td>{library.id}</td></tr>
            {library.baseTemplate !== undefined && (
              <tr><th scope="row">{strings.ContextBaseTemplateLabel}</th><td>{library.baseTemplate}</td></tr>
            )}
            {library.baseType !== undefined && (
              <tr><th scope="row">{strings.ContextBaseTypeLabel}</th><td>{library.baseType}</td></tr>
            )}
            {currentUser?.displayName && (
              <tr><th scope="row">{strings.ContextCurrentUserLabel}</th><td>{currentUser.displayName}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
