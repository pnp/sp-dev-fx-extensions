/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @microsoft/spfx/pair-react-dom-render-unmount */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { override } from "@microsoft/decorators";
import {
  BaseApplicationCustomizer,
  PlaceholderContent,
  PlaceholderName
} from '@microsoft/sp-application-base';

import Chat from "../Components/Chat/Chat";
import * as React from "react";
import * as ReactDOM from "react-dom";

import { graphfi, SPFx } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/photos";

import * as strings from 'TeamsChatEmbeddedApplicationCustomizerStrings';

import { app } from "@microsoft/teams-js";

export interface ITeamsChatEmbeddedApplicationCustomizerProperties {}


/** A Custom Action which can be run during execution of a Client Side Application */
export default class TeamsChatEmbeddedApplicationCustomizer
  extends BaseApplicationCustomizer<ITeamsChatEmbeddedApplicationCustomizerProperties> {
    private _bottomPlaceholder: PlaceholderContent | undefined;

    @override
    public async onInit(): Promise<void> { 
      
      try {
        await app.initialize();
        const context = await app.getContext();
        if(context){
          return;
        }
      } catch (exp) {
        this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Bottom);

        const graph = graphfi().using(SPFx(this.context));
        const photoValue = await graph.me.photo.getBlob();      
        const url = window.URL || window.webkitURL;
        const blobUrl = url.createObjectURL(photoValue);
  
        const chat = React.createElement(Chat, { label: strings.Label, userPhoto: blobUrl });
        ReactDOM.render(chat, this._bottomPlaceholder.domElement);  
      }   

      return Promise.resolve();
    }
  }



