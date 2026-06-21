export interface InspectionError {
  scope: "web" | "library" | "group" | "export" | "unknown";
  message: string;
  technicalMessage?: string;
  statusCode?: number;
  recoverable: boolean;
}
