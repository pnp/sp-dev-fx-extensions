import * as React from 'react';
import { logger } from '../Services/LoggerService';
import {
  Card,
  CardHeader,
  CardPreview,
  Text,
  Button,
  MessageBar,
  Spinner,
  Badge,
  tokens,
  Checkbox,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field
} from '@fluentui/react-components';
import { 
  List24Regular, 
  Add24Regular, 
  CheckmarkCircle24Filled,
  ErrorCircle24Filled,
  Warning24Filled,
  Globe24Regular,
  Building24Regular,
  Home24Regular,
  LocalLanguage24Regular
} from '@fluentui/react-icons';
import { useLocalization } from '../Hooks/useLocalization';
import { SiteContextService, ISiteInfo, IAlertListStatus } from '../Services/SiteContextService';
import styles from './ListManagement.module.scss';

export interface IListManagementProps {
  siteContextService: SiteContextService;
  onListCreated?: (siteId: string) => void;
  className?: string;
}

// Available languages for selection
const AVAILABLE_LANGUAGES = [
  { code: 'en-us', name: 'English (US)', nativeName: 'English' },
  { code: 'fr-fr', name: 'French (France)', nativeName: 'Français' },
  { code: 'de-de', name: 'German (Germany)', nativeName: 'Deutsch' },
  { code: 'es-es', name: 'Spanish (Spain)', nativeName: 'Español' },
  { code: 'sv-se', name: 'Swedish (Sweden)', nativeName: 'Svenska' },
  { code: 'fi-fi', name: 'Finnish (Finland)', nativeName: 'Suomi' },
  { code: 'da-dk', name: 'Danish (Denmark)', nativeName: 'Dansk' },
  { code: 'nb-no', name: 'Norwegian (Norway)', nativeName: 'Norsk' }
];

