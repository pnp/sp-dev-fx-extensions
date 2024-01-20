import { ILineStatuses } from "."

export interface ILine {
    id?: string
    name: string
    modeName: string
    disruptions?: any[]
    created: string
    modified: string
    lineStatuses: ILineStatuses[]
}