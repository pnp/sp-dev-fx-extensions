import { useCallback, useMemo } from 'react';

import fallbackIcon from './../assets/microsoft-365.svg';
import microsoft365 from './../assets/microsoft-365.svg';
import microsoftBookings from './../assets/microsoft-bookings.svg';
import microsoftClipchamp from './../assets/microsoft-clipchamp.svg';
import microsoftCopilot from './../assets/microsoft-copilot.svg';
import microsoftDynamics from './../assets/microsoft-dynamics.svg';
import microsoftExchange from './../assets/microsoft-exchange.svg';
import microsoftForms from './../assets/microsoft-forms.svg';
import microsoftOneDrive from './../assets/microsoft-onedrive.svg';
import microsoftPlanner from './../assets/microsoft-planner.svg';
import microsoftPowerApps from './../assets/microsoft-power-apps.svg';
import microsoftProject from './../assets/microsoft-project.svg';
import microsoftPurview from './../assets/microsoft-purview.svg';
import microsoftSharePoint from './../assets/microsoft-sharepoint.svg';
import microsoftStream from './../assets/microsoft-stream.svg';
import microsoftSway from './../assets/microsoft-sway.svg';
import microsoftTeams from './../assets/microsoft-teams.svg';
import powerApps from './../assets/power-apps.svg';
import powerBi from './../assets/power-bi.svg';
import windowsDefender from './../assets/windows-defender.svg';

// SVG Imports
 


// Define service name union type
export type ServiceName =
  | 'Exchange Online'
  | 'Microsoft Entra'
  | 'Microsoft 365 suite'
  | 'SharePoint Online'
  | 'Dynamics 365 Apps'
  | 'Mobile Device Management for Office 365'
  | 'Planner'
  | 'Sway'
  | 'Power BI'
  | 'OneDrive for Business'
  | 'Microsoft Teams'
  | 'Microsoft Bookings'
  | 'Microsoft 365 for the web'
  | 'Microsoft 365 apps'
  | 'Power Apps'
  | 'Power Apps in Microsoft 365'
  | 'Microsoft Power Automate'
  | 'Microsoft Power Automate in Microsoft 365'
  | 'Microsoft Forms'
  | 'Microsoft Defender XDR'
  | 'Project for the web'
  | 'Microsoft Stream'
  | 'Microsoft Viva'
  | 'Power Platform'
  | 'Microsoft Copilot (Microsoft 365)'
  | 'Microsoft Purview'
  | 'Microsoft Clipchamp';

type ServiceIconMap = Record<ServiceName, string>;

export interface UseServiceIconsResult {
    getServiceImage: (serviceName: ServiceName) => string;
    serviceImageMap: ServiceIconMap;
}

export const useServiceIcons = (): UseServiceIconsResult => {
    const serviceImageMap: ServiceIconMap = useMemo(() => ({
        'Exchange Online': microsoftExchange,
        'Microsoft Entra': microsoft365,
        'Microsoft 365 suite': microsoft365,
        'SharePoint Online': microsoftSharePoint,
        'Dynamics 365 Apps': microsoftDynamics,
        'Mobile Device Management for Office 365': windowsDefender,
        'Planner': microsoftPlanner,
        'Sway': microsoftSway,
        'Power BI': powerBi,
        'OneDrive for Business': microsoftOneDrive,
        'Microsoft Teams': microsoftTeams,
        'Microsoft Bookings': microsoftBookings,
        'Microsoft 365 for the web': microsoft365,
        'Microsoft 365 apps': microsoft365,
        'Power Apps': microsoftPowerApps,
        'Power Apps in Microsoft 365': powerApps,
        'Microsoft Power Automate': powerApps,
        'Microsoft Power Automate in Microsoft 365': powerApps,
        'Microsoft Forms': microsoftForms,
        'Microsoft Defender XDR': windowsDefender,
        'Project for the web': microsoftProject,
        'Microsoft Stream': microsoftStream,
        'Microsoft Viva': microsoft365,
        'Power Platform': microsoftPowerApps,
        'Microsoft Copilot (Microsoft 365)': microsoftCopilot,
        'Microsoft Purview': microsoftPurview,
        'Microsoft Clipchamp': microsoftClipchamp
    }), []);

    const getServiceImage = useCallback(
        (serviceName: ServiceName): string =>
            serviceImageMap[serviceName] ?? fallbackIcon,
        [serviceImageMap]
    );

    return { getServiceImage, serviceImageMap };
};