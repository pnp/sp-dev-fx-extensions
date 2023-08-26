import { IDisruption } from "."

export interface ILineStatuses {
    id?: number
    lineId: string
    statusSeverity: number
    statusSeverityDescription: string
    reason: string
    created: string
    disruption?: IDisruption
  }