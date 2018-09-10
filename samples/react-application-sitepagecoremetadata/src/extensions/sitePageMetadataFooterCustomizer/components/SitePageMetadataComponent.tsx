import * as React from 'react'
import ISitePageMetadataFooter from './ISitePageMetadataFooterProps';
import { SPHttpClientConfiguration, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './SitePageMetadataStyles.module.scss';
import { Label } from 'office-ui-fabric-react/lib/Label';


export interface ISitePageMetadataFooterCustomizerState
{
    Author:string;
    Editor:string;
    CreatedDate:string;
    ModifiedDate:string;
}

export default class SitePageMetadataFooter extends React.Component<ISitePageMetadataFooter,ISitePageMetadataFooterCustomizerState>{

    constructor(props,state:ISitePageMetadataFooterCustomizerState)
    {
        super(props)

        this.state = {
            Author:"",
            Editor:"",
            CreatedDate:"",
            ModifiedDate:"",
        }
    }

    // Render the react element that displays the page metadata.
    public render() {
        return (
            <div className={`${styles.divMetadataCustomizerContainer}`}>
                <div className={`${styles.divEmptyLeftSection}`}>
                </div>
                <div className={`${styles.divMetadataCustomizerColumn}`}>
                    <Label className={`${styles.divMetadataPropertyLabel}`}>Author</Label>
                    <Label className={`${styles.divMetadataPropertyValue}`}>{this.state.Author}</Label>
                </div>
                <div className={`${styles.divMetadataCustomizerColumn}`}>
                    <Label className={`${styles.divMetadataPropertyLabel}`}>Modified By</Label>
                    <Label className={`${styles.divMetadataPropertyValue}`}>{this.state.Editor}</Label>
                </div>
                <div className={`${styles.divMetadataCustomizerColumn}`}>
                    <Label className={`${styles.divMetadataPropertyLabel}`}>Created Date</Label>
                    <Label className={`${styles.divMetadataPropertyValue}`}>{this.state.CreatedDate}</Label>
                </div>
                <div className={`${styles.divMetadataCustomizerColumn}`}>
                    <Label className={`${styles.divMetadataPropertyLabel}`}>Last Modified</Label>
                    <Label className={`${styles.divMetadataPropertyValue}`}>{this.state.ModifiedDate}</Label>
                </div>
            </div>
        );
    }

    // Get the page metadata and set the state
    public componentDidMount()
    {
        this.GetPageMetadata().then(pageMetadata => {

            this.setState({
                    CreatedDate:pageMetadata.CreatedDate,
                    ModifiedDate:pageMetadata.ModifiedDate,
                    Author:pageMetadata.Author,
                    Editor:pageMetadata.Editor
            })
        })
    }

    // Fetches the page list item metadata from SharePoint
    private async GetPageMetadata():Promise<any>{

        // Diplaying 4 fields : Author, Editor, Created Date and Modified Date
        let selectAndExpandProps = '$select=Created,Modified,Author/Title,Editor/Title&$expand=Author/Id,Editor/Title,ContentType';
        let requestUrl = this.props.CurrentSiteUrl + `/_api/web/lists/getbyid('${this.props.SitePagesListId}')/items(${this.props.SitePageItemId})?${selectAndExpandProps}`;
        
        let getItemResponse = await this.props.spHttpClient.get(requestUrl,SPHttpClient.configurations.v1);

        if(getItemResponse.ok){

            let itemData = await getItemResponse.json();
            console.log(itemData);
            if(itemData){

                let modifiedDate = new Date(itemData.Modified);
                let createdDate = new Date(itemData.Created);
        
                let modifiedString = modifiedDate.toLocaleDateString() + " " + modifiedDate.toLocaleTimeString();
                let createdString = createdDate.toLocaleDateString() + " " + createdDate.toLocaleTimeString();
        
                let author = itemData.Author.Title;
                let editor = itemData.Editor.Title;

                return {
                    CreatedDate:createdString,
                    ModifiedDate:modifiedString,
                    Author:author,
                    Editor:editor
                };
            }
        }
    }
}
