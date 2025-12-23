import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';
import { Log } from '@microsoft/sp-core-library';
import * as strings from 'QuickAppointmentRegisterApplicationCustomizerStrings';
import { IEvent } from '../../models/IEvent';
import { SPUser } from '@microsoft/sp-page-context';
import { SPHttpClient, ISPHttpClientOptions, SPHttpClientResponse } from '@microsoft/sp-http';

const LOG_SOURCE: string = 'dev-sky-QuickAppointmentRegister';

export interface IQuickAppointmentRegisterApplicationCustomizerProperties {
}

export default class QuickAppointmentRegisterApplicationCustomizer
  extends BaseApplicationCustomizer<IQuickAppointmentRegisterApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, "Fast appointment register extension loaded.");
    this.specialClientSideExtensions();
    return Promise.resolve();
  }

  private specialClientSideExtensions(): void {
    this.context.application.navigatedEvent.add(this, () => {
      setTimeout(() => {
        void this.extendEventPage(); // eslint-disable-line
      }, 800);
    });
  }
  private async extendEventPage(): Promise<void> {
    if (location.href.toLowerCase().indexOf("/_layouts/15/event.aspx") !== -1) {
      Log.info(LOG_SOURCE, "We are on an event page!")
      const container = document.querySelector("section[data-automation-id='seeAllEvents']");
      if (container !== undefined && container !== null) {
        const allEvents = container.querySelector("a");
        Log.info(LOG_SOURCE, "Found container to add our new function!")
        const params = new URLSearchParams(location.search);
        const listGuid = params.get('ListGuid');
        const itemID = params.get('ItemId') !== null ? parseInt(params.get('ItemId') as string, 10) : 0;
        const currentUser: SPUser = this.context.pageContext.user;
        if (listGuid !== null && itemID > 0) {
          const btnRegister: HTMLAnchorElement = document.createElement("a");
          if (allEvents !== undefined && allEvents !== null)
            btnRegister.className = allEvents.className;
          btnRegister.style.marginLeft = "10px";
          btnRegister.style.paddingTop = "5px";

          const currentAppointmentEntry = await this.loadAppointment(listGuid, itemID);
          if (currentAppointmentEntry.ParticipantsPickerId.filter(x => x.Title === currentUser.displayName).length > 0) {
            const propertyContent = container.parentNode?.firstChild;
            if (propertyContent !== undefined) {
              const head3: HTMLHeadingElement = document.createElement("h3");
              head3.innerText = strings.HeadRegistered;
              (propertyContent as any).before(head3);// eslint-disable-line
            }
            btnRegister.innerText = strings.BTNUnregister;
            btnRegister.onclick = async (source: any) => { // eslint-disable-line
              await this.manageUserToAppointment(listGuid, itemID, currentAppointmentEntry, currentUser, false);
              void Dialog.alert(strings.MSGUnregistered).then(() => { // eslint-disable-line
                location.reload();
              });
            }
          }
          else {
            btnRegister.innerText = strings.BTNRegister;
            btnRegister.onclick = async (source: any) => { // eslint-disable-line
              await this.manageUserToAppointment(listGuid, itemID, currentAppointmentEntry, currentUser, true);
              void Dialog.alert(strings.MSGRegistered).then(() => { // eslint-disable-line
                location.reload();
              });
            }
          }
          container.appendChild(btnRegister);
        }
        else {
          Log.warn(LOG_SOURCE, `Cannot apply register function due to missing data: ListID: ${listGuid}, ItemID: ${itemID}.`);
        }
      }
      else {
        Log.warn(LOG_SOURCE, "Cannot apply register function due to missing CONTAINER element!");
      }
    }
  }

  private loadAppointment(listGuid: string, id: number): Promise<IEvent> {
    const endpoint = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getById('${listGuid}')/items(${id})?$expand=ParticipantsPicker&$select=Id,Title,ParticipantsPicker/ID,ParticipantsPicker/Title`;
    return this.context.spHttpClient.get(
      endpoint,
      SPHttpClient.configurations.v1)
      .then(response => {
        return response.json();
      })
      .then((jsonResponse: any) => { // eslint-disable-line
        return {
          Id: jsonResponse.Id,
          ParticipantsPickerId: jsonResponse.ParticipantsPicker ? jsonResponse.ParticipantsPicker : [],
          Title: jsonResponse.Title
        };
      }) as Promise<IEvent>;
  }

  private async manageUserToAppointment(listGuid: string, id: number, userList: IEvent, userToAdd: SPUser, addNew: boolean): Promise<SPHttpClientResponse> {
    const clientconfig = SPHttpClient.configurations.v1;
    const options: ISPHttpClientOptions = {
      body: JSON.stringify({ 'logonName': userToAdd.loginName })
    };

    const reqUser = await this.context.spHttpClient.post(`${this.context.pageContext.web.absoluteUrl}/_api/web/ensureuser`, clientconfig, options);
    const userData = await reqUser.json();
    if (addNew) {
      userList.ParticipantsPickerId = userList.ParticipantsPickerId.map((x) => x.ID);
      userList.ParticipantsPickerId.push(userData.Id);
    }
    else {
      userList.ParticipantsPickerId = userList.ParticipantsPickerId.filter(x => x.ID !== userData.Id).map((x) => x.ID);
    }
    const body = JSON.stringify(userList);
    const updateoptions = {
      headers: {
        'Accept': 'application/json;odata=nometadata',
        'Content-type': 'application/json;odata=nometadata',
        'odata-version': '',
        'IF-MATCH': '*',
        'X-HTTP-Method': 'MERGE'
      },
      body: body
    };
    return this.context.spHttpClient.post(`${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getById('${listGuid}')/items(${id})`, clientconfig, updateoptions);
  }
}
