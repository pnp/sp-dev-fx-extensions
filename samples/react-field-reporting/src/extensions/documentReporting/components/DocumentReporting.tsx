import { Log } from '@microsoft/sp-core-library';
import * as React from 'react';
import { Link } from '@fluentui/react';
import styles from './DocumentReporting.module.scss';
//import SPService from '../../../services/SPService';
import AppInsightService from '../../../services/AppInsightService';

export interface IDocumentReportingProps {
  isFile: boolean;
  userName: string;
  userEmail: string;
  listUrl: string;
  docId: string;
  docName: string;
  docURL: string;
}

const LOG_SOURCE: string = 'DocumentReporting';

const DocumentReporting: React.FC<IDocumentReportingProps> = (props) => {
  React.useEffect(() => {
    Log.info(LOG_SOURCE, 'React Element: DocumentReporting mounted');
    return () => {
      Log.info(LOG_SOURCE, 'React Element: DocumentReporting unmounted');
    };
  }, []);

  const handleLinkClick = async (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLElement>): Promise<void> => {
    console.log(`Link clicked: ${props.docName}`);
    event.preventDefault();
    const docUniqueId = generateDocumentId(props);
    const data = { ...props, lastAccessDate: new Date().toLocaleString(), docUniqueId: docUniqueId };

    if (data.isFile) {
      //Convert data to SharePoint list item
      const payload = {
        Title: data.docUniqueId,
        DocId: data.docId,
        DocName: data.docName,
        DocURL: props.docURL,
        UserName: props.userName,
        UserEmail: props.userEmail,
        ListURL: props.listUrl,
        LastAccessed: new Date().toISOString()
      };


      try {
        //Log data to application insights
        AppInsightService.trackEvent("Document Accessed", payload);
        //log success event
        console.log("Document Accessed", payload);
      }
      catch (error) {
        console.error("Error tracking event", error);
      }

      
      // //Log data to SharePoint list [Document Monitoring]
      // const listItem = await SPService.addListItemAsync("Document Monitoring", payload);
      // console.log(listItem);
    }


    open(props.docURL, props.isFile ? '_blank' : '_self');
  };

  return (
    <div className={styles.documentReporting}>
      <Link className={styles.linkStyle} onClick={handleLinkClick}>{props.docName}</Link>
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function generateDocumentId(metadata: any): string {
    const { userName, docId } = metadata;

    // Parse the LastAccessed date for easier manipulation
    const accessedDate = new Date();

    // Format the date in YYYYMMDD format
    const formattedDate = accessedDate.toISOString().slice(0, 10).replace(/-/g, "");

    // Combine username, docId, and formatted date
    const id = `${userName.replace(/\s/g, "")}-${formattedDate}-${docId}`;

    return id;
  }

};



export default DocumentReporting