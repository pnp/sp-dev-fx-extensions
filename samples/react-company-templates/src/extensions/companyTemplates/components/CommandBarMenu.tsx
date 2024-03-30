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
  const { selectedFiles, checkoutFiles, setTemplateValueFilter, copiedFiles } = React.useContext(TemplatesManagementContext);
  const { context } = React.useContext(SPFxContext);
  const { pageNavigationHandler } = props;
  const [userIsSiteAdmin, setUserIsSiteAdmin] = React.useState<boolean>(false);

  function clearCommandBarValues(): void {
    checkoutFiles([]);
    setTemplateValueFilter(undefined);
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