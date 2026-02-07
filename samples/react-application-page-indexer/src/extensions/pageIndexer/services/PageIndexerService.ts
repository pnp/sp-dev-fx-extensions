import { SPFI } from "@pnp/sp";
import { IPageIndexData } from "../models/IPageIndexData";
import { ListService } from "./ListService";
import { GraphService } from "./GraphService";

export class PageIndexerService {
  private listService: ListService;
  private graphService: GraphService;
  private indexingTimeout: number | null = null;
  private currentPageUrl: string;
  private isIndexing: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(sp: SPFI) {
    this.listService = new ListService(sp);
    this.graphService = new GraphService(sp);
    this.currentPageUrl = window.location.href;
  }

  public async initialize(): Promise<void> {
    try {
      
      
      
      // Check if current page is a Site Page
      const isSitePage = await this.isSitePage(this.currentPageUrl);
      if (!isSitePage) {
        
        
        return;
      }
      
      // Ensure list exists
      await this.listService.ensureList();
      
      // Schedule indexing with a delay to allow page to fully load
      this.scheduleIndexing(6000);
      
      // Listen for page changes (SPA navigation)
      this.setupNavigationListener();
      
      
    } catch (error) {
      
      console.error("Error initializing PageIndexerService");
      
      console.error("Error details:", error);
    }
  }

  public dispose(): void {
    console.log("PageIndexerService...");
    
    if (this.indexingTimeout) {
      clearTimeout(this.indexingTimeout);
      this.indexingTimeout = null;
    }
    
    this.isIndexing = false;
  }

  private setupNavigationListener(): void {
    let lastUrl = location.href;
    
    const observer = new MutationObserver(async () => {
      const currentUrl = location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        this.currentPageUrl = currentUrl;
        
        
        console.log("New URL:", currentUrl);
        
        
        // Check if new page is a Site Page
        const isSitePage = await this.isSitePage(currentUrl);
        if (isSitePage) {
          console.log("Navigated to Site Page - scheduling re-index...");
          this.scheduleIndexing(5000);
        } else {
          console.log("Navigation complete - no indexing needed");
          
        }
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private async isSitePage(url: string): Promise<boolean> {
    try {
      console.log("URL:", url);
      
      // Exclude non-page URLs explicitly
      const excludedPaths = [
        '/lists/',
        '/forms/',
        '/_layouts/',
        '/settings/',
        '/allitems.aspx',
        '/dispform.aspx',
        '/editform.aspx',
        '/newform.aspx',
        '/_api/',
        '/_vti_bin/'
      ];
      
      const urlLower = url.toLowerCase();
      for (const excludedPath of excludedPaths) {
        if (urlLower.includes(excludedPath)) {
          console.log(`BLOCKED: URL contains excluded path '${excludedPath}'`);
          return false;
        }
      }
      
      // Check if URL contains /SitePages/ path (required for Site Pages)
      if (!urlLower.includes('/sitepages/')) {
        console.log("BLOCKED: URL does not contain /SitePages/ path");
        return false;
      }
      
      const pageName = this.getPageNameFromUrl(url);
      
      if (!pageName || !pageName.endsWith('.aspx')) {
        console.log("BLOCKED: Not a valid .aspx page");
        console.log("Page name:", pageName);
        return false;
      }
      
      // Verify the page exists in the Site Pages library via SharePoint API
      const pageExists = await this.graphService.verifySitePage(pageName);
      if (!pageExists) {
        return false;
      }
      
      console.log("VALIDATED: This is a Site Page");
      console.log("Page name:", pageName);
      console.log("This page WILL be indexed");
      return true;
      
    } catch (error) {
      console.warn("Error checking if page is Site Page:", error);
      return false;
    }
  }

  private getPageNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || '';
    } catch {
      return '';
    }
  }

  private scheduleIndexing(delay: number = 6000): void {
    if (this.indexingTimeout) {
      clearTimeout(this.indexingTimeout);
    }

    console.log(`Indexing scheduled in ${delay}ms...`);
    
    this.indexingTimeout = window.setTimeout(() => {
      this.indexPage();
    }, delay);
  }

  private async indexPage(): Promise<void> {
    // Prevent concurrent indexing
    if (this.isIndexing) {
      console.log("Indexing already in progress, skipping...");
      return;
    }

    try {
      this.isIndexing = true;
      
      // Double-check page is still a Site Page before indexing
      const isSitePage = await this.isSitePage(this.currentPageUrl);
      if (!isSitePage) {
        console.log("Page is not a Site Page - aborting indexing");
        return;
      }
      
      

      // Get comprehensive page metadata
      const pageMetadata = await this.graphService.getCurrentPage(this.currentPageUrl);

      const indexData: IPageIndexData = {
        pageId: pageMetadata.id,
        pageUrl: this.currentPageUrl,
        pageTitle: pageMetadata.title,
        pageContent: pageMetadata.pageContent,
        totalWordCount: pageMetadata.totalWordCount,
        webParts: pageMetadata.webParts
      };

      console.log("Index Data Summary:", {
        pageId: indexData.pageId,
        url: indexData.pageUrl,
        title: indexData.pageTitle,
        totalWords: indexData.totalWordCount,
        webPartsFound: indexData.webParts.length,
        contentLength: indexData.pageContent.length
      });

      if (indexData.webParts.length > 0) {
        indexData.webParts.forEach((wp, idx) => {
          console.log(`${idx + 1}. ${wp.webPartTitle} (${wp.webPartType})`);
          console.log(`Instance ID: ${wp.instanceId}`);
          console.log(`Content Length: ${wp.content.length} chars`);
        });
      }

      // Save to SharePoint list
      await this.listService.addOrUpdatePageIndex(indexData);
      
      
      console.log("✅ Page Successfully Indexed!");
      
      
      this.retryCount = 0; // Reset retry counter on success
      
    } catch (error) {
      
      
      console.error("Error details:", error);
      
      // Retry logic
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const retryDelay = 5000 * this.retryCount;
        console.log(`Retrying in ${retryDelay}ms (Attempt ${this.retryCount}/${this.maxRetries})...`);
        this.scheduleIndexing(retryDelay);
      } else {
        console.error("Max retries reached. Indexing failed.");
        this.retryCount = 0;
      }
      
    } finally {
      this.isIndexing = false;
    }
  }

  public async manualIndex(): Promise<void> {
    console.log("Manual indexing triggered...");
    
    // Check if current page is a Site Page
    const isSitePage = await this.isSitePage(this.currentPageUrl);
    if (!isSitePage) {
      console.error("Cannot index: Current page is not a Site Page");
      return;
    }
    
    this.retryCount = 0;
    await this.indexPage();
  }

  public async getPageStats(): Promise<any> {
    try {
      // Check if current page is a Site Page
      const isSitePage = await this.isSitePage(this.currentPageUrl);
      if (!isSitePage) {
        return {
          indexed: false,
          message: "Not a Site Page"
        };
      }
      
      const pageId = this.graphService.generatePageId(this.currentPageUrl);
      const pageData = await this.listService.getPageIndex(pageId);
      
      if (pageData) {
        return {
          indexed: true,
          pageId: pageData.PageId,
          title: pageData.PageTitle,
          wordCount: pageData.TotalWordCount,
          webPartsCount: pageData.WebPartsCount,
          lastIndexed: pageData.LastIndexed
        };
      }
      
      return {
        indexed: false,
        message: "Site Page not yet indexed"
      };
    } catch (error) {
      console.error("Error getting page stats:", error);
      return {
        indexed: false,
        error: "Failed to retrieve stats"
      };
    }
  }
}