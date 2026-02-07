import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import { IPageIndexData } from "../models/IPageIndexData";

export class ListService {
  private sp: SPFI;
  private listTitle = "PageIndex";

  constructor(sp: SPFI) {
    this.sp = sp;
  }

  public async ensureList(): Promise<void> {
    try {
      const list = await this.sp.web.lists.getByTitle(this.listTitle)();
      console.log("✅ PageIndex list exists:", list.Title);
      
      // Verify all fields exist
      await this.verifyFields();
    } catch (error) {
      console.log("🔧 Creating PageIndex list...");
      await this.createList();
    }
  }

  private async createList(): Promise<void> {
    try {
      // Create the list
      await this.sp.web.lists.add(
        this.listTitle, 
        "Index of SharePoint pages with SPFx web parts and content", 
        100, // Template ID for Generic List
        false, // Enable content types
        { 
          OnQuickLaunch: true,
          Hidden: false,
          EnableVersioning: true
        }
      );

      console.log("List created successfully, adding custom fields...");
      
      // Wait for list to be fully created
      await this.delay(2000);
      
      const list = this.sp.web.lists.getByTitle(this.listTitle);
      
      // Add fields in sequence with proper error handling
      await this.addPageIdField(list);
      await this.delay(500);
      
      await this.addPageUrlField(list);
      await this.delay(500);
      
      await this.addPageTitleField(list);
      await this.delay(500);
      
      await this.addPageContentField(list);
      await this.delay(500);
      
      await this.addTotalWordCountField(list);
      await this.delay(500);
      
      await this.addWebPartsDataField(list);
      await this.delay(500);
      
      await this.addWebPartsCountField(list);
      await this.delay(500);
      
      await this.addLastIndexedField(list);
      await this.delay(500);

      // Create a custom view
      await this.createCustomView(list);

      console.log("PageIndex list and all fields created successfully");
    } catch (error) {
      console.error("Error creating PageIndex list:", error);
      throw error;
    }
  }

  private async verifyFields(): Promise<void> {
    try {
      const list = this.sp.web.lists.getByTitle(this.listTitle);
      const fields = await list.fields.select("InternalName")();
      const fieldNames = fields.map(f => f.InternalName);

      const requiredFields = [
        "PageId", "PageUrl", "PageTitle", "PageContent", 
        "TotalWordCount", "WebPartsData", "WebPartsCount", "LastIndexed"
      ];

      const missingFields = requiredFields.filter(f => fieldNames.indexOf(f) === -1);

      if (missingFields.length > 0) {
        console.log("Adding missing fields:", missingFields);
        
        for (const fieldName of missingFields) {
          await this.addMissingField(list, fieldName);
          await this.delay(500);
        }
      }
    } catch (error) {
      console.error("Error verifying fields:", error);
    }
  }

  private async addMissingField(list: any, fieldName: string): Promise<void> {
    switch (fieldName) {
      case "PageId":
        await this.addPageIdField(list);
        break;
      case "PageUrl":
        await this.addPageUrlField(list);
        break;
      case "PageTitle":
        await this.addPageTitleField(list);
        break;
      case "PageContent":
        await this.addPageContentField(list);
        break;
      case "TotalWordCount":
        await this.addTotalWordCountField(list);
        break;
      case "WebPartsData":
        await this.addWebPartsDataField(list);
        break;
      case "WebPartsCount":
        await this.addWebPartsCountField(list);
        break;
      case "LastIndexed":
        await this.addLastIndexedField(list);
        break;
    }
  }

