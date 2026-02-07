import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { PageIndexerService } from './services/PageIndexerService';

const LOG_SOURCE: string = 'PageIndexerApplicationCustomizer';

export default class PageIndexerApplicationCustomizer
  extends BaseApplicationCustomizer<{}> {

  private pageIndexerService: PageIndexerService | undefined;

  public async onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `🚀 Initializing PageIndexerApplicationCustomizer`);

    try {
      // Initialize PnPjs with SPFx context
      const sp = spfi().using(SPFx(this.context));

     
      console.log("  Site URL:", this.context.pageContext.web.absoluteUrl);
      console.log("  Page URL:", window.location.href);
      console.log("  User:", this.context.pageContext.user.displayName);
      console.log("  Email:", this.context.pageContext.user.email);

      // Initialize the page indexer service
      this.pageIndexerService = new PageIndexerService(sp);
      await this.pageIndexerService.initialize();

      // Make service available globally for debugging
      (window as any).pageIndexer = {
        service: this.pageIndexerService,
        manualIndex: () => this.pageIndexerService?.manualIndex(),
        getStats: () => this.pageIndexerService?.getPageStats(),
        version: "2.0.0"
      };

      console.log("Page Indexer is active and monitoring page content");
      
      
    } catch (error) {
      console.error("Error details:", error);
      console.error("Stack trace:", (error as Error).stack);
      
      Log.error(LOG_SOURCE, error as Error);
    }

    return Promise.resolve();
  }

  public onDispose(): void {
    
    if (this.pageIndexerService) {
      this.pageIndexerService.dispose();
      console.log("✅ Service disposed successfully");
    }
    
    // Clean up global reference
    if ((window as any).pageIndexer) {
      delete (window as any).pageIndexer;
    }
    
    Log.info(LOG_SOURCE, 'Disposed PageIndexerApplicationCustomizer');
  }
}