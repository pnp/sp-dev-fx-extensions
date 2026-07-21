export interface IUserProfile {
  displayName: string;
  avatarUrl?: string;
  jobTitle?: string;
  department?: string;
}

export interface ISearchResult {
  title: string;
  url: string;
  description?: string;
}

export interface IQuickAction {
  id: string;
  label: string;
  url: string;
  iconName: string;
  target?: '_blank' | '_self';
}

export interface IAppLauncherItem {
  id: string;
  label: string;
  url: string;
  iconName: string;
  group?: string;
}

export interface ILanguageOption {
  code: string;
  label: string;
  shortLabel: string;
}

export interface INotification {
  id: string;
  title: string;
  url?: string;
  isRead: boolean;
  createdAt: string;
}

export interface IBookmark {
  id: string;
  title: string;
  url: string;
}
