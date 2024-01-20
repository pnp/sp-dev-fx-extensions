import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters,
} from "@microsoft/sp-listview-extensibility";
import { SPFI, spfi, SPFx } from "@pnp/sp";

import {
  IReactFieldVotesProps,
  ReactFieldVotes,
} from "./components/ReactFieldVotes";
import { Constants } from "./utils/Constants";
import { SharePointService } from "./utils/SharePointService";

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IReactFieldVotesFieldCustomizerProperties {}

export default class ReactFieldVotesFieldCustomizer extends BaseFieldCustomizer<IReactFieldVotesFieldCustomizerProperties> {
  private _sp: SPFI;

  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    this._sp = spfi().using(SPFx(this.context));
    return Promise.resolve();
  }

  public async onRenderCell(event: IFieldCustomizerCellEventParameters): Promise<void> {
    const voters = this.processValue(
      event.listItem.getValueByName(Constants.INTERNAL_COLUMN_NAME)
    );
    const sharePointService = new SharePointService(
      this._sp,
      this.context.pageContext.list.title,
      event.listItem.getValueByName("ID")
    );
    const currentUserId = await sharePointService.getCurrentUserId();
    const componentProperties: IReactFieldVotesProps = {
      sharePointService: sharePointService,
      totalVoters: voters.length,
      isVoted: voters.indexOf(currentUserId) !== -1,
    };
    const reactFieldVotes: React.ReactElement<IReactFieldVotesProps> =
      React.createElement(ReactFieldVotes, componentProperties);

    ReactDOM.render(reactFieldVotes, event.domElement);
  }

  protected processValue(value: { id: string }[]): number[] {
    if (!value) return [];
    return value.map((voter) => Number(voter.id));
  }

  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    ReactDOM.unmountComponentAtNode(event.domElement);
    super.onDisposeCell(event);
  }
}
