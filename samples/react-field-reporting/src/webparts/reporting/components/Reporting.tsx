import * as React from 'react';
import styles from './Reporting.module.scss';
import type { IReportingProps } from './IReportingProps';
import { Chart } from "react-google-charts";
import { DataTable, DataTableFilterMeta, DataTableFilterMetaData, DataTableStateEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AppInsightService from '../../../services/AppInsightService';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { TabView, TabPanel } from 'primereact/tabview';
import { LogEvent } from '../types/ComponentTypes';




export const options = {
  title: "Docments accessed by date",
};

const Reporting: React.FC<IReportingProps> = (
  {
    hasTeamsContext,
  }) => {
  const [logEvents, setLogEvents] = React.useState<LogEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    docName: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  });

  //Charts
  const [chartData, setChartData] = React.useState<(string | number)[][]>([]);


  const formatDateToFriendly = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toTimeString().split(' ')[0];
    return `${formattedDate} ${formattedTime}`;
};

  const handleFilterChange = (e: DataTableStateEvent): void => {
    setFilters(e.filters);
  }

  const onGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value;
    const _filters: DataTableFilterMeta = { ...filters as DataTableFilterMeta };

    const globalFilter = _filters.global as DataTableFilterMetaData;
    if (globalFilter) {
      globalFilter.value = value;
    }
    setFilters(_filters);
  };

  const renderHeader = (): JSX.Element => {
    const globalFilter = filters.global as DataTableFilterMetaData;
    const value = globalFilter ? globalFilter.value : '';

    return (
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText type="search" value={value || ''} onChange={(e) => onGlobalFilterChange(e)} placeholder="Search..." />
      </IconField>
    );
  };

  const processDataForPieChart = (events: LogEvent[]): (string | number)[][] => {
    const aggregatedData = new Map<string, number>();
  
    // Aggregate ItemCount by LastAccessed
    events.forEach(event => {
      const { LastAccessed, ItemCount } = event;
      const currentCount = aggregatedData.get(LastAccessed) || 0;
      aggregatedData.set(LastAccessed, currentCount + ItemCount);
    });
  
    // Prepare data for pie chart
    const pieChartData = Array.from(aggregatedData, ([date, itemCount]) => [date, itemCount]);
    pieChartData.unshift(["Date", "ItemCount"]); // Adding header for pie chart data
  
    return pieChartData;
  }


  React.useEffect(() => {
    // Define an async function inside the useEffect
    const fetchLoggedEvents = async (): Promise<void> => {
      try {
        const results = await AppInsightService.getLoggedEvents();
        console.log(results);
        //if (results.length > 0) then map the results and set the state of the logEvents according to LogEvent type
        if (results.length > 0) {

          const processedEvents = results.map(result => ({
            ClientType: result.client_Type,
            ClientBrowser: result.client_Browser,
            ClientOS: result.client_OS,
            ClientCity: result.client_City,
            ClientCountry: result.client_CountryOrRegion,
            Title: result.customDimensions.Title,
            DocId: result.customDimensions.DocId,
            DocName: result.customDimensions.DocName,
            DocURL: result.customDimensions.DocURL,
            UserName: result.customDimensions.UserName,
            UserEmail: result.customDimensions.UserEmail,
            ListURL: result.customDimensions.ListURL,
            LastAccessed: formatDateToFriendly(result.customDimensions.LastAccessed),
            ItemCount: result.itemCount
          }));
          setLogEvents(processedEvents);                

          // Process data for pie chart
          const pieChartData = processDataForPieChart(processedEvents);
          setChartData(pieChartData);
          setLoading(false);
        }
        else {
          setLoading(false);
        }

      } catch (error) {
        console.error('Failed to fetch logged events:', error);
        setLoading(false);
      }
    };

    // Call the async function
    fetchLoggedEvents().catch(error => {
      console.error('Failed to fetch logged events:', error);
    });

    // Empty dependency array means this effect runs once on mount
  }, []);

  const header = renderHeader();

  return (
    <section className={`${styles.reporting} ${hasTeamsContext ? styles.teams : ''}`}>

      <div className="card">
        <TabView>
          <TabPanel header="Results">
            <DataTable value={logEvents} sortField="LastAccessed" sortOrder={-1} loading={loading} paginator rows={5} stripedRows size="normal" tableStyle={{ minWidth: '50rem' }} header={header} filters={filters} onFilter={handleFilterChange}>
              <Column field="DocName" header="Name" filterPlaceholder="Search" sortable style={{ width: '20%' }} />              
              <Column field="LastAccessed" header="Last Accessed" sortable  />
              <Column field="UserName" header="Accessed By"  />              
              <Column field="DocId" header="List Item Id" />
              <Column field="ListURL" header="List URL"  />
              <Column field="ClientType" header="Client Type"/>
              <Column field="ClientCountry" header="Client Country" />
              {/* <Column field="DocURL" header="URL" style={{ width: '3rem' }} /> */}
            </DataTable>
          </TabPanel>
          <TabPanel header="Chart">
            <Chart
              chartType="PieChart"
              data={chartData}
              options={options}
              width={"100%"}
              height={"400px"}
            />
          </TabPanel>
        </TabView>



      </div>      
    </section>
  );
};

export default Reporting;