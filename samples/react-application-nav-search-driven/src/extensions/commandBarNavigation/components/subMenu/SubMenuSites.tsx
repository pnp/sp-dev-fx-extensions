import * as React from "react";
import { Icon } from '@fluentui/react/lib/Icon';
import { TextField } from '@fluentui/react/lib/TextField';
import styles from './SubMenuSites.module.scss';
import { SiteIcon } from "../siteIcon/SiteIcon";
import { IMenuItem } from "../../../../models/IMenuItem";
import { ISubMenuSitesProps } from "./ISubMenuSitesProps";

export const SubMenuSites: React.FC<ISubMenuSitesProps> = (props) => {
  const [searchInputText, setSearchInputText] = React.useState<string>('');
  const [menuItems, setMenuItems] = React.useState<IMenuItem[]>([]);
  const [emptySearchResult, setEmptySearchResult] = React.useState<boolean>(false);
  const [itemElements, setItemElements] = React.useState<JSX.Element[]>();
  const specialSearchChars: string[] = ["<",">","#",":","="];
  
  /**
   * This functions clears the search text and potential available search result
   * @param event 
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const clearSearch = (event: React.MouseEvent) => {
    setSearchInputText('');
    setEmptySearchResult(false);
    setMenuItems([]);
  }

  /**
   * This functions searches within the sites for a given text
   * @param event 
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const searchSites = (event: React.KeyboardEvent) => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      props.searchCallback(searchInputText)
        .then((response: IMenuItem[]) => {
          if (response.length === 0) {
            setEmptySearchResult(true);
          }
           setMenuItems(response);           
        });
    }
  }

  /**
   * This functions iterates all declared special characters in case of search
   * For each char it checks all occurences inside the search term and removes them
   * @param newValue: string The search term to bec checked and adjusted
   */
  const handleSearchTextChange = React.useCallback((event, newValue: string) => {
    specialSearchChars.forEach((char) => {
      // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
      const regPatt:RegExp = new RegExp(char,'gi');
      while (regPatt.exec(newValue)){
        newValue = newValue.substring(0, regPatt.lastIndex - 1) + newValue.substring(regPatt.lastIndex , newValue.length);
      }
      setSearchInputText(newValue);
    });
  }, []);

  React.useEffect((): void => {
    let listElements: JSX.Element[] = [];
    const useItems: IMenuItem[] = menuItems.length > 0 || emptySearchResult ? menuItems : props.dataItems;
    listElements = useItems.map((item) => {
      return (<li className={styles.menuListItem}>
                <SiteIcon
                  siteTitle={item.displayName}
                  iconAcronym={item.iconAcronym?item.iconAcronym:''}
                  iconColor={item.iconColor?item.iconColor:''}
                  iconUrl={item.iconUrl?item.iconUrl:''} />
                <a className="ms-fontColor-neutralPrimary ms-fontColor-themePrimary--hover" onClick={() => window.open(item.url , '_self')} >{item.displayName}</a>
              </li>);
    });
    setItemElements(listElements);    
  }, [props.dataItems, menuItems]);

  return (
    <div className={styles.subMenu}>
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-sm11 ms-md7 ms-lg7 ms-xl7 ms-xxl7 ms-xxxl7">
          {props.label !== 'My Teams' &&
          <TextField
            inputClassName="ms-bgColor-themeLighter ms-fontColor-themePrimary"
            borderless
            placeholder={`Search ${props.label}`}            
            iconProps={ { iconName: 'Search' } }
            value={searchInputText}
            onChange={handleSearchTextChange}
            onKeyDown={searchSites}
            onRenderSuffix={ searchInputText.length > 0 ? () => { return <Icon iconName="StatusErrorFull" className={styles.searchClearIcn} onClick={clearSearch} /> } : undefined}          
          />}
        </div>
      </div>        
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ms-xl6 ms-xxl6 ms-xxxl6">
          <div className={styles.menuHeader}>
            <span className="ms-font-xl ms-fontColor-themePrimary">{props.label}</span>
          </div>            
          <ul className={styles.menuList}>{itemElements}</ul>
        </div>          
      </div>
    </div>
  );
}