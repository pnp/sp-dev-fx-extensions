import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { IWebPartInfo } from "../models/IPageIndexData";

export interface IPageMetadata {
  id: string;
  title: string;
  webUrl: string;
  pageContent: string;
  totalWordCount: number;
  modernPageData?: string;
  webParts: IWebPartInfo[];
}

export class GraphService {
  private sp: SPFI;

  constructor(sp: SPFI) {
    this.sp = sp;
  }

  /**
   * Verify if a page exists in the Site Pages library
   */
  public async verifySitePage(pageName: string): Promise<boolean> {
    try {
      const items = await this.sp.web.lists
        .getByTitle('Site Pages')
        .items
        .filter(`FileLeafRef eq '${this.escapeODataValue(pageName)}'`)
        .select('Id')
        .top(1)();
      
      return items.length > 0;
    } catch (error) {
      console.warn("Error verifying Site Page:", error);
      return false;
    }
  }

  public async getCurrentPage(pageUrl: string): Promise<IPageMetadata> {
    console.log("🔍 Starting comprehensive page crawl...");
    
    // First, scroll through the page to trigger lazy loading
    await this.triggerLazyLoading();
    
    // Then wait for any images/content to finish loading
    await this.waitForContent();
    
    // Extract all content types
    const basicContent = this.extractBasicPageContent();
    const modernPageData = await this.extractModernPageData();
    const webParts = this.crawlSPFxWebParts();
    const reactContent = this.extractReactComponents();
    const canvasContent = this.extractCanvasContent();
    
    // Combine all content intelligently
    let combinedContent = this.combineContent(
      basicContent,
      modernPageData,
      reactContent,
      canvasContent,
      webParts
    );
    
    const pageId = this.generatePageId(pageUrl);
    
    return {
      id: pageId,
      title: document.title || 'SharePoint Page',
      webUrl: pageUrl,
      pageContent: combinedContent,
      totalWordCount: this.countWords(combinedContent),
      modernPageData: modernPageData,
      webParts: webParts
    };
  }

  /**
   * Automatically scroll through the page to trigger lazy-loaded content
   */
  private async triggerLazyLoading(): Promise<void> {
    return new Promise((resolve) => {
      console.log("📜 Auto-scrolling to trigger lazy-loaded content...");
      
      const originalScrollY = window.scrollY;
      const scrollStep = 500; // Scroll 500px at a time
      const scrollDelay = 150; // Wait 150ms between scrolls
      let currentPosition = 0;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      
      const scrollInterval = setInterval(() => {
        currentPosition += scrollStep;
        window.scrollTo(0, currentPosition);
        
        // Check if we've reached the bottom
        if (currentPosition >= documentHeight - window.innerHeight) {
          clearInterval(scrollInterval);
          
          // Wait a bit at the bottom for any final content to load
          setTimeout(() => {
            // Scroll back to original position
            window.scrollTo(0, originalScrollY);
            console.log("✅ Lazy loading triggered, returned to original position");
            resolve();
          }, 300);
        }
      }, scrollDelay);
      
      // Failsafe: don't scroll forever
      setTimeout(() => {
        clearInterval(scrollInterval);
        window.scrollTo(0, originalScrollY);
        console.log("Auto-scroll timeout, returning to original position");
        resolve();
      }, 10000); // Max 10 seconds of scrolling
    });
  }

  /**
   * Wait for images and dynamic content to finish loading
   */
  private async waitForContent(): Promise<void> {
    return new Promise((resolve) => {
      console.log("⏳ Waiting for images and dynamic content to load...");
      
      // Check if all images are loaded
      const images = Array.from(document.images);
      const totalImages = images.length;
      let loadedImages = 0;
      
      if (totalImages === 0) {
        console.log("✅ No images to wait for");
        resolve();
        return;
      }
      
      const checkComplete = () => {
        loadedImages++;
        if (loadedImages >= totalImages) {
          console.log(`✅ All ${totalImages} images loaded`);
          resolve();
        }
      };
      
      images.forEach((img) => {
        if (img.complete) {
          checkComplete();
        } else {
          img.addEventListener('load', checkComplete);
          img.addEventListener('error', checkComplete); // Count errors as "loaded" to avoid hanging
        }
      });
      
      // Failsafe timeout
      setTimeout(() => {
        console.log(`Image loading timeout (${loadedImages}/${totalImages} loaded)`);
        resolve();
      }, 5000);
    });
  }

