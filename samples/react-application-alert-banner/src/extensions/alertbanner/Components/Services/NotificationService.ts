import { IAlertItem, NotificationType } from "../Alerts/IAlerts";
import { MSGraphClientV3 } from "@microsoft/sp-http";

export class NotificationService {
  private static instance: NotificationService;
  private graphClient: MSGraphClientV3;
  private hasNotificationPermission: boolean = false;

  private constructor(graphClient: MSGraphClientV3) {
    this.graphClient = graphClient;
    this.checkNotificationPermission();
  }

  public static getInstance(graphClient: MSGraphClientV3): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(graphClient);
    }
    return NotificationService.instance;
  }

  private async checkNotificationPermission(): Promise<void> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      this.hasNotificationPermission = true;
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.hasNotificationPermission = permission === "granted";
    }
  }

  public async sendNotification(alert: IAlertItem): Promise<void> {
    if (!alert.notificationType || alert.notificationType === NotificationType.None) {
      return;
    }

    const promises: Promise<void>[] = [];

    // Send browser notification if enabled
    if ((alert.notificationType === NotificationType.Browser || 
         alert.notificationType === NotificationType.Both) && 
        this.hasNotificationPermission) {
      promises.push(this.sendBrowserNotification(alert));
    }

    // Send email notification if enabled
    if (alert.notificationType === NotificationType.Email || 
        alert.notificationType === NotificationType.Both) {
      promises.push(this.sendEmailNotification(alert));
    }

    await Promise.all(promises);
  }

  private async sendBrowserNotification(alert: IAlertItem): Promise<void> {
    try {
      if (!this.hasNotificationPermission) {
        await this.checkNotificationPermission();
        if (!this.hasNotificationPermission) return;
      }

      const priorityIcons = {
        low: "📢",
        medium: "ℹ️",
        high: "⚠️",
        critical: "🚨"
      };

      const icon = priorityIcons[alert.priority] || "📢";
      
      const notification = new Notification(`${icon} ${alert.title}`, {
        body: this.stripHtml(alert.description),
        icon: "/sites/home/SiteAssets/alert-icon.png", // Replace with actual path to icon
        tag: `alert-${alert.Id}`, // Prevents duplicate notifications
        requireInteraction: alert.priority === "critical" // Critical alerts require user interaction
      });

      notification.onclick = () => {
        window.focus();
        if (alert.link?.Url) {
          window.open(alert.link.Url, "_blank");
        }
        notification.close();
      };
    } catch (error) {
      console.error("Error sending browser notification:", error);
    }
  }

  private async sendEmailNotification(alert: IAlertItem): Promise<void> {
    try {
      // Use MS Graph to send email
      await this.graphClient.api('/me/sendMail').post({
        message: {
          subject: `Alert: ${alert.title}`,
          body: {
            contentType: "HTML",
            content: `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <h2 style="color: #333;">${alert.title}</h2>
              <div>${alert.description}</div>
              ${alert.link ? `<p><a href="${alert.link.Url}">${alert.link.Description}</a></p>` : ''}
              <p style="color: #666; font-size: 12px;">This is an automated alert from the SharePoint alerts system.</p>
            </div>`
          },
          toRecipients: [
            {
              emailAddress: {
                address: "me" // Sends to the current user
              }
            }
          ]
        }
      });
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  // Helper method to strip HTML for notification body
  private stripHtml(html: string): string {
    // Create a temporary element to parse HTML without rendering
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
    
    // Alternative approach would be to use Text component programmatically
    // but that would require setting up a React rendering context
  }
}

export default NotificationService;