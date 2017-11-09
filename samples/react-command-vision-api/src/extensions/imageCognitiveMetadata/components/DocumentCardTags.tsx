import * as React from 'react';
import styles from './DocumentCardTags.module.scss';
import { IDocumentCardTagsProps } from './IDocumentCardTagsProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class DocumentCardDescription extends React.Component<IDocumentCardTagsProps, {}> {
  public render(): React.ReactElement<IDocumentCardTagsProps> {  

    const tags = this.props.tags.map(item => {
        return (<span className={styles.tag}>{item}</span>);
    });

    return (        
      <div className={styles.documentCardTags}>
       {tags}
      </div>
    );
  }
}