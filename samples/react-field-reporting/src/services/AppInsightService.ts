import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import { CustomDimensions, Row, TableData } from '../webparts/reporting/types/ComponentTypes';


class AppInsightService {

    private static client: ApplicationInsights;
    private static apiKey: string;
    private static apiSecret: string;

    public static Init(instrumentationKey: string, apiKey: string, apiSecret: string): void {        
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.client = new ApplicationInsights({
            config: {
                instrumentationKey: instrumentationKey,
                enableAutoRouteTracking: true
            }
        });
        this.client.loadAppInsights();
        this.client.trackEvent({ name: 'AppInsightService Initialized' });
    }

    public static trackEvent(name: string, properties?: { [key: string]: string | number }): void {
        const telemetry = {
            name,
            properties: properties || {},
        };
        this.client.trackEvent(telemetry);
    }

    //Query data using Application Insights API with Axios to fetch the data using query
    public static async getLoggedEvents(): Promise<Row[]> {
        //define query to get all custom events and custom event is Document Accessed
        //const query = `customEvents | where timestamp > ago(30d)`;        
        const query = `customEvents | where name == 'Document Accessed' and timestamp > ago(30d)`;
        const response = await fetch(`https://api.applicationinsights.io/v1/apps/${this.apiKey}/query?query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiSecret
            }
        });

        const results = await response.json();
        const mappedResults = this.mapRowsWithColumns(results);
        return mappedResults;


    }

    private static mapRowsWithColumns = (data: TableData): Row[] => {
        const columns = data.tables[0].columns.map(column => column.name);
        return data.tables[0].rows.map(row => {
            const rowObject: Row = {};
            row.forEach((value, index) => {
                // Check if the current column is 'customDimensions' and parse it as JSON if so
                if (columns[index] === 'customDimensions' && typeof value === 'string') {
                    try {
                        rowObject[columns[index]] = JSON.parse(value) as CustomDimensions;
                    } catch (error) {
                        console.error('Error parsing customDimensions:', error);
                        rowObject[columns[index]] = {};
                    }
                } else {
                    rowObject[columns[index]] = value;
                }
            });
            return rowObject;
        });
    };




}
export default AppInsightService;
