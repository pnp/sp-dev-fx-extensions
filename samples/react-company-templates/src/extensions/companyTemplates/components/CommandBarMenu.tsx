import { CommandBar, ICommandBarItemProps } from "@fluentui/react";
import * as React from "react";
import { SettingsView } from "./views";
import { TemplatesManagementContext } from "../contexts/TemplatesManagementContext";
import { CopyTemplatesButton } from "./CopyTemplatesButton";
import { ProgressStatus } from "./ProgressStatus";
import { SPFxContext } from "../contexts/SPFxContext";
import { SPFx, spfi } from '@pnp/sp/presets/all';

type ICommandBarMenuProps = {
  pageNavigationHandler: (page: React.ReactNode) => void;
}

export const CommandBarMenu: React.FunctionComponent<ICommandBarMenuProps> = (props: React.PropsWithChildren<ICommandBarMenuProps>) => {
  const { selectedFiles, checkoutFiles, setTemplateValueFilter, copiedFiles, refreshTemplates } = React.useContext(TemplatesManagementContext);
  const { context } = React.useContext(SPFxContext);
  const { pageNavigationHandler } = props;
  const [userIsSiteAdmin, setUserIsSiteAdmin] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  function clearCommandBarValues(): void {
    checkoutFiles([]);
    setTemplateValueFilter(undefined);
  }

  // Fixed: Use regular function that returns void instead of async function
  function handleRefresh(): void {
    setIsRefreshing(true);
    if (refreshTemplates) {
      refreshTemplates()
        .then(() => {
          setIsRefreshing(false);
        })
        .catch((error) => {
          console.error("Error refreshing templates:", error);
          setIsRefreshing(false);
        });
    } else {
      setIsRefreshing(false);
    }
  }

  React.useEffect(() => {
    const sp = spfi().using(SPFx({ pageContext: context.pageContext }));
    sp.web.currentUser().then((user) => {
      const { IsSiteAdmin } = user;
      setUserIsSiteAdmin(IsSiteAdmin);
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: 'copy',
      ariaLabel: 'Copy',
      onRender: () => <div style={{ margin: 'auto' }}><CopyTemplatesButton selectedFiles={selectedFiles} /></div>,
    },
    {
      key: 'refresh',
      text: 'Refresh',
      ariaLabel: 'Refresh templates',
      iconProps: { 
        iconName: isRefreshing ? 'SyncStatus' : 'Refresh'
      },
      onClick: handleRefresh, // Now this matches the expected type
      disabled: isRefreshing
    }
  ];

  const commandBarFarItems: ICommandBarItemProps[] = [
    {
      key: 'progress',
      disabled: copiedFiles?.files?.length > 0 ? false : true,
      onRenderIcon: () => <ProgressStatus />,
    },
    userIsSiteAdmin &&
    {
      key: 'settings',
      text: 'Settings',
      ariaLabel: 'Settings',
      iconOnly: true,
      iconProps: { iconName: 'Settings' },
      onClick: () => { clearCommandBarValues(); pageNavigationHandler(<SettingsView onNavigationExit={pageNavigationHandler} />); },
    },
  ];

  return <CommandBar
    items={commandBarItems}
    farItems={commandBarFarItems}
    ariaLabel="Template actions"
    styles={{ root: { borderBottom: '1px solid #edebe9', borderTop: '1px solid #edebe9' } }}
  />
}