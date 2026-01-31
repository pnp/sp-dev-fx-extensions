import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseDialog, IDialogConfiguration } from "@microsoft/sp-dialog";
import {
  DefaultButton,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  DialogContent,
  DialogFooter,
} from "@fluentui/react";
import { FlowConfig } from "../../../constants";
import { FlowService, IFlowResponse } from "../../../services";
import { IFlowRequestBody } from "../../../models";

export interface IFlowTriggerDialogProps {
  requestBody: IFlowRequestBody;
  onClose: () => void;
}

type DialogState = "idle" | "loading" | "success" | "error";

const FlowTriggerDialogContent: React.FC<IFlowTriggerDialogProps> = ({
  requestBody,
  onClose,
}) => {
  const [state, setState] = React.useState<DialogState>("idle");
  const [message, setMessage] = React.useState<string>("");

  const handleTriggerFlow = async (): Promise<void> => {
    setState("loading");
    setMessage("");

    const response: IFlowResponse = await FlowService.triggerFlow(requestBody);

    if (response.success) {
      setState("success");
      setMessage(response.message);
    } else {
      setState("error");
      setMessage(response.message);
    }
  };

  return (
    <DialogContent
      title={FlowConfig.dialogTitle}
      onDismiss={onClose}
      showCloseButton={state !== "loading"}
    >
      <div style={{ minHeight: 100, padding: "10px 0" }}>
        {state === "idle" && (
          <p>{FlowConfig.dialogDescription}</p>
        )}

        {state === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <Spinner size={SpinnerSize.large} label="Triggering flow..." />
          </div>
        )}

        {state === "success" && (
          <MessageBar messageBarType={MessageBarType.success}>
            {message}
          </MessageBar>
        )}

        {state === "error" && (
          <MessageBar messageBarType={MessageBarType.error}>
            {message}
          </MessageBar>
        )}
      </div>

      <DialogFooter>
        {state === "idle" && (
          <>
            <PrimaryButton onClick={handleTriggerFlow} text={FlowConfig.triggerButtonText} />
            <DefaultButton onClick={onClose} text={FlowConfig.cancelButtonText} />
          </>
        )}

        {state === "loading" && (
          <DefaultButton disabled text="Please wait..." />
        )}

        {(state === "success" || state === "error") && (
          <DefaultButton onClick={onClose} text="Close" />
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export class FlowTriggerDialog extends BaseDialog {
  private requestBody: IFlowRequestBody;

  constructor(requestBody: IFlowRequestBody) {
    super();
    this.requestBody = requestBody;
  }

  public render(): void {
    ReactDOM.render(
      <FlowTriggerDialogContent
        requestBody={this.requestBody}
        onClose={() => this.close()}
      />,
      this.domElement
    );
  }

  public getConfig(): IDialogConfiguration {
    return {
      isBlocking: true,
    };
  }

  protected onAfterClose(): void {
    super.onAfterClose();
    ReactDOM.unmountComponentAtNode(this.domElement);
  }
}