  private async addPageIdField(list: any): Promise<void> {
    try {
      await list.fields.addText("PageId", {
        Description: "Unique identifier for the page",
        MaxLength: 100,
        Required: true,
        EnforceUniqueValues: true,
        Indexed: true
      });
      console.log("✅ PageId field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding PageId field:", error.message);
      } else {
        console.log("PageId field already exists");
      }
    }
  }

  private async addPageUrlField(list: any): Promise<void> {
    try {
      await list.fields.addUrl("PageUrl", {
        Description: "The URL of the indexed page",
        Required: true,
        DisplayFormat: 0 // Hyperlink
      });
      console.log("✅ PageUrl field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding PageUrl field:", error.message);
      } else {
        console.log("PageUrl field already exists");
      }
    }
  }

  private async addPageTitleField(list: any): Promise<void> {
    try {
      await list.fields.addText("PageTitle", {
        Description: "Title of the page",
        MaxLength: 255,
        Required: false
      });
      console.log("✅ PageTitle field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding PageTitle field:", error.message);
      } else {
        console.log("PageTitle field already exists");
      }
    }
  }

  private async addPageContentField(list: any): Promise<void> {
    try {
      await list.fields.addMultilineText("PageContent", {
        Description: "Extracted page content including web parts",
        NumberOfLines: 25,
        RichText: false,
        AllowHyperlink: false,
        AppendOnly: false,
        Required: false
      });
      console.log("✅ PageContent field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding PageContent field:", error.message);
      } else {
        console.log("PageContent field already exists");
      }
    }
  }

  private async addTotalWordCountField(list: any): Promise<void> {
    try {
      await list.fields.addNumber("TotalWordCount", {
        Description: "Total number of words in page content",
        MinimumValue: 0,
        Required: false
      });
      console.log("✅ TotalWordCount field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding TotalWordCount field:", error.message);
      } else {
        console.log("TotalWordCount field already exists");
      }
    }
  }

  private async addWebPartsDataField(list: any): Promise<void> {
    try {
      await list.fields.addMultilineText("WebPartsData", {
        Description: "JSON data of SPFx web parts found on the page",
        NumberOfLines: 20,
        RichText: false,
        AllowHyperlink: false,
        AppendOnly: false,
        Required: false
      });
      console.log("✅ WebPartsData field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding WebPartsData field:", error.message);
      } else {
        console.log("WebPartsData field already exists");
      }
    }
  }

  private async addWebPartsCountField(list: any): Promise<void> {
    try {
      await list.fields.addNumber("WebPartsCount", {
        Description: "Number of SPFx web parts found on the page",
        MinimumValue: 0,
        Required: false
      });
      console.log("✅ WebPartsCount field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding WebPartsCount field:", error.message);
      } else {
        console.log("WebPartsCount field already exists");
      }
    }
  }

  private async addLastIndexedField(list: any): Promise<void> {
    try {
      await list.fields.addDateTime("LastIndexed", {
        Description: "Date and time when the page was last indexed",
        DisplayFormat: 1, // DateTime
        DateTimeCalendarType: 0, // Gregorian
        Required: false
      });
      console.log("✅ LastIndexed field added");
    } catch (error: any) {
      if (!error.message?.includes("exists") && !error.message?.includes("duplicate")) {
        console.error("Error adding LastIndexed field:", error.message);
      } else {
        console.log("LastIndexed field already exists");
      }
    }
  }

  private async createCustomView(list: any): Promise<void> {
    try {
      await list.views.add(
        "Page Index View",
        false, // Not personal view
        {
          ViewFields: ["Title", "PageId", "PageTitle", "PageUrl", "WebPartsCount", "TotalWordCount", "LastIndexed"],
          RowLimit: 50,
          ViewQuery: "<OrderBy><FieldRef Name='LastIndexed' Ascending='FALSE' /></OrderBy>",
          DefaultView: true
        }
      );
      console.log("✅ Custom view created");
    } catch (error: any) {
      if (!error.message?.includes("exists")) {
        console.log("Could not create custom view (may already exist)");
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async addOrUpdatePageIndex(data: IPageIndexData): Promise<void> {
    try {
      // Check if item exists by PageId
      const items = await this.sp.web.lists
        .getByTitle(this.listTitle)
        .items
        .filter(`PageId eq '${this.escapeODataValue(data.pageId)}'`)
        .select("Id", "PageId")
        .top(1)();

      const itemData: any = {
        Title: this.truncate(data.pageTitle || "Untitled Page", 255),
        PageId: data.pageId,
        PageUrl: {
          Description: this.truncate(data.pageTitle || "Page", 255),
          Url: data.pageUrl
        },
        PageTitle: this.truncate(data.pageTitle || "", 255),
        PageContent: this.truncate(data.pageContent || "No content extracted", 50000),
        TotalWordCount: data.totalWordCount || 0,
        WebPartsData: this.serializeWebParts(data.webParts),
        WebPartsCount: data.webParts?.length || 0,
        LastIndexed: new Date().toISOString()
      };

      console.log("Saving page index:", {
        pageId: itemData.PageId,
        title: itemData.PageTitle,
        url: data.pageUrl,
        wordCount: itemData.TotalWordCount,
        webPartsCount: itemData.WebPartsCount
      });

      if (items.length > 0) {
        await this.sp.web.lists
          .getByTitle(this.listTitle)
          .items
          .getById(items[0].Id)
          .update(itemData);
        console.log("✅ Updated page index for:", data.pageTitle);
      } else {
        await this.sp.web.lists
          .getByTitle(this.listTitle)
          .items
          .add(itemData);
        console.log("✅ Added new page index for:", data.pageTitle);
      }
    } catch (error: any) {
      console.error("Error adding/updating page index:", error.message);
      console.error("Error details:", error);
      throw error;
    }
  }

  private serializeWebParts(webParts: any[]): string {
    if (!webParts || webParts.length === 0) {
      return "[]";
    }
    
    try {
      const simplified = webParts.map(wp => ({
        id: this.sanitize(wp.webPartId),
        title: this.sanitize(wp.webPartTitle || "Unknown"),
        type: this.sanitize(wp.webPartType || "SPFx"),
        instanceId: this.sanitize(wp.instanceId || ""),
        contentPreview: wp.content ? this.truncate(this.sanitize(wp.content), 500) : "",
        hasData: !!wp.data && Object.keys(wp.data).length > 0
      }));
      
      return JSON.stringify(simplified, null, 2);
    } catch (error) {
      console.error("Error serializing web parts:", error);
      return "[]";
    }
  }

  private sanitize(value: any): string {
    if (!value) return "";
    return String(value)
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
      .replace(/[<>]/g, "") // Remove potential HTML
      .trim();
  }

  private truncate(value: string, maxLength: number): string {
    if (!value) return "";
    return value.length > maxLength ? value.substring(0, maxLength - 3) + "..." : value;
  }

  private escapeODataValue(value: string): string {
    return value.replace(/'/g, "''");
  }

  public async getPageIndex(pageId: string): Promise<any> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.listTitle)
        .items
        .filter(`PageId eq '${this.escapeODataValue(pageId)}'`)
        .select("Id", "Title", "PageId", "PageUrl", "PageTitle", "PageContent", "TotalWordCount", "WebPartsData", "WebPartsCount", "LastIndexed")
        .top(1)();

      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error("Error getting page index:", error);
      return null;
    }
  }

  public async getAllPageIndexes(): Promise<any[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle(this.listTitle)
        .items
        .select("Id", "Title", "PageId", "PageUrl", "PageTitle", "TotalWordCount", "WebPartsCount", "LastIndexed")
        .orderBy("LastIndexed", false)
        .top(100)();

      return items;
    } catch (error) {
      console.error("Error getting all page indexes:", error);
      return [];
    }
  }
}