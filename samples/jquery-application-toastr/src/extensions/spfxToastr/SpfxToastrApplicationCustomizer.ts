import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';

import * as strings from 'spfxToastrStrings';

//Needed to reference external CSS files
import { SPComponentLoader } from '@microsoft/sp-loader';

import * as $ from 'jquery';
import * as toastr from 'toastr';
import styles from './SpfxToastr.module.scss';
import { IToast, ToastService } from '../../services/toastService';

const LOG_SOURCE: string = 'SpfxToastrApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface ISpfxToastrApplicationCustomizerProperties {
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class SpfxToastrApplicationCustomizer
  extends BaseApplicationCustomizer<ISpfxToastrApplicationCustomizerProperties> {

  private toastsPromise: Promise<IToast[]>;

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    //Load the Toastr CSS
    SPComponentLoader.loadCss('https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css');

    this.toastsPromise = ToastService.getToasts(this.context.spHttpClient, this.context.pageContext.web.absoluteUrl);

    return Promise.resolve<void>();
  }

  @override
  public onRender(): void {
    
    $(document).ready(() => {

      //***********************
      //Toastr Options
      //***********************

      // Determines where the toast shows up.
      //  styles.topRight and styles.topLeft take into account the SuiteBar
      //  There are also the native toast-bottom-right and toast-bottom-left
      toastr.options.positionClass = `${styles.topRight} ${styles.spfxToastr}`;
      toastr.options.preventDuplicates = true;
      toastr.options.newestOnTop = false; //Ensures the first toast we send is on top
      toastr.options.timeOut = 0; //Prevents auto dismissal
      toastr.options.extendedTimeOut = 0; //Prevents auto dismissal during hover
      toastr.options.tapToDismiss = true; //Allows messages to go away on click
      toastr.options.closeButton = true; //Shows a close button to let end users know to click to close

      // A combination of Office UI-Fabric classes and custom classes are used
      //  to ensure the notifications don't look too out of place
      // We use a custom styles.fabricIcon style to imitage the ms-Icon class
      //  the ms-Icon class has extra properties that mess up our toast
      // We are unable to use the ms-bgColor styles since the Toast CSS loads
      //  later and takes precedence, so we use our own color classes
      //  For more background on this issue, see this article: https://dev.office.com/sharepoint/docs/spfx/web-parts/guidance/office-ui-fabric-integration
      toastr.options.titleClass = 'ms-font-m ms-fontWeight-semibold';
      toastr.options.messageClass = 'ms-font-s';
      toastr.options.iconClasses = {
        info: `${styles.info} ${styles.fabricIcon} ms-Icon--Info`,
        warning: `${styles.warning} ${styles.fabricIcon} ms-Icon--Warning`,
        error: `${styles.error} ${styles.fabricIcon} ms-Icon--Error`,
        success: `${styles.success} ${styles.fabricIcon} ms-Icon--Completed`
      };

      //Test Toast!
      /*toastr.info('Toast is great!', 'Sample Toast');
      toastr.warning('Oh no!', 'Some Warning');
      toastr.success('You did great, kid.', "Success Message");
      toastr.error('You make so sad and this message just goes on and on and on and on it is just so super long!', 'FAILURE');
      */


      //***********************
      //Toast Display
      //***********************

      this.toastsPromise.then((toasts: IToast[]) => {
        for (let t of toasts){

          // Setup callbacks to track dismisal status
          let overrides: ToastrOptions = {
            onclick: () => {
              ToastService.acknowledgeToast(t.Id);
            },
            onCloseClick: () => {
              ToastService.acknowledgeToast(t.Id);
            }
          };

          switch (t.Severity){
            case 'Warning':
              toastr.warning(t.Message, t.Title, overrides);
              break;
            case 'Error':
              toastr.error(t.Message, t.Title, overrides);
              break;
            case 'Success':
              toastr.success(t.Message, t.Title, overrides);
              break;
            default:
              toastr.info(t.Message, t.Title, overrides);
              break;
          }
        }
      }).catch((error: any): void => {
        toastr.error(error,'Failed to Load Toasts!');
      });
    });
  }

}
