
import * as React from "react";
import styles from "./Toast.module.scss";
import * as strings from 'NotificationApplicationCustomizerStrings';
import { ISiteUserInfo } from "@pnp/sp/site-users";

export interface IToastProps {
  message: string;
  editor?: ISiteUserInfo;
}

interface IToastState {
  fading: boolean;
}

export class Toast extends React.Component<IToastProps, IToastState> {
  private fadeTimeout: any = null;

  constructor(props: IToastProps) {
    super(props);
    this.state = { fading: false };
  }

  componentDidMount(): void {
    this.fadeTimeout = setTimeout(() => {
      this.setState({ fading: true });
    }, 5000);
  }

  componentWillUnmount(): void {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
    }
  }

  public render(): React.ReactElement {
    const { message, editor } = this.props;
    const { fading } = this.state;

    if (!message || message.trim().length === 0) {
      return <div></div>;
    }

    return (
      <div
        className={
          fading
            ? `${styles.toastOverlay} ${styles.fadeOut}`
            : styles.toastOverlay
        }
      >
        <div>{strings.MessagePrefix}</div>
        <div>{strings.ItemTitle} <b>{message}</b></div>
        {editor && <div>{strings.EditedBy} <b>{editor.Title}</b></div>}
      </div>
    );
  }
}
