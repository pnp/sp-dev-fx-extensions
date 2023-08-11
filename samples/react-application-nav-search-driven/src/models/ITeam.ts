import { IOwner } from './IOwner';

export interface ITeam {
  id: string;
  displayName: string;
  url: string;
  photo: string;
  visibility: string;
  members: number;
  owners: IOwner[];
  description: string;
  confidentiality?: string;
  mailNickname?: string;
  createdDateTime: string;
  teamUrl: string; 
}