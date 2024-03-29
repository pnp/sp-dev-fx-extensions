import * as React from "react";
import { DefaultButton, FocusTrapCallout, FocusZone, Icon, PrimaryButton, Spinner, SpinnerSize, Stack, Text } from "@fluentui/react";
import { TemplatesManagementContext } from "../contexts/TemplatesManagementContext";
import { getThemeColor } from "../themeHelper";
import * as strings from "CompanyTemplatesCommandSetStrings";


type ProgressStatusProps = {
}

export const ProgressStatus: React.FunctionComponent<ProgressStatusProps> = (props: React.PropsWithChildren<ProgressStatusProps>) => {
  const { copiedFiles, setCopiedFiles, isCopyingFiles } = React.useContext(TemplatesManagementContext);
  const fillColor = getThemeColor("themeDarkAlt");

  function resetCopyProcess(): void {
    setCopiedFiles(undefined, '');
  }

  return <>
    {isCopyingFiles &&
      <Spinner size={SpinnerSize.small} label="Copying" labelPosition="left" />
    }
    {(copiedFiles && copiedFiles.files) &&
      <>
        {copiedFiles.success && <Icon id="progress-status" iconName="CheckMark" styles={{ root: { color: fillColor } }} />}
        {!copiedFiles.success && <Icon id="progress-status" iconName="Cancel" />}
        <FocusTrapCallout
          styles={{
            root: {
              width: 320,
              padding: '20px 24px',
            }
          }}
          role="alertdialog"
          gapSpace={0}
          target={`#progress-status`}
          onDismiss={resetCopyProcess}
          setInitialFocus
          beakWidth={0} // add this as a workaround because of isBeakVisible is not working properly
        >
          <Text block variant="large" styles={{ root: { marginBottom: '1rem' } }}>Copy templates</Text>
          <Text block styles={{ root: { marginBottom: '0.5rem' } }}>{copiedFiles.success ? <Icon iconName="Completed" /> : <Icon iconName="ErrorBadge" />} {copiedFiles.message}</Text>
          <FocusZone isCircularNavigation>
            <Stack horizontal>
              {copiedFiles.success && <PrimaryButton onClick={resetCopyProcess}>{strings.Common.OKButtonText}</PrimaryButton>}
              {!copiedFiles.success && <DefaultButton onClick={resetCopyProcess}>{strings.Common.CancelButtonText}</DefaultButton>}
            </Stack>
          </FocusZone>
        </FocusTrapCallout>
      </>
    }
  </>
}