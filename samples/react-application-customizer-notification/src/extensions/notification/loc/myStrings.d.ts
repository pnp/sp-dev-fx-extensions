declare interface INotificationApplicationCustomizerStrings {
	Title: string;
	NoPropertiesProvided: string;
	MessagePrefix: string;
	ItemTitle: string;
	EditedBy: string;
}

declare module 'NotificationApplicationCustomizerStrings' {
  const strings: INotificationApplicationCustomizerStrings;
  export = strings;
}
