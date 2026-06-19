import * as React from 'react';
import { GridRegular } from '@fluentui/react-icons';
import { IListViewItem } from '../models/IListViewItem';
import SiteContentPanel from './SiteContentPanel';
import { SPService } from '../services/SPService';
import { generateListViewItems } from '../services/HelperService';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

interface ISiteContentRibbonProps {
  context: ApplicationCustomizerContext;
}

const SiteContentRibbon = (props: ISiteContentRibbonProps): JSX.Element => {
  const [items, setItems] = React.useState<IListViewItem[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadItems = async (): Promise<void> => {
      try {
        const spService = new SPService(props.context);
        const appTiles = await spService.getAppTiles();
        if (isMounted) {
          setItems(generateListViewItems(appTiles));
        }
      } catch (error) {
        console.error('Failed to load site content app tiles:', error);
      }
    };

    loadItems().catch((error) => {
      console.error('Unhandled error in loadItems promise:', error);
    });

    return () => {
      isMounted = false;
    };
  }, [props.context]);

  return (
    <>
      <button
        title="Site content"
        onClick={() => setIsOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 4,
          padding: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
      >
        <GridRegular style={{ fontSize: 20 }} />
      </button>
      {isOpen && <SiteContentPanel items={items} context={props.context} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default SiteContentRibbon;
