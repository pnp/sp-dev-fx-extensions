import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import { PAGE_INDEXER_EVENT } from '../../extensions/pageIndexer/models/IPageIndexData';

export interface ITestWebPartWebPartProps {
  description: string;
}

export default class TestWebPartWebPart extends BaseClientSideWebPart<ITestWebPartWebPartProps> {

  // FIXED: Renamed from 'instanceId' to 'webPartInstanceId' to avoid conflict
  private webPartInstanceId: string;

  protected onInit(): Promise<void> {
    this.webPartInstanceId = this.context.instanceId;
    
    console.log("🧪 Test Web Part initialized:", {
      componentId: this.context.manifest.id,
      instanceId: this.webPartInstanceId
    });

    return super.onInit();
  }

  public render(): void {
    this.domElement.innerHTML = `
      <div style="padding: 20px; border: 2px solid #0078d4; border-radius: 4px; background: #f3f2f1;">
        <h2 style="color: #0078d4; margin-top: 0;">🧪 Page Indexer Test Web Part</h2>
        <p><strong>Component ID:</strong> ${escape(this.context.manifest.id)}</p>
        <p><strong>Instance ID:</strong> ${escape(this.webPartInstanceId)}</p>
        <p><strong>Description:</strong> ${escape(this.properties.description || 'No description')}</p>
        
        <div style="margin: 20px 0;">
          <button id="reportDataBtn" style="
            padding: 10px 20px;
            background: #0078d4;
            color: white;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
          ">📤 Report Data to Indexer</button>
          
          <button id="customDataBtn" style="
            padding: 10px 20px;
            background: #107c10;
            color: white;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 14px;
          ">📝 Report Custom Data</button>
        </div>

        <div id="resultArea" style="
          margin-top: 20px;
          padding: 15px;
          background: white;
          border-left: 4px solid #107c10;
          display: none;
        ">
          <h3 style="margin-top: 0; color: #107c10;">✅ Data Reported</h3>
          <pre id="resultContent" style="
            background: #f3f2f1;
            padding: 10px;
            border-radius: 2px;
            overflow-x: auto;
            font-size: 12px;
          "></pre>
        </div>
      </div>
    `;

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    const reportBtn = this.domElement.querySelector('#reportDataBtn');
    const customBtn = this.domElement.querySelector('#customDataBtn');
    const resultArea = this.domElement.querySelector('#resultArea') as HTMLElement;
    const resultContent = this.domElement.querySelector('#resultContent') as HTMLElement;

    if (reportBtn) {
      reportBtn.addEventListener('click', () => {
        const data = {
          description: this.properties.description || 'Test description',
          timestamp: new Date().toISOString(),
          clickCount: Math.floor(Math.random() * 100)
        };

        this.reportToIndexer(data, resultArea, resultContent);
      });
    }

    if (customBtn) {
      customBtn.addEventListener('click', () => {
        const customData = {
          userEmail: this.context.pageContext.user.email,
          siteTitle: this.context.pageContext.web.title,
          customValue: "Custom analytics data",
          metrics: {
            views: 42,
            engagement: 0.85,
            rating: 4.5
          }
        };

        this.reportToIndexer(customData, resultArea, resultContent);
      });
    }
  }

  private reportToIndexer(data: any, resultArea: HTMLElement, resultContent: HTMLElement): void {
    const event = new CustomEvent(PAGE_INDEXER_EVENT, {
      detail: {
        webPartId: this.context.manifest.id,
        webPartTitle: "Test Web Part",
        webPartType: "TestWebPart",
        componentId: this.context.manifest.id,
        instanceId: this.webPartInstanceId,  // FIXED: Use renamed property
        data: data
      },
      bubbles: true,
      cancelable: true
    });

    window.dispatchEvent(event);

    // Show result
    resultArea.style.display = 'block';
    resultContent.textContent = JSON.stringify(event.detail, null, 2);

    console.log("✅ Data reported to Page Indexer:", event.detail);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Test Web Part Settings"
          },
          groups: [
            {
              groupName: "Basic Settings",
              groupFields: [
                PropertyPaneTextField('description', {
                  label: "Description",
                  value: "Test web part for page indexer"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}