  private combineContent(
    basicContent: string,
    modernPageData: string | undefined,
    reactContent: string,
    canvasContent: string,
    webParts: IWebPartInfo[]
  ): string {
    let combined = '';
    const addedSections = new Set<string>();
    
    // Determine which content section has the most comprehensive content
    const contentSections = [
      { name: 'PAGE', content: basicContent },
      { name: 'CANVAS', content: canvasContent },
      { name: 'REACT', content: reactContent }
    ].sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
    
    // Add the most comprehensive content section
    const primarySection = contentSections[0];
    if (primarySection.content) {
      combined += `=== ${primarySection.name} CONTENT ===\n${primarySection.content}\n\n`;
      addedSections.add(primarySection.name);
    }
    
    // Add other sections only if they contain unique content
    for (let i = 1; i < contentSections.length; i++) {
      const section = contentSections[i];
      if (section.content && !this.isSimilarContent(section.content, combined)) {
        combined += `=== ${section.name} CONTENT ===\n${section.content}\n\n`;
        addedSections.add(section.name);
      }
    }
    
    // Add modern page data (metadata only, not full content)
    if (modernPageData) {
      combined += `=== MODERN PAGE DATA ===\n${modernPageData}\n\n`;
    }
    
    // Note: Web parts content is already captured in the page sections above
    // No need to repeat it in a separate SPFX WEB PARTS section
    
    return combined;
  }

  /**
   * Check if two content strings are similar (>70% match) to avoid duplication
   */
  private isSimilarContent(content1: string, content2: string): boolean {
    if (!content1 || !content2) return false;
    
    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalized1 = normalize(content1);
    const normalized2 = normalize(content2);
    
    // If one contains the other almost entirely, consider them similar
    if (normalized1.length > 100 && normalized2.length > 100) {
      const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
      const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2;
      
      // Check if the shorter string is substantially contained in the longer one
      if (longer.includes(shorter.substring(0, Math.min(shorter.length, 200)))) {
        // Calculate what percentage of the shorter string is in the longer string
        const containmentRatio = (shorter.length / longer.length) * 100;
        if (containmentRatio > 50) {
          return true;
        }
      }
      
      // Calculate similarity using word-based approach - ES5 compatible
      const words1 = normalized1.split(' ');
      const words2 = normalized2.split(' ');
      const commonWords = words1.filter(function(word) {
        return words2.indexOf(word) !== -1 && word.length > 3;
      }).length;
      const totalWords = Math.max(words1.length, words2.length);
      const wordSimilarity = (commonWords / totalWords) * 100;
      
      return wordSimilarity > 70;
    }
    
    return false;
  }

  private crawlSPFxWebParts(): IWebPartInfo[] {
    const webParts: IWebPartInfo[] = [];
    const processedElements = new Set<Element>();
    const processedContentHashes = new Set<string>();
    
    console.log("🔍 Crawling SPFx web parts with enhanced deduplication...");
    
    // Enhanced selectors for SPFx web parts
    const spfxSelectors = [
      // Standard SPFx attributes
      '[data-sp-feature-tag*="WebPart"]',
      '[data-sp-web-part-id]',
      '[data-sp-component-id]',
      '[data-sp-webpart]',
      
      // Common SPFx classes
      '.spfx-webpart',
      '.sp-webpart',
      '[class*="webPart"]',
      '[class*="WebPart"]',
      
      // Canvas and control zones
      '.ControlZone',
      '[data-sp-controlzone]',
      '[class*="ControlZone"]',
      
      // Automation IDs
      '[data-automation-id*="webPart"]',
      '[data-automation-id*="canvas"]',
      
      // Modern page specific
      '[data-sp-modern-canvas-component]',
      '.modern-canvas-web-part'
    ];
    
    // Process each selector
    spfxSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`🎯 Found ${elements.length} elements with selector: ${selector}`);
        
