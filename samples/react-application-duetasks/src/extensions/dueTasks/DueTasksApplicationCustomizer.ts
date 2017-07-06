import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer,
  Placeholder
} from '@microsoft/sp-application-base';
import pnp from 'sp-pnp-js';
import { escape } from '@microsoft/sp-lodash-subset'; 

import * as strings from 'dueTasksStrings';
import styles from './DueTasksApplicationCustomizer.module.scss';

const LOG_SOURCE: string = 'DueTasksApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDueTasksApplicationCustomizerProperties {
  // the title of the Tasks list
  tasksListTitle: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class DueTasksApplicationCustomizer
  extends BaseApplicationCustomizer<IDueTasksApplicationCustomizerProperties> {

  private _dueTasks: any;
  private _viewUrl: string;
  private _headerPlaceholder: Placeholder;

  @override
  public onInit(): Promise<void> {
    //Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    return new Promise<void>((resolve) => {
      if (!this.properties.tasksListTitle) { 
        resolve();
        return;
      }
      
      let batch: any  = pnp.sp.createBatch();
      let today: Date = new Date();
      today.setHours(0, 0, 0, 0);

      pnp.sp.web.get().then((web: any) => { console.log(web); });

      pnp.sp.web.lists.getByTitle(this.properties.tasksListTitle).views.getByTitle('Late Tasks').inBatch(batch).get().then((view: any) => {
        this._viewUrl = `${view.ServerRelativeUrl}?FilterField1=AssignedTo&FilterValue1=${escape(this.context.pageContext.user.displayName)}`;
      });

      pnp.sp.web.lists.getByTitle(this.properties.tasksListTitle)
        .items.expand('AssignedTo/Id').select('Title, AssignedTo, AssignedTo/Id, DueDate')
        .filter(`AssignedTo/Id eq ${this.context.pageContext.legacyPageContext.userId} and DueDate lt datetime'${today.toISOString()}'`)
        .get().then((items: any) => {
        this._dueTasks = items;
      });

      batch.execute().then(() => { resolve(); });
    });
  }

  @override
  public onRender(): void {

    if (!this._dueTasks || !this._dueTasks.length)
      return;

    // Handling the header placeholder
    if (!this._headerPlaceholder) {
      this._headerPlaceholder = this.context.placeholders.tryAttach(
        'PageHeader',
        {
          onDispose: this._onDispose
        });
    }

        if (this._headerPlaceholder.domElement) {
          this._headerPlaceholder.domElement.innerHTML = `
                <div class="${styles.app}">
                  <div class="ms-bgColor-themeDark ms-fontColor-white ${styles.header}">
                    <i class="ms-Icon ms-Icon--Info" aria-hidden="true"></i> ${escape(strings.Message)}&nbsp;
                    <a href="${this._viewUrl}" target="_blank">${escape(strings.GoToList)}</a>
                  </div>
                </div>`;
        }
  }

  private _onDispose() {

  }
}
