import * as React from 'react';
import type { IArchiveOverviewProps, IArchivedDocument, IArchivedDocumentsResponse, IDocumentLibrary } from './IArchiveOverviewProps';
import { 
  Spinner, 
  SpinnerSize, 
  MessageBar, 
  MessageBarType,
  DetailsList,
  DetailsListLayoutMode,
  IColumn,
  SelectionMode,
  Link,
  Stack,
  Text,
  SearchBox,
  Dropdown,
  IDropdownOption,
  PrimaryButton
} from '@fluentui/react';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';
import { AZURE_FUNCTION_URL, AZURE_FUNCTION_APP_ID } from '../../../config';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const styles = require('./ArchiveOverview.module.scss');

export interface IArchiveOverviewState {
  archivedDocuments: IArchivedDocument[];
  documentLibraries: IDocumentLibrary[];
  loading: boolean;
  error: string | undefined;
  searchText: string;
  selectedLibrary: string;
  filteredDocuments: IArchivedDocument[];
}

export default class ArchiveOverview extends React.Component<IArchiveOverviewProps, IArchiveOverviewState> {
  
  constructor(props: IArchiveOverviewProps) {
    super(props);
    
    this.state = {
      archivedDocuments: [],
      documentLibraries: [],
      loading: false,
      error: undefined,
      searchText: '',
      selectedLibrary: '',
      filteredDocuments: []
    };
  }

  public componentDidMount(): void {
    this._loadArchivedDocuments().catch(console.error);
  }

  public componentDidUpdate(prevProps: IArchiveOverviewProps): void {
    if (prevProps.siteUrl !== this.props.siteUrl) {
      this._loadArchivedDocuments().catch(console.error);
    }
  }

