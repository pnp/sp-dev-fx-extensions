import * as React from 'react';
import { Link, Menu, MenuItem, MenuList, MenuPopover, MenuProps, MenuTrigger } from '@fluentui/react-components';
import { OpenRegular, SettingsRegular, InfoRegular } from '@fluentui/react-icons';
import { CustomMenuTrigger } from './CustomMenuTrigger';
import { IListViewItem } from '../models/IListViewItem';
import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';

interface IListItemMenuProps {
  item: IListViewItem;
  context: ApplicationCustomizerContext;
  onDriveInfoClick: () => void;
}

export const ListItemMenu = (props: IListItemMenuProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const onOpenChange: MenuProps['onOpenChange'] = (e, data) => {
    setOpen(data.open);
  };

  const handleDriveIdClick = (): void => {
    setOpen(false);
    props.onDriveInfoClick();
  };

  return (
    <>
      {(props.item.Target || props.item.BaseTemplate > 0) && (
        <Menu open={open} onOpenChange={onOpenChange}>
          <MenuTrigger disableButtonEnhancement>
            <CustomMenuTrigger />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {props.item.Target && (
                <MenuItem icon={<OpenRegular />}>
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    data-interception="off"
                    href={props.item.Target}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    Open in new tab
                  </Link>
                </MenuItem>
              )}
              {props.item.BaseTemplate > 0 && (
                <>
                  <MenuItem icon={<SettingsRegular />}>
                    <Link
                      target="_blank"
                      data-interception="off"
                      href={`${props.context.pageContext.web.absoluteUrl}/_layouts/15/listedit.aspx?List=${props.item.AppId}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      Settings
                    </Link>
                  </MenuItem>
                  {props.item.Type !== 'List' && <MenuItem icon={<InfoRegular />} onClick={handleDriveIdClick}>Details</MenuItem>}
                </>
              )}
            </MenuList>
          </MenuPopover>
        </Menu>
      )}
    </>
  );
};
