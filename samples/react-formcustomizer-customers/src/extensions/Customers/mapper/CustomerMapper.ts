import { ICustomer } from "../model/ICustomer";
import { IFormData } from "../model/IFormData";
import { IProject } from "../model/IProject";
import { ITermData } from "../model/ITermData";

export default class CustomerMapper {

    public static mapRequestFormData(item: any): IFormData {
        return {
            Title: item.title,
            Email: item.email,
            Address: item.address ? item.address : "",
            Interests: item.interests && item.interests.length > 0 ? item.interests : [],
            ProjectsId: item.projects && item.projects.length > 0 ? item.projects : []            
        } as IFormData;
    }

    public static mapCustomerInfo(item: any): ICustomer {
        return {
            ID: item.ID,
            Title: item.Title,
            Email: item.Email,
            Address: item.Address ? item.Address : "",
            Interests: item.Interests && item.Interests.length > 0 ? item.Interests : [],
            ProjectsId: item.ProjectsId && item.ProjectsId.length > 0 ? item.ProjectsId.map(i => i.toString()) : [],
            Projects: item.Projects && item.Projects.length > 0 ? item.Projects : [],
            CustomerLocations: item.CustomerLocations && item.CustomerLocations.length > 0 ? this.mapTaxColumn(item.CustomerLocations) : {}
        } as ICustomer;
    }

    public static mapCustomerProjects(item: any): IProject {
        return {
            ID: Number(item.ID),
            Title: item.Title,
            Status: item.Status,
            StartDate: item.StartDate,
            Members: item.Members && item.Members.length > 0 ? item.Members : []
        } as IProject;
    }

    public static mapTaxColumn(selectedTerms: any): ITermData[] {

        const result = selectedTerms.map((term, index) => {

            return {
                id: term.TermGuid,
                labels: [{
                    name: term.Label,
                    isDefault: true,
                    languageTag: "en-US"
                }]

            } as ITermData;
        });

        return result;
    }

    public static getManagedMetadataFieldValue = (terms: ITermData[]): string => {
        let termValue = "";
        if (terms.length > 1) {
            for (const term of terms) {

                termValue += `${term.labels[0].name}|${term.id};`;
            }
        } else {
            termValue += `${terms[0].labels[0].name}|${terms[0].id}`;
        }
        return termValue;
    };
}