  private _loadArchivedDocuments = async (): Promise<void> => {
    
    this.setState({ loading: true, error: undefined });

    try {
      const url = `${AZURE_FUNCTION_URL}/api/ShowMovedDocuments?SiteURL=${encodeURIComponent(this.props.siteUrl)}`;
      
      const client: AadHttpClient = await this.props.context.aadHttpClientFactory.getClient(AZURE_FUNCTION_APP_ID);
      const response: HttpClientResponse = await client.get(url, AadHttpClient.configurations.v1);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: IArchivedDocumentsResponse = await response.json();
      console.log('Fetched archived documents count:', data.movedDocuments.length);

      this.setState({
        archivedDocuments: data.movedDocuments || [],
        documentLibraries: data.documentLibraries || [],
        filteredDocuments: data.movedDocuments || [],
        loading: false
      });
    } catch (error) {
      console.error('Error loading archived documents:', error);
      this.setState({
        error: `Error loading archived documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        loading: false
      });
    }
  };

  private _onSearchTextChanged = (searchText: string): void => {
    this.setState({ searchText }, this._filterDocuments);
  };

  private _onLibraryChanged = (option?: IDropdownOption): void => {
    console.log('Selected library key:', option?.key);
    this.setState({ selectedLibrary: option?.key as string || '' }, this._filterDocuments);
  };

  private _filterDocuments = (): void => {
    const { archivedDocuments, searchText, selectedLibrary } = this.state;
    
    let filtered = archivedDocuments;

    // Filter by library
    if (selectedLibrary && selectedLibrary.length > 0 ) {
      console.log('Filtering by library:', selectedLibrary);
      filtered = filtered.filter(doc => doc.libraryName === selectedLibrary);
    }

    // Filter by search text
    if (searchText) {
      console.log('Filtering by search text:', searchText);
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().indexOf(searchLower) !== -1 ||
        doc.fileName.toLowerCase().indexOf(searchLower) !== -1 ||
        (doc.description && doc.description.toLowerCase().indexOf(searchLower) !== -1) ||
        doc.archivedBy.toLowerCase().indexOf(searchLower) !== -1
      );
    }

    this.setState({ filteredDocuments: filtered });
  };

  private _getColumns = (): IColumn[] => {
    return [
      {
        key: 'title',
        name: 'Title',
        fieldName: 'title',
        minWidth: 200,
        maxWidth: 300,
        isResizable: true,
        onRender: (item: IArchivedDocument) => (
          <Link href={item.blobUrl} target="_blank" rel="noopener noreferrer">
            {item.title}
          </Link>
        )
      },
      {
        key: 'fileName',
        name: 'File Name',
        fieldName: 'fileName',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true
      },
      {
        key: 'libraryName',
        name: 'Library',
        fieldName: 'libraryName',
        minWidth: 120,
        maxWidth: 150,
        isResizable: true
      },
      {
        key: 'fileSize',
        name: 'Size',
        fieldName: 'fileSize',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
        onRender: (item: IArchivedDocument) => this._formatFileSize(item.fileSize)
      },
      {
        key: 'archivedDate',
        name: 'Moved Date',
        fieldName: 'archivedDate',
        minWidth: 120,
        maxWidth: 150,
        isResizable: true,
        onRender: (item: IArchivedDocument) => new Date(item.archivedDate).toLocaleDateString()
      }
    ];
  };

  private _formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  private _getLibraryOptions = (): IDropdownOption[] => {
    const { documentLibraries } = this.state;
    const options: IDropdownOption[] = [
      { key: '', text: 'All Libraries' }
    ];
    
    documentLibraries.forEach(lib => {
      options.push({ key: lib.rootFolderName, text: lib.title });
    });
    
    return options;
  };

  public render(): React.ReactElement<IArchiveOverviewProps> {
    const { loading, error, filteredDocuments, searchText, selectedLibrary } = this.state;
    const { hasTeamsContext } = this.props;

    return (
      <section className={`${styles.archiveOverview} ${hasTeamsContext ? styles.teams : ''}`}>
        <Stack tokens={{ childrenGap: 20 }}>
          <Stack.Item>
            <Text variant="xxLarge" as="h1">Moved Documents Overview</Text><br />
            <Text variant="medium">View and manage moved documents from this SharePoint site</Text>
          </Stack.Item>

          {error && (
            <Stack.Item>
              <MessageBar messageBarType={MessageBarType.error}>
                {error}
              </MessageBar>
            </Stack.Item>
          )}

          <Stack.Item className={styles.searchSection}>
            <Stack horizontal tokens={{ childrenGap: 20 }} verticalAlign="end">
              <Stack.Item grow>
                <SearchBox
                  placeholder="Search documents..."
                  value={searchText}
                  onChange={(_, newValue) => this._onSearchTextChanged(newValue || '')}
                />
              </Stack.Item>
              <Stack.Item>
                <Dropdown
                  placeholder="Filter by library"
                  options={this._getLibraryOptions()}
                  selectedKey={selectedLibrary}
                  onChange={(_, option) => this._onLibraryChanged(option)}
                  styles={{ dropdown: { minWidth: 200 } }}
                />
              </Stack.Item>
              <Stack.Item>
                <PrimaryButton
                  text="Refresh"
                  onClick={this._loadArchivedDocuments}
                  disabled={loading}
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>

          <Stack.Item>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner size={SpinnerSize.large} label="Loading archived documents..." />
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className={styles.emptyState}>
                <Text variant="large">No moved documents found</Text>
               
              </div>
            ) : (
              <>
                <Text variant="medium">
                  {filteredDocuments.length} archived document{filteredDocuments.length !== 1 ? 's' : ''} found
                </Text>
                <div className={styles.documentsTable}>
                  <DetailsList
                    items={filteredDocuments}
                    columns={this._getColumns()}
                    layoutMode={DetailsListLayoutMode.justified}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={true}
                    enterModalSelectionOnTouch={true}
                  />
                </div>
              </>
            )}
          </Stack.Item>
        </Stack>
      </section>
    );
  }
}
