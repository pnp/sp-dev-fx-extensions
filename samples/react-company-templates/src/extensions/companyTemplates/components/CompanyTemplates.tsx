import * as React from "react";
import { DialogContent, DialogType } from "@fluentui/react";
import { SecurityManager } from "./SecurityManager";
import usePageNavigator from "../../../hooks/usePageNavigator";
import { StandardView } from "./views";
import { CommandBarMenu } from "./CommandBarMenu";
import { BaseComponentContext } from "@microsoft/sp-component-base";
import { TemplatesManagementContextProvider } from "../contexts/TemplatesManagementContextProvider";
import { SPFxContext } from "../contexts/SPFxContext";


type ICompanyTemplatesProps = {
  context: BaseComponentContext;
}

export const CompanyTemplates: React.FunctionComponent<ICompanyTemplatesProps> = (props: React.PropsWithChildren<ICompanyTemplatesProps>) => {
  const initalView = <StandardView />
  const pageNavigator = usePageNavigator(initalView);

  function navigationHandler(destination: React.ReactNode): void {
    pageNavigator.navigateTo(destination);
  }


  return <>
    <DialogContent type={DialogType.largeHeader} styles={{ content: { maxHeight: "80vh", height: "80vh", width: "80vw", overflowY: "scroll" } }} title={'Company Templates'}>
      <SPFxContext.Provider value={{ context: props.context }}>
        <TemplatesManagementContextProvider>
          <CommandBarMenu pageNavigationHandler={navigationHandler} />
          <SecurityManager>
            {pageNavigator.selectedPage}
          </SecurityManager>
        </TemplatesManagementContextProvider>
      </SPFxContext.Provider>
    </DialogContent>
  </>
}
