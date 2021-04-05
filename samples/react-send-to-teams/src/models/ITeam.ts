import { Team } from '@microsoft/microsoft-graph-types';

export interface ITeam {
  id: string;
  createdDateTime?: string;
  displayName: string;
  description: string;
  internalId?: string;
  classification?: string;
  specialization?: any;
  visibility?: any;
  webUrl?: string;
  isArchived: boolean;
  isMembershipLimitedToOwners?: any;
  memberSettings?: any;
  guestSettings?: any;
  messagingSettings?: any;
  funSettings?: any;
  discoverySettings?: any;
}

