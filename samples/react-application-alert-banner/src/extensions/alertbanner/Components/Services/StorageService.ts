import { IAlertItem } from "../Alerts/IAlerts";

export interface IStorageOptions {
  expirationTime?: number; // In milliseconds
  userSpecific?: boolean; // Whether to prefix with user ID
}

export class StorageService {
  private static instance: StorageService;
  private userId: string | null = null;
  private defaultExpirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public setUserId(userId: string): void {
    this.userId = userId;
  }

  // Local Storage (Persistent)
  public saveToLocalStorage<T>(key: string, data: T, options?: IStorageOptions): void {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      const storageData = {
        data,
        timestamp: Date.now(),
        expiration: options?.expirationTime || this.defaultExpirationTime
      };

      localStorage.setItem(fullKey, JSON.stringify(storageData));
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  public getFromLocalStorage<T>(key: string, options?: IStorageOptions): T | null {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      const data = localStorage.getItem(fullKey);

      if (!data) return null;

      const parsedData = JSON.parse(data);

      // Check if data has expired
      if (this.isDataExpired(parsedData)) {
        this.removeFromLocalStorage(key, options);
        return null;
      }

      return parsedData.data as T;
    } catch (error) {
      // Silent fail for storage operations
      return null;
    }
  }

  public removeFromLocalStorage(key: string, options?: IStorageOptions): void {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      localStorage.removeItem(fullKey);
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  // Session Storage (Session-based)
  public saveToSessionStorage<T>(key: string, data: T, options?: IStorageOptions): void {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      const storageData = {
        data,
        timestamp: Date.now()
      };

      sessionStorage.setItem(fullKey, JSON.stringify(storageData));
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  public getFromSessionStorage<T>(key: string, options?: IStorageOptions): T | null {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      const data = sessionStorage.getItem(fullKey);

      if (!data) return null;

      const parsedData = JSON.parse(data);
      return parsedData.data as T;
    } catch (error) {
      // Silent fail for storage operations
      return null;
    }
  }

  public removeFromSessionStorage(key: string, options?: IStorageOptions): void {
    try {
      const fullKey = this.getFullKey(key, options?.userSpecific);
      sessionStorage.removeItem(fullKey);
    } catch (error) {
      // Silent fail for storage operations
    }
  }

  // Alert-specific methods
  public saveAlerts(alerts: IAlertItem[]): void {
    this.saveToLocalStorage<IAlertItem[]>("AllAlerts", alerts, {
      expirationTime: this.defaultExpirationTime
    });
  }

  public getAlerts(): IAlertItem[] | null {
    return this.getFromLocalStorage<IAlertItem[]>("AllAlerts");
  }

  public saveDismissedAlerts(alertIds: number[]): void {
    this.saveToSessionStorage<number[]>("DismissedAlerts", alertIds, {
      userSpecific: true
    });
  }

  public getDismissedAlerts(): number[] {
    return this.getFromSessionStorage<number[]>("DismissedAlerts", {
      userSpecific: true
    }) || [];
  }

  public saveHiddenAlerts(alertIds: number[]): void {
    this.saveToLocalStorage<number[]>("HiddenAlerts", alertIds, {
      userSpecific: true
    });
  }

  public getHiddenAlerts(): number[] {
    return this.getFromLocalStorage<number[]>("HiddenAlerts", {
      userSpecific: true
    }) || [];
  }

  public clearAllAlertData(): void {
    this.removeFromLocalStorage("AllAlerts");
    this.removeFromSessionStorage("DismissedAlerts", { userSpecific: true });
    this.removeFromLocalStorage("HiddenAlerts", { userSpecific: true });
  }

  // Helper methods
  private getFullKey(key: string, userSpecific?: boolean): string {
    const prefix = "AlertsBanner_";
    const userPrefix = userSpecific && this.userId ? `${this.userId}_` : "";
    return `${prefix}${userPrefix}${key}`;
  }

  private isDataExpired(storageData: any): boolean {
    if (!storageData.timestamp || !storageData.expiration) return false;

    const now = Date.now();
    const expirationTime = storageData.timestamp + storageData.expiration;

    return now > expirationTime;
  }
}

export default StorageService;