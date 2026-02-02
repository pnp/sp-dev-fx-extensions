/**
 * Utility functions for icon mapping
 */

/**
 * Get icon name based on URL content type
 */
export const getContentIconFromUrl = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('mail') || lowerUrl.includes('outlook')) return 'Mail';
  if (lowerUrl.includes('teams.microsoft.com/l/message') || lowerUrl.includes('chat')) return 'Chat';
  if (lowerUrl.includes('teams.microsoft.com/l/meeting') || lowerUrl.includes('calendar')) return 'Calendar';
  if (lowerUrl.includes('sharepoint') || lowerUrl.includes('onedrive') || lowerUrl.includes('.docx') || lowerUrl.includes('.xlsx') || lowerUrl.includes('.pdf')) return 'Document';
  return 'Link';
};

/**
 * Get icon name for user role
 */
export const getRoleIcon = (role: string): string => {
  switch (role) {
    case 'Action Required': return 'AlertSolid';
    case 'Author': return 'EditCreate';
    case 'Directly Involved': return 'Link';
    case 'Aware': return 'View';
    default: return 'ContactInfo';
  }
};

/**
 * Get icon name for timeline source
 */
export const getSourceIcon = (source: string): string => {
  switch (source) {
    case 'Email': return 'Mail';
    case 'Teams': return 'TeamsLogo';
    case 'Meeting': return 'Calendar';
    case 'Document': return 'Document';
    case 'Page': return 'Page';
    default: return 'Info';
  }
};

/**
 * Role definitions with icons and descriptions
 */
export const ROLE_DEFINITIONS = [
  { role: 'Action Required', icon: 'AlertSolid', description: 'Something requires your action' },
  { role: 'Author', icon: 'EditCreate', description: 'You created this content' },
  { role: 'Directly Involved', icon: 'Link', description: 'You are mentioned or participate in related activities' },
  { role: 'Aware', icon: 'View', description: 'No direct involvement found' }
];