const ListManagement: React.FC<IListManagementProps> = ({
  siteContextService,
  onListCreated,
  className
}) => {
  const { getString } = useLocalization();
  const [sites, setSites] = React.useState<ISiteInfo[]>([]);
  const [listStatuses, setListStatuses] = React.useState<{ [siteId: string]: IAlertListStatus }>({});
  const [loading, setLoading] = React.useState(true);
  const [creatingList, setCreatingList] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedLanguages, setSelectedLanguages] = React.useState<string[]>(['en-us']); // Default to English
  const [languageDialogOpen, setLanguageDialogOpen] = React.useState<{ siteId: string; siteName: string } | null>(null);

  React.useEffect(() => {
    loadSiteInformation();
  }, [siteContextService]);

  const loadSiteInformation = async () => {
    try {
      setLoading(true);
      
      // Get site hierarchy
      const siteHierarchy = siteContextService.getSitesHierarchy();
      setSites(siteHierarchy);

      // Check list status for each site
      const statuses: { [siteId: string]: IAlertListStatus } = {};
      for (const site of siteHierarchy) {
        try {
          statuses[site.id] = await siteContextService.getAlertListStatus(site.id);
        } catch (error) {
          statuses[site.id] = {
            exists: false,
            canAccess: false,
            canCreate: false,
            error: error.message
          };
        }
      }
      setListStatuses(statuses);
    } catch (error) {
      setMessage({
        type: 'error',
        text: getString('FailedToLoadSiteInformation') || 'Failed to load site information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => {
      if (prev.includes(languageCode)) {
        // Don't allow removing English as it's required
        if (languageCode === 'en-us') {
          return prev;
        }
        return prev.filter(code => code !== languageCode);
      } else {
        return [...prev, languageCode];
      }
    });
  };

  const handleOpenLanguageDialog = async (siteId: string, siteName: string) => {
    try {
      // Check if the site already has an alerts list
      const status = listStatuses[siteId];
      if (status?.exists && status?.canAccess) {
        // Load the actual configured languages from the existing list
        const configuredLanguages = await siteContextService.getSupportedLanguagesForSite(siteId);
        setSelectedLanguages(configuredLanguages);
      } else {
        // Reset to default for new lists
        setSelectedLanguages(['en-us']);
      }
      
      setLanguageDialogOpen({ siteId, siteName });
    } catch (error) {
      // Fallback to default if we can't load the configured languages
      setSelectedLanguages(['en-us']);
      setLanguageDialogOpen({ siteId, siteName });
    }
  };

  const handleUpdateLanguages = async (siteId: string, siteName: string) => {
    try {
      setCreatingList(siteId);
      setMessage(null);
      setLanguageDialogOpen(null);

      // Update language support for the existing list
      const { SharePointAlertService } = await import('../Services/SharePointAlertService');
      const alertService = new SharePointAlertService(
        await siteContextService.getGraphClient(),
        siteContextService.getContext()
      );

      // Temporarily override the site context
      const originalSiteId = siteContextService.getContext().pageContext.site.id.toString();
      (siteContextService.getContext().pageContext.site as any).id = { toString: () => siteId };

      try {
        // Add support for newly selected languages
        for (const languageCode of selectedLanguages) {
          if (languageCode !== 'en-us') { // English is already there
            try {
              await alertService.addLanguageSupport(languageCode);
            } catch (langError) {
              logger.warn('ListManagement', `Failed to add language support for ${languageCode}`, langError);
            }
          }
        }
        
        setMessage({
          type: 'success',
          text: getString('LanguagesUpdatedSuccessfully') || `Languages updated successfully for ${siteName}`
        });

        // Refresh site context and list statuses
        await siteContextService.refresh();
        await loadSiteInformation();
      } finally {
        // Restore original site context
        (siteContextService.getContext().pageContext.site as any).id = { toString: () => originalSiteId };
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || getString('FailedToUpdateLanguages') || `Failed to update languages for ${siteName}`
      });
    } finally {
      setCreatingList(null);
    }
  };

  const handleCreateList = async (siteId: string, siteName: string) => {
    try {
      setCreatingList(siteId);
      setMessage(null);
      setLanguageDialogOpen(null);

      // Create the list with selected languages
      const success = await siteContextService.createAlertsList(siteId, selectedLanguages);
      
      if (success) {
        const languagesList = selectedLanguages.length > 1 
          ? ` with support for ${selectedLanguages.length} languages`
          : '';
          
        setMessage({
          type: 'success',
          text: getString('AlertsListCreatedSuccessfully') || `Alerts list created successfully on ${siteName}${languagesList}`
        });

        // Refresh site context and list statuses
        await siteContextService.refresh();
        await loadSiteInformation();
        
        if (onListCreated) {
          onListCreated(siteId);
        }
      } else {
        throw new Error('Creation failed');
      }
    } catch (error) {
      let errorMessage = error.message || getString('FailedToCreateAlertsList') || `Failed to create alerts list on ${siteName}`;
      
      // Provide user-friendly error messages
      if (error.message?.includes('LIST_INCOMPLETE')) {
        errorMessage = `List created on ${siteName} but some features may be limited. ${error.message}`;
      } else if (error.message?.includes('PERMISSION_DENIED')) {
        errorMessage = `Cannot create list on ${siteName}: Insufficient permissions. Contact your SharePoint administrator.`;
      }
      
      setMessage({
        type: error.message?.includes('LIST_INCOMPLETE') ? 'success' : 'error',
        text: errorMessage
      });
    } finally {
      setCreatingList(null);
    }
  };

  const getSiteIcon = (siteType: string) => {
    switch (siteType) {
      case 'home': return <Home24Regular />;
      case 'hub': return <Building24Regular />;
      default: return <Globe24Regular />;
    }
  };

  const getSiteTypeLabel = (siteType: string) => {
    switch (siteType) {
      case 'home': return getString('HomeSite') || 'Home Site';
      case 'hub': return getString('HubSite') || 'Hub Site';
      default: return getString('CurrentSite') || 'Current Site';
    }
  };

  const getSiteDescription = (siteType: string) => {
    switch (siteType) {
      case 'home': return getString('HomeSiteDescription') || 'Alerts shown on all sites in the tenant';
      case 'hub': return getString('HubSiteDescription') || 'Alerts shown on hub and connected sites';
      default: return getString('CurrentSiteDescription') || 'Alerts shown only on this site';
    }
  };

  const getStatusIcon = (status: IAlertListStatus) => {
    if (status.exists && status.canAccess) {
      return <CheckmarkCircle24Filled className={`${styles.statusIcon} ${styles.statusIcon}.success`} />;
    } else if (status.exists && !status.canAccess) {
      return <Warning24Filled className={`${styles.statusIcon} ${styles.statusIcon}.warning`} />;
    } else if (!status.exists && status.canCreate) {
      return <Add24Regular className={`${styles.statusIcon} ${styles.statusIcon}.neutral`} />;
    } else {
      return <ErrorCircle24Filled className={`${styles.statusIcon} ${styles.statusIcon}.error`} />;
    }
  };

  const getStatusText = (status: IAlertListStatus) => {
    if (status.exists && status.canAccess) {
      return getString('ListExistsAndAccessible') || 'List exists and accessible';
    } else if (status.exists && !status.canAccess) {
      return getString('ListExistsNoAccess') || 'List exists but no access';
    } else if (!status.exists && status.canCreate) {
      return getString('ListNotExistsCanCreate') || 'List not found - can create';
    } else {
      return getString('ListNotExistsCannotCreate') || 'List not found - cannot create';
    }
  };

  if (loading) {
    return (
      <div className={`${styles.listManagement} ${className || ''}`}>
        <Card>
          <CardHeader
            image={<List24Regular />}
            header={<Text weight="semibold">{getString('AlertListsManagement') || 'Alert Lists Management'}</Text>}
          />
          <CardPreview>
            <div className={styles.loadingContainer}>
              <Spinner label={getString('LoadingSiteInformation') || 'Loading site information...'} />
            </div>
          </CardPreview>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${styles.listManagement} ${className || ''}`}>
      {message && (
        <MessageBar intent={message.type} className={styles.messageBarWithMargin}>
          {message.text}
        </MessageBar>
      )}

      <Card>
        <CardHeader
          image={<List24Regular />}
          header={<Text weight="semibold">{getString('AlertListsManagement') || 'Alert Lists Management'}</Text>}
          description={
            <Text size={200}>
              {getString('ManageAlertListsDescription') || 'Manage alert lists across your site hierarchy'}
            </Text>
          }
        />
      </Card>

      <div className={styles.sitesGrid}>
        {sites.map(site => {
          const status = listStatuses[site.id];
          if (!status) return null;

          return (
            <Card key={site.id} className={styles.siteCard}>
              <CardHeader
                image={getSiteIcon(site.type)}
                header={
                  <div className={styles.siteHeader}>
                    <Text weight="semibold">{site.name}</Text>
                    <Badge appearance="tint" color="informative">
                      {getSiteTypeLabel(site.type)}
                    </Badge>
                  </div>
                }
                description={<Text size={200}>{getSiteDescription(site.type)}</Text>}
              />
              
              <CardPreview>
                <div className={styles.siteStatus}>
                  <div className={styles.statusInfo}>
                    <div className={styles.statusIndicator}>
                      {getStatusIcon(status)}
                      <Text>{getStatusText(status)}</Text>
                    </div>
                    
                    {status.error && (
                      <Text size={200} className={styles.errorText}>
                        {status.error}
                      </Text>
                    )}
                  </div>

                  {!status.exists && status.canCreate && (
                    <div className={styles.createActions}>
                      <Dialog open={!!languageDialogOpen && languageDialogOpen.siteId === site.id}>
                        <DialogTrigger disableButtonEnhancement>
                          <Button
                            appearance="primary"
                            icon={<Add24Regular />}
                            onClick={() => handleOpenLanguageDialog(site.id, site.name)}
                            disabled={creatingList === site.id}
                          >
                            {creatingList === site.id 
                              ? (getString('CreatingList') || 'Creating...')
                              : (getString('CreateAlertsList') || 'Create Alerts List')
                            }
                          </Button>
                        </DialogTrigger>
                        <DialogSurface>
                          <DialogBody>
                            <DialogTitle>
                              <LocalLanguage24Regular className={styles.languageDialogIcon} />
                              {getString('SelectLanguagesForList') || 'Select Languages for Alert List'}
                            </DialogTitle>
                            <DialogContent>
                              <Text>
                                {getString('SelectLanguagesDescription') || 
                                  `Choose which languages to support for alerts on ${site.name}. English is required and will always be included.`
                                }
                              </Text>
                              
                              <div className={`${styles.languageGrid} ${styles.languageGridWithMargin}`}>
                                {AVAILABLE_LANGUAGES.map(language => (
                                  <Field key={language.code}>
                                    <Checkbox
                                      checked={selectedLanguages.includes(language.code)}
                                      onChange={() => handleLanguageToggle(language.code)}
                                      disabled={language.code === 'en-us'} // English is always required
                                      label={
                                        <div className={styles.languageLabel}>
                                          <Text weight="semibold">{language.nativeName}</Text>
                                          <Text size={200}>{language.name}</Text>
                                        </div>
                                      }
                                    />
                                  </Field>
                                ))}
                              </div>
                              
                              <div className={styles.languageSelectionSummary}>
                                <Text size={200}>
                                  <strong>{getString('SelectedLanguages') || 'Selected languages'}:</strong> {selectedLanguages.length} 
                                  ({AVAILABLE_LANGUAGES
                                    .filter(lang => selectedLanguages.includes(lang.code))
                                    .map(lang => lang.nativeName)
                                    .join(', ')})
                                </Text>
                              </div>
                            </DialogContent>
                            <DialogActions>
                              <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary" onClick={() => setLanguageDialogOpen(null)}>
                                  {getString('Cancel') || 'Cancel'}
                                </Button>
                              </DialogTrigger>
                              <Button 
                                appearance="primary" 
                                onClick={() => languageDialogOpen && handleCreateList(languageDialogOpen.siteId, languageDialogOpen.siteName)}
                                disabled={creatingList === site.id}
                              >
                                {creatingList === site.id 
                                  ? (getString('CreatingList') || 'Creating...')
                                  : (getString('CreateWithSelectedLanguages') || `Create with ${selectedLanguages.length} languages`)
                                }
                              </Button>
                            </DialogActions>
                          </DialogBody>
                        </DialogSurface>
                      </Dialog>
                    </div>
                  )}

                  {status.exists && status.canAccess && (
                    <div className={styles.listInfo}>
                      <Text size={200} className={styles.successText}>
                        ✓ {getString('ReadyForAlerts') || 'Ready for alerts'}
                      </Text>
                      <div className={styles.existingListActions}>
                        <Dialog open={!!languageDialogOpen && languageDialogOpen.siteId === site.id}>
                          <DialogTrigger disableButtonEnhancement>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={<LocalLanguage24Regular />}
                              onClick={() => handleOpenLanguageDialog(site.id, site.name)}
                            >
                              {getString('ViewEditLanguages') || 'Languages'}
                            </Button>
                          </DialogTrigger>
                          <DialogSurface>
                            <DialogBody>
                              <DialogTitle>
                                <LocalLanguage24Regular className={styles.languageDialogIcon} />
                                {getString('ManageLanguagesForList') || 'Manage Languages for Alert List'}
                              </DialogTitle>
                              <DialogContent>
                                <Text>
                                  {getString('ManageLanguagesDescription') || 
                                    `Manage which languages are supported for alerts on ${site.name}. English is required and will always be included.`
                                  }
                                </Text>
                                
                                <div className={`${styles.languageGrid} ${styles.languageGridWithMargin}`}>
                                  {AVAILABLE_LANGUAGES.map(language => (
                                    <Field key={language.code}>
                                      <Checkbox
                                        checked={selectedLanguages.includes(language.code)}
                                        onChange={() => handleLanguageToggle(language.code)}
                                        disabled={language.code === 'en-us'} // English is always required
                                        label={
                                          <div className={styles.languageLabel}>
                                            <Text weight="semibold">{language.nativeName}</Text>
                                            <Text size={200}>{language.name}</Text>
                                          </div>
                                        }
                                      />
                                    </Field>
                                  ))}
                                </div>
                                
                                <div className={styles.languageSelectionSummary}>
                                  <Text size={200}>
                                    <strong>{getString('SelectedLanguages') || 'Selected languages'}:</strong> {selectedLanguages.length} 
                                    ({AVAILABLE_LANGUAGES
                                      .filter(lang => selectedLanguages.includes(lang.code))
                                      .map(lang => lang.nativeName)
                                      .join(', ')})
                                  </Text>
                                </div>
                              </DialogContent>
                              <DialogActions>
                                <DialogTrigger disableButtonEnhancement>
                                  <Button appearance="secondary" onClick={() => setLanguageDialogOpen(null)}>
                                    {getString('Cancel') || 'Cancel'}
                                  </Button>
                                </DialogTrigger>
                                <Button 
                                  appearance="primary" 
                                  onClick={() => languageDialogOpen && handleUpdateLanguages(languageDialogOpen.siteId, languageDialogOpen.siteName)}
                                  disabled={creatingList === site.id}
                                >
                                  {getString('UpdateLanguages') || 'Update Languages'}
                                </Button>
                              </DialogActions>
                            </DialogBody>
                          </DialogSurface>
                        </Dialog>
                      </div>
                    </div>
                  )}
                </div>
              </CardPreview>
            </Card>
          );
        })}
      </div>

      <Card className={styles.hierarchyInfo}>
        <CardHeader
          header={<Text weight="semibold">{getString('AlertHierarchy') || 'Alert Display Hierarchy'}</Text>}
        />
        <CardPreview>
          <div className={styles.hierarchyDescription}>
            <Text size={200}>
              {getString('AlertHierarchyDescription') || 
                'Alerts are displayed based on site hierarchy: Home Site alerts appear everywhere, Hub Site alerts appear on hub and connected sites, and Site alerts appear only on the specific site.'}
            </Text>
            
            <div className={styles.hierarchyList}>
              <div className={styles.hierarchyItem}>
                <Home24Regular />
                <Text size={200}><strong>{getString('HomeSite') || 'Home Site'}:</strong> {getString('HomeSiteScope') || 'Shown on all sites'}</Text>
              </div>
              <div className={styles.hierarchyItem}>
                <Building24Regular />
                <Text size={200}><strong>{getString('HubSite') || 'Hub Site'}:</strong> {getString('HubSiteScope') || 'Shown on hub and connected sites'}</Text>
              </div>
              <div className={styles.hierarchyItem}>
                <Globe24Regular />
                <Text size={200}><strong>{getString('CurrentSite') || 'Site'}:</strong> {getString('SiteScope') || 'Shown only on this site'}</Text>
              </div>
            </div>
          </div>
        </CardPreview>
      </Card>
    </div>
  );
};

export default ListManagement;