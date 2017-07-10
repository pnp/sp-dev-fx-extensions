/** Describes a Toast, Delicious! */
export interface IToast {
	Id: number;
	Severity: string;
	Title: string;
	Message: string;
	Frequency: string;
	Enabled: boolean;
}