        elements.forEach((element) => {
          // Skip if already processed
          if (processedElements.has(element)) return;
          
          const content = this.extractContentFromElement(element);
          
          // Only process if we have meaningful content
          if (content && content.trim().length > 20) {
            // Create a hash of the content to detect duplicates
            // Use a longer sample for better duplicate detection
            const contentHash = this.hashString(content.trim().substring(0, 1000));
            
            // Skip if we've already processed very similar content
            if (processedContentHashes.has(contentHash)) {
              console.log(`⏭️ Skipping duplicate web part content (hash match)`);
              return;
            }
            
            // Additional check: see if similar content already exists
            let isDuplicate = false;
            for (const existingWebPart of webParts) {
              if (this.areSimilarWebParts(content, existingWebPart.content)) {
                console.log(`⏭️ Skipping duplicate web part (similarity match with "${existingWebPart.webPartTitle}")`);
                isDuplicate = true;
                break;
              }
            }
            
            if (isDuplicate) return;
            
            const webPartInfo: IWebPartInfo = {
              webPartId: this.generateWebPartId(element),
              webPartTitle: this.getWebPartTitle(element),
              webPartType: this.getWebPartType(element),
              instanceId: this.getInstanceId(element),
              content: this.truncate(content, 3000),
              data: this.getWebPartData(element)
            };
            
            webParts.push(webPartInfo);
            processedElements.add(element);
            processedContentHashes.add(contentHash);
            
            console.log(`✅ Indexed web part: "${webPartInfo.webPartTitle}"`, {
              type: webPartInfo.webPartType,
              contentLength: content.length,
              instanceId: webPartInfo.instanceId
            });
          }
        });
      } catch (error) {
        console.warn(`Error processing selector ${selector}:`, error);
      }
    });
    
    console.log(`Total unique web parts found: ${webParts.length}`);
    return webParts;
  }

  /**
   * Check if two web part contents are similar (for deduplication)
   */
  private areSimilarWebParts(content1: string, content2: string): boolean {
    if (!content1 || !content2) return false;
    
    const normalize = (str: string) => str.replace(/\s+/g, ' ').trim().toLowerCase();
    const normalized1 = normalize(content1);
    const normalized2 = normalize(content2);
    
    // If contents are very similar in length and start with same text, they're likely duplicates
    const lengthDiff = Math.abs(normalized1.length - normalized2.length);
    const avgLength = (normalized1.length + normalized2.length) / 2;
    
    if (lengthDiff / avgLength < 0.1) { // Within 10% length difference
      // Compare first 300 characters
      const sample1 = normalized1.substring(0, 300);
      const sample2 = normalized2.substring(0, 300);
      
      // Calculate similarity of sample
      let matches = 0;
      const minLength = Math.min(sample1.length, sample2.length);
      for (let i = 0; i < minLength; i++) {
        if (sample1[i] === sample2[i]) matches++;
      }
      
      const similarity = matches / minLength;
      return similarity > 0.85; // 85% character match in first 300 chars
    }
    
    return false;
  }

  private generateWebPartId(element: Element): string {
    return element.getAttribute('data-sp-web-part-id') ||
           element.getAttribute('data-sp-component-id') ||
           element.getAttribute('id') ||
           this.hashString(element.outerHTML.substring(0, 200));
  }

  private getWebPartTitle(element: Element): string {
    // Try to find a title in various ways
    let title = element.getAttribute('data-sp-web-part-title') ||
                element.getAttribute('aria-label') ||
                element.getAttribute('title');
    
    if (!title) {
      // Look for title elements
      const titleElement = element.querySelector('[class*="title"], [class*="Title"], h1, h2, h3');
      if (titleElement) {
        title = titleElement.textContent?.trim() || '';
      }
    }
    
    // If still no title, extract first meaningful text
    if (!title) {
      const content = this.extractTextWithSpacing(element);
      const words = content.trim().split(/\s+/);
      title = words.slice(0, 5).join(' ');
    }
    
    return this.truncate(title || 'Unknown Web Part', 100);
  }

  private getWebPartType(element: Element): string {
    const featureTag = element.getAttribute('data-sp-feature-tag');
    if (featureTag && featureTag.includes('WebPart')) {
      return 'SPFxWebPart';
    }
    
    const componentId = element.getAttribute('data-sp-component-id');
    if (componentId) {
      return 'SPFxComponent';
    }
    
    if (element.classList.contains('ControlZone')) {
      return 'ControlZone';
    }
    
    return 'SPFxWebPart';
  }

  private getInstanceId(element: Element): string {
    return element.getAttribute('data-sp-component-id') ||
           element.getAttribute('data-instance-id') ||
           element.getAttribute('id') ||
           `instance-${Date.now()}`;
  }

  private extractContentFromElement(element: Element): string {
    return this.extractTextWithSpacing(element);
  }

  private extractTextWithSpacing(element: Element | Node): string {
    if (!element) return '';
    
    let text = '';
    
    element.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const nodeText = node.textContent?.trim();
        if (nodeText) {
          text += nodeText + ' ';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName?.toLowerCase();
        
        // Skip script, style, and hidden elements
        if (['script', 'style', 'noscript'].indexOf(tagName) !== -1) {
          return;
        }
        
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return;
        }
        
        // Recursively get text from children
        const childText = this.extractTextWithSpacing(el);
        if (childText) {
          text += childText;
          
          // Add spacing after block-level elements
          if (['div', 'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'].indexOf(tagName) !== -1) {
            text += '\n';
          }
        }
      }
    });
    
    return text.replace(/\s+/g, ' ').trim();
  }

  private getWebPartData(element: Element): any {
    // Try to extract any structured data from the web part
    const dataAttributes: any = {};
    
    // Collect all data- attributes
    Array.from(element.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        dataAttributes[attr.name] = attr.value;
      }
    });
    
    // Collect other useful attributes
    return {
      componentId: element.getAttribute('data-sp-component-id'),
      featureTag: element.getAttribute('data-sp-feature-tag'),
      automationId: element.getAttribute('data-automation-id')
    };
  }

  private extractReactComponents(): string {
    let content = '';
    
    try {
      // Look for React root elements
      const reactRoots = document.querySelectorAll('[data-reactroot], [data-react-root]');
      reactRoots.forEach(root => {
        const text = this.extractTextWithSpacing(root);
        if (text && text.length > 20) {
          content += text + '\n';
        }
      });
    } catch (error) {
      console.warn("Error extracting React components:", error);
    }
    
    return content;
  }

  private extractCanvasContent(): string {
    let content = '';
    
    try {
      const canvasSelectors = [
        '.canvas-page-content',
        '.CanvasZone',
        '.CanvasSection',
        '[data-automation-id="canvas"]'
      ];
      
      canvasSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          const text = this.extractTextWithSpacing(element);
          if (text && text.length > 20 && !content.includes(text)) {
            content += text + '\n';
          }
        });
      });
    } catch (error) {
      console.warn("Error extracting canvas content:", error);
    }
    
    return content;
  }

  private async extractModernPageData(): Promise<string> {
    try {
      console.log("🔍 Extracting modern page data from SharePoint API...");
      
      const pageName = this.getPageNameFromUrl(window.location.href);
      if (!pageName) return '';
      
      const pageItem = await this.getPageListItem(pageName);
      if (pageItem) {
        console.log("✅ Retrieved page item from Site Pages list:", pageItem.Title);
        
        let modernContent = '';
        
        if (pageItem.BannerImageUrl) {
          modernContent += `Banner Image: ${pageItem.BannerImageUrl.Url || pageItem.BannerImageUrl}\n`;
        }
        
        if (pageItem.Description) {
          modernContent += `Description: ${pageItem.Description}\n`;
        }
        
        // Note: We're NOT including CanvasContent1 or LayoutWebpartsContent here
        // because that content is already captured by the DOM extraction methods
        
        return modernContent;
      }
      
      return '';
    } catch (error) {
      console.log("Could not extract modern page data:", error);
      return '';
    }
  }

  private async getPageListItem(pageName: string): Promise<any> {
    try {
      const items = await this.sp.web.lists
        .getByTitle('Site Pages')
        .items
        .filter(`FileLeafRef eq '${this.escapeODataValue(pageName)}'`)
        .select('Id', 'Title', 'BannerImageUrl', 'Description')
        .top(1)();
      
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.warn("Error getting page list item:", error);
      return null;
    }
  }

  private extractBasicPageContent(): string {
    try {
      let content = '';
      
      const contentSelectors = [
        '[data-automation-id="pageContent"]',
        'main[role="main"]',
        '.page-content',
        'article',
        '.content-area'
      ];
      
      contentSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          const text = this.extractTextWithSpacing(element);
          if (text && text.length > 50 && !content.includes(text)) {
            content += text + '\n';
          }
        });
      });
      
      return this.truncate(content, 15000);
    } catch (error) {
      console.warn("Error extracting basic page content:", error);
      return '';
    }
  }

  private countWords(text: string): number {
    return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
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

  public generatePageId(url: string): string {
    // Create a consistent, URL-safe page ID
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const hash = this.hashString(path);
      return `page-${hash}`;
    } catch {
      return `page-${this.hashString(url)}`;
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  private truncate(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }
}