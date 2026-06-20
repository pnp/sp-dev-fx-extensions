import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Log } from '@microsoft/sp-core-library';
import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import * as strings from 'SiteContentRibbonApplicationCustomizerStrings';
import SiteContentRibbon from './components/SiteContentRibbon';

const LOG_SOURCE: string = 'SiteContentRibbonApplicationCustomizer';

export interface ISiteContentRibbonApplicationCustomizerProperties {
  testMessage: string;
}

export default class SiteContentRibbonApplicationCustomizer
  extends BaseApplicationCustomizer<ISiteContentRibbonApplicationCustomizerProperties> {

  private _container: HTMLDivElement | undefined;
  private _observer: MutationObserver | undefined;

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    return new Promise((resolve) => {
      this._waitForTargetContainer()
        .then((headerButtonRegion) => {
          // Initial mount attempt
          this._ensureMounted(headerButtonRegion);

          // Setup MutationObserver to watch for changes in the header and navigation region.
          // This handles dynamic re-renders of the header area on page transitions.
          this._observer = new MutationObserver(() => {
            this._ensureMounted(this._getTargetContainer());
          });

          if (document.body) {
            this._observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          }

          resolve();
        })
        .catch((error) => {
          Log.warn(LOG_SOURCE, `Site content ribbon extension could not mount: ${error instanceof Error ? error.message : String(error)}`);
          resolve();
        });
    });
  }

  private _ensureMounted(headerButtonRegion: HTMLElement | null): void {
    if (!headerButtonRegion) {
      return;
    }

    try {
      // Temporarily disconnect observer to prevent recursive mutation events
      if (this._observer) {
        this._observer.disconnect();
      }

      const existing = document.getElementById('site-content-ribbon-extension-root') as HTMLDivElement | null;
      const tipsButtonContainer = document.getElementById('TipsNTricksButton_container');
      const expectedNextSibling = tipsButtonContainer?.parentElement === headerButtonRegion ? tipsButtonContainer : null;

      if (existing) {
        this._container = existing;
        if (expectedNextSibling && existing.nextSibling !== expectedNextSibling) {
          expectedNextSibling.before(existing);
        } else if (headerButtonRegion.firstChild && headerButtonRegion.firstChild !== existing) {
          headerButtonRegion.insertBefore(existing, headerButtonRegion.firstChild);
        }
      } else {
        const container = document.createElement('div');
        container.id = 'site-content-ribbon-extension-root';
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.width = '48px';
        container.style.height = '100%';
        this._container = container;

        if (expectedNextSibling) {
          expectedNextSibling.before(container);
        } else if (headerButtonRegion.firstChild) {
          headerButtonRegion.insertBefore(container, headerButtonRegion.firstChild);
        } else {
          headerButtonRegion.appendChild(container);
        }

        const element = React.createElement(SiteContentRibbon, { context: this.context });
        ReactDom.render(element, container);
      }
    } catch (error) {
      Log.error(LOG_SOURCE, error as Error);
    } finally {
      // Re-observe after adjustments
      if (this._observer) {
        this._observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    }
  }

  private _getTargetContainer(): HTMLElement | null {
    const selectors = [
      '#HeaderButtonRegion',
      '[data-automation-id="HeaderButtonRegion"]',
      '#O365_NavHeader',
      '.o365cs-nav-header',
      '[data-automation-id="headerButtons"]',
      '#suiteBarButtons',
      '#suiteBarLeft',
      '[data-automation-id="ShellHeader"]',
      'header',
      '[role="banner"]',
      'nav'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (element && element !== document.body && element.getClientRects().length > 0) {
        return element;
      }
    }

    const tipsButtonContainer = document.getElementById('TipsNTricksButton_container');
    if (tipsButtonContainer?.parentElement) {
      return tipsButtonContainer.parentElement;
    }

    return document.body;
  }

  protected onDispose(): void {
    if (this._observer) {
      this._observer.disconnect();
    }
    if (this._container) {
      ReactDom.unmountComponentAtNode(this._container);
    }
    super.onDispose();
  }

  private _waitForTargetContainer(timeoutMs: number = 15000): Promise<HTMLElement | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const target = this._getTargetContainer();
        if (target) {
          clearInterval(interval);
          resolve(target);
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          clearInterval(interval);
          resolve(null);
        }
      }, 100);
    });
  }
}
