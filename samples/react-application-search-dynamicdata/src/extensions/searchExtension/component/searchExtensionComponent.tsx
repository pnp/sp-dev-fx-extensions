import * as React from "react";
import ApplicationCustomizerContext from "@microsoft/sp-application-base/lib/extensibility/ApplicationCustomizerContext";
import { TextField } from "office-ui-fabric-react/lib/TextField";
import { IQuery } from "../../../data/IQuery";

export interface ISearchExtensionProps {
  context:any;
  onchange: (text: IQuery)=> void ;
}
export default class SearchExtension extends React.Component<ISearchExtensionProps, {}> {
  constructor (props:ISearchExtensionProps) {
    super(props);
this._onChanged.bind(this);
  }

  public render():any {
    return (
      <div  >
        <div className="ms-bgColor-themePrimary">
        <TextField label="Search with SPFX Dynamic Data:" onChanged={this._onChanged} />
        </div>
      </div >
    );
  }
  private _onChanged = (text: any): void => {
    console.log(text);
    this.props.onchange({text:text});
  }

}
