import { Log } from '@microsoft/sp-core-library';
import { override } from '@microsoft/decorators';
import {
  BaseFieldCustomizer,
  IFieldCustomizerCellEventParameters
} from '@microsoft/sp-listview-extensibility';

import * as $ from 'jquery';
import "jqueryui";
import { IOrderedRow } from './IOrderedRow';
import { IChangedRow } from './IChangedRow';

const TIMEOUTDURATION_INIT: number = 100;
const LISTPAGECONTAINER: string = '.ms-List-page';
const LISTROWCONTAINER: string = '.ms-List-cell';
const INDICATORICONCLASS: string = 'ms-Icon--Pin';
const LOADINGICONCLASS: string = 'ms-Icon--Refresh';

import * as strings from 'SpfxItemOrderFieldCustomizerStrings';
import styles from './SpfxItemOrderFieldCustomizer.module.scss';

/**
 * If your field customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISpfxItemOrderFieldCustomizerProperties {
  //Nope
}

const LOG_SOURCE: string = 'SpfxItemOrderFieldCustomizer';

export default class SpfxItemOrderFieldCustomizer
  extends BaseFieldCustomizer<ISpfxItemOrderFieldCustomizerProperties> {

  private _timeoutId_Init: number;
  private _rowOrder: Array<number>;
  private _rowMap: Array<IOrderedRow>;


  @override
  public onInit(): Promise<void> {
    // Add your custom initialization to this method.  The framework will wait
    // for the returned promise to resolve before firing any BaseFieldCustomizer events.
    Log.info(LOG_SOURCE, 'Activated SpfxItemOrderFieldCustomizer with properties:');


    //this._timeoutId = setTimeout(this.listReady,this._timeoutDuration);

    //Initialize the row map
    this._rowMap = new Array<IOrderedRow>();

    return Promise.resolve<void>();
  }

  @override
  public onRenderCell(event: IFieldCustomizerCellEventParameters): void {
    
    //Cancel the previous timeout
    if(this._timeoutId_Init) {
      clearTimeout(this._timeoutId_Init);
    }

    //Provide an icon for dragging (actually, the whole row can be dragged, but a UI hint is helpful)
    event.domElement.classList.add('ms-font-l');
    event.domElement.classList.add(`${styles.SpfxItemOrder}`);
    event.domElement.innerHTML = `<i class="ms-Icon ${INDICATORICONCLASS} ${styles.reorderField}" aria-hidden="true"></i>`;

    //Track the Ids and Order values of each row (so that they can be referenced later)
    this._rowMap.push({
      Id: event.listItem.getValueByName('Id'),
      Order: event.listItem.getValueByName('Order.')
    });

    //Reset timeout (only needed since there isn't an onCellsRendered event)
    this._timeoutId_Init = setTimeout(this.listReady.bind(this),TIMEOUTDURATION_INIT);
  }

  public listReady(): void {

    //jQuery document ready
    $(document).ready(() => {

      //Apply jQuery UI sortable to the item rows
      // see http://jqueryui.com/sortable for more details
      $(LISTPAGECONTAINER).sortable({
        stop: this.onOrderChanged.bind(this)
      });

      //Store the current row order (for cross-referencing)
      this._rowOrder = SpfxItemOrderFieldCustomizer.getRowOrder();

    });

  }

  @override
  public onDisposeCell(event: IFieldCustomizerCellEventParameters): void {
    // This method should be used to free any resources that were allocated during rendering.
    // For example, if your onRenderCell() called ReactDOM.render(), then you should
    // call ReactDOM.unmountComponentAtNode() here.
    super.onDisposeCell(event);
  }

  public onOrderChanged(e: JQueryEventObject, ui: JQueryUI.SortableUIParams): void {

    //Temporarily disable reordering
    $(LISTPAGECONTAINER).sortable('disable');

    //Grab the current row order
    let newOrder: Array<number> = SpfxItemOrderFieldCustomizer.getRowOrder();

    console.log('original order:');
    console.log(this._rowOrder);
    console.log('new order:');
    console.log(newOrder);

    if(SpfxItemOrderFieldCustomizer.hasChanged(this._rowOrder, newOrder)) {

      this.saveChanges();

    } else {

      //No real changes, so turn the reordering back on
      $(LISTPAGECONTAINER).sortable('enable');

    }

  }

  public saveChanges(): void {

    console.log('Saving!');

    //Grab the current row order
    let newOrder: Array<number> = SpfxItemOrderFieldCustomizer.getRowOrder();

    //Find the changed rows
    let dirtyRows: Array<IChangedRow> = SpfxItemOrderFieldCustomizer.changedRows(this._rowOrder, newOrder);

    dirtyRows.forEach((row: IChangedRow) => {
      SpfxItemOrderFieldCustomizer.showLoading(row.listIndex);
    });

    //set timeout for saving (to allow multiple changes before saving) - maybe 500-1000 ms?
    //Compare to see if anything actually changed
    //  disable sorting
    //If changed, identify the changed items (maybe an array stored in the class, rather than the column)
    //swap the order values for the original order values in those positions
    //save the order as the new order
    //  show a loading icon in the reorder field
    //  add the changed items to a batch update (pnp)
    //  on then:
    //     reenable sorting
    //     show the movement icon again in reorder
  }


  public static getRowOrder(): Array<number> {
    //The jQuery UI @types does not include the method to specify the attribute
    // used in the toArray method, so we cast it to <any> first
    //The initial results are string values so we map to an array of integers
    // since this makes referencing by index much easier
    return (<any>$(LISTPAGECONTAINER)).sortable('toArray',{
      attribute: 'data-list-index'
    }).map((value: string) => {
      return parseInt(value);
    });
  }

  public static hasChanged(prevOrder: Array<number>, newOrder: Array<number>): boolean {
    for(let i: number = 0; i < newOrder.length; i++) {
      if(newOrder[i] !== prevOrder[i]) {
        return true;
      }
    }
    return false;
  }

  public static changedRows(prevOrder: Array<number>, newOrder: Array<number>): Array<IChangedRow> {
    let diffRows: Array<IChangedRow> = new Array<IChangedRow>();

    for(let i: number = 0; i < newOrder.length; i++) {
      if(newOrder[i] !== prevOrder[i]) {
        diffRows.push({
          listIndex: newOrder[i],
          position: i
        });
      }
    }

    return diffRows;
  }

  public static showLoading(listIndex: number): void {
    $(LISTROWCONTAINER + `[data-list-index=${listIndex}] .${styles.reorderField}`)
      .removeClass(INDICATORICONCLASS)
      .addClass(LOADINGICONCLASS)
      .addClass(styles.spinning);
  }

  public static hideLoading(): void {
    $('.' + LOADINGICONCLASS)
      .removeClass(LOADINGICONCLASS)
      .removeClass(styles.spinning)
      .addClass(INDICATORICONCLASS);
  }
}
