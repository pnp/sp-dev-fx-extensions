import * as React from "react";
import { PrimaryButton } from "@fluentui/react";
import { useId } from '@fluentui/react-hooks';
import { SPFxContext } from "../contexts/SPFxContext";
import { TemplateService } from "../../../services/core/TemplateService";
import { TemplatesManagementContext } from "../contexts/TemplatesManagementContext";
import * as strings from "CompanyTemplatesCommandSetStrings";

type CopyTemplatesButtonProps = {
  selectedFiles: any[];
}

export const CopyTemplatesButton: React.FunctionComponent<CopyTemplatesButtonProps> = (props: React.PropsWithChildren<CopyTemplatesButtonProps>) => {
  const { selectedFiles } = props;
  const { context } = React.useContext(SPFxContext);
  const { setCopiedFiles, startCopyProcess } = React.useContext(TemplatesManagementContext);
  const buttonId = useId('template-copy-button');
  const service = context.serviceScope.consume(TemplateService.serviceKey);

  async function copyTemplates(): Promise<void> {
    startCopyProcess();
    const queryParameters = new URLSearchParams(window.location.search);
    const currentFolderPath = queryParameters.get('id') || queryParameters.get('Id') || queryParameters.get('RootFolder') || '';
    const library = context.pageContext.list.serverRelativeUrl;
    const targetFolderUrl = `${library}${currentFolderPath.replace(library, '')}`;
    try {
      const newFiles = await service.copyTemplates(targetFolderUrl, selectedFiles);
      setCopiedFiles(newFiles, `${newFiles.length} ${newFiles.length > 1 ? strings.Common.Template : strings.Common.Templates} ${strings.CopyTemplatesButton.CopiedSuccessfullyMessage}`);
    } catch (error) {
      setCopiedFiles([], error);
      console.log(error);
    }
  }

  const buttonText = selectedFiles.length > 0
    ? (strings.CopyTemplatesButton.CopyTemplatesButtonText).replace('{0}', `${selectedFiles.length}`)
    : strings.CopyTemplatesButton.CopyTemplatesButtonText.replace('{0} ', '');
  return <>
    <PrimaryButton id={buttonId} disabled={selectedFiles.length === 0} text={buttonText}
      onClick={copyTemplates} iconProps={{ iconName: 'Installation' }} allowDisabledFocus />
  </>
}