export interface IMessageBannerProperties {
  message: string;
  textColor: string;
  backgroundColor: string;
  textFontSizePx: number;
  bannerHeightPx: number;
  visibleStartDate: string;
  enableSetPreAllocatedTopHeight: boolean;
  disableSiteAdminUI: boolean;
}



export const DEFAULT_PROPERTIES: IMessageBannerProperties = {
  message: "This is a sample banner message. Click the edit icon on the right side to update the banner settings.",
  textColor: "#000000",
  backgroundColor: "#ffffc6",
  textFontSizePx: 16,
  bannerHeightPx: 30,
  visibleStartDate: null,
  enableSetPreAllocatedTopHeight: false,
  disableSiteAdminUI: false,
};
