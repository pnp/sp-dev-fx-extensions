import { IMenuProvider, MenuCategory } from "./index";

/**
 * Fake data provider for offline tests.
 */
export class MenuFakeProvider implements IMenuProvider {

    public getAllItems(): Promise<MenuCategory[]> {
        return new Promise<MenuCategory[]>((resolve, reject) => {

            let result: MenuCategory[] = [
                {
                    category: "Department of Agriculture, Food and the Marine",
                    items: [
                        { id: 1, name: "Animal Health & Welfare", url: "url1" },
                        { id: 1, name: "Customer Service", url: "url1" },
                        { id: 1, name: "Farmer Schemes & Payments", url: "url1" },
                        { id: 1, name: "Farming Sectors", url: "url1" },
                        { id: 1, name: "Food Industry Development, Trade, Markets and the Economy", url: "url1" },
                        { id: 1, name: "Food Safety, Public Health & Consumer Issues", url: "url1" },
                        { id: 1, name: "Forestry", url: "url1" },
                        { id: 1, name: "Research", url: "url1" },
                        { id: 1, name: "Rural Environment", url: "url1" },
                        { id: 1, name: "Seafood", url: "url1" }
                    ]
                },
                {
                    category: "Department of Arts, Heritage, Regional, Rural and Gaeltacht Affairs",
                    items: [
                        { id: 1, name: "Built Heritage, Architectural Policy & Strategic Infrastructure", url: "url1" },
                        { id: 2, name: "National Monuments Service", url: "url1" },
                        { id: 2, name: "National Parks & Wildlife Service", url: "url1" },
                        { id: 2, name: "Moore Street Consultative Group", url: "url1" },
                        { id: 2, name: "Publications", url: "url1" },
                        { id: 2, name: "Legislation", url: "url1" },
                        { id: 2, name: "Heritage Links", url: "url1" },
                        { id: 2, name: "The Irish Language", url: "url1" },
                        { id: 2, name: "The Gaeltacht", url: "url1" },
                        { id: 2, name: "20-Year Strategy for the Irish Language", url: "url1" },
                        { id: 2, name: "Islands", url: "url1" },
                        { id: 2, name: "Recruitment", url: "url1" },
                        { id: 2, name: "Publications", url: "url1" },
                        { id: 2, name: "Legislation", url: "url1" },
                        { id: 2, name: "Gaeltacht Links", url: "url1" }
                    ]
                },
                {
                    category: "Department of Business, Enterprise and Innovation",
                    items: [
                        { id: 3, name: "Innovation, Research & Development", url: "url1" },
                        { id: 3, name: "Trade & Investment", url: "url1" },
                        { id: 3, name: "Supports for SMEs", url: "url1" },
                        { id: 3, name: "Business & Sectoral Initiatives", url: "url1" },
                        { id: 3, name: "Workplace & Skills", url: "url1" },
                        { id: 3, name: "EU & Internal Market", url: "url1" },
                        { id: 3, name: "Company & Corporate Law", url: "url1" },
                        { id: 3, name: "Consumer & Competition", url: "url1" }
                    ]
                },
                {
                    category: "Department of Children and Youth Affairs", 
                    items: [
                        { id: 4, name: "Childcare", url: "url1" },
                        { id: 4, name: "Tusla", url: "url1" },
                        { id: 4, name: "Children In Care", url: "url1" },
                        { id: 4, name: "Participation", url: "url1" },
                        { id: 4, name: "Play, Recreation & Culture", url: "url1" },
                        { id: 4, name: "Children and Young People's Participation Hub", url: "url1" },
                        { id: 4, name: "Children First", url: "url1" },
                        { id: 4, name: "Child Welfare and Protection", url: "url1" },
                        { id: 4, name: "Adoption", url: "url1" },
                        { id: 4, name: "Irish Youth Justice Service", url: "url1" },
                        { id: 4, name: "Youth Affairs", url: "url1" },
                        { id: 4, name: "Area Based Childhood (ABC) Programme", url: "url1" },
                        { id: 4, name: "Mother and Baby Homes Investigation", url: "url1" },
                        { id: 4, name: "Children and Young People's Services Committees (CYPSC)", url: "url1" },
                        { id: 4, name: "Reform of Guardian ad litem Arrangements", url: "url1" },
                        { id: 4, name: "Quality and Capacity Building Initiative", url: "url1" },
                        { id: 4, name: "Better Outcomes, Brighter Futures", url: "url1" },
                        { id: 4, name: "Legislation", url: "url1" },
                        { id: 4, name: "International Framework", url: "url1" },
                        { id: 4, name: "Growing Up in Ireland", url: "url1" },
                        { id: 4, name: "Research", url: "url1" },
                        { id: 4, name: "National Research and Data Strategy", url: "url1" },
                        { id: 4, name: "Financial Information", url: "url1" },
                        { id: 4, name: "Freedom of Information", url: "url1" }
                    ]
                },
                {
                    category: "Department of Communications, Climate Action & Environment",
                    items: [
                        { id: 1, name: "Communications", url: "url1" },
                        { id: 5, name: "Climate Action", url: "url1" },
                        { id: 5, name: "Environment", url: "url1" },
                        { id: 5, name: "Energy", url: "url1" },
                        { id: 5, name: "Natural Resources", url: "url1" },
                        { id: 5, name: "Compliance", url: "url1" }
                    ]
                },
                {
                    category: "Department of Employment Affairs and Social Protection (DEASP)",
                    items: [
                        { id: 5, name: "Jobseekers", url: "url1" },
                        { id: 5, name: "Employers and Employment", url: "url1" },
                        { id: 5, name: "Children and Families", url: "url1" },
                        { id: 5, name: "Disability and Illness", url: "url1" },
                        { id: 5, name: "Retired and Older People", url: "url1" },
                        { id: 5, name: "Bereavement", url: "url1" },
                        { id: 5, name: "Other Supports", url: "url1" },
                        { id: 5, name: "Supplementary Welfare Allowance", url: "url1" },
                        { id: 5, name: "Moving to or from Ireland", url: "url1" },
                        { id: 5, name: "Public Service Identity", url: "url1" },
                        { id: 5, name: "Redundancy and Insolvency", url: "url1" },
                        { id: 5, name: "Translations & Interpretive Services", url: "url1" },
                        { id: 5, name: "Freedom of Information", url: "url1" }
                    ]
                },
                {
                    category: "Department of Education and Skills",
                    items: [
                        { id: 5, name: "School Holidays", url: "url1" },
                        { id: 5, name: "Child Protection", url: "url1" },
                        { id: 5, name: "School Enrolment", url: "url1" },
                        { id: 5, name: "State Examinations", url: "url1" },
                        { id: 5, name: "Data on Individual Schools", url: "url1" },
                        { id: 5, name: "Inspection Reports and Publications", url: "url1" }
                    ]
                },
                {
                    category: "Department of Finance",
                    items: [
                        { id: 5, name: "Economic", url: "url1" },
                        { id: 5, name: "Public Finances", url: "url1" },
                        { id: 5, name: "Tax", url: "url1" },
                        { id: 5, name: "The Budget", url: "url1" },
                        { id: 5, name: "Banking", url: "url1" },
                        { id: 5, name: "Financial Services", url: "url1" },
                        { id: 5, name: "Insurance", url: "url1" },
                        { id: 5, name: "Shareholding & Financial Advisory", url: "url1" },
                        { id: 5, name: "International Financial Services", url: "url1" },
                        { id: 5, name: "EU & International", url: "url1" },
                        { id: 5, name: "International Institutions", url: "url1" }
                    ]
                },
                {
                    category: "Department of Foreign Affairs and Trade",
                    items: [
                        { id: 5, name: "Passports and Citizenship", url: "url1" },
                        { id: 5, name: "Travel", url: "url1" },
                        { id: 5, name: "Embassies", url: "url1" },
                        { id: 5, name: "News and Media", url: "url1" }
                    ]
                },
                {
                    category: "Department of Housing, Planning, Community and Local Government",
                    items: [
                        { id: 5, name: "Housing", url: "url1" },
                        { id: 5, name: "Planning", url: "url1" },
                        { id: 5, name: "Local Government", url: "url1" },
                        { id: 5, name: "Met Éireann", url: "url1" },
                        { id: 5, name: "Local Government Audit Service", url: "url1" },
                        { id: 5, name: "Corporate", url: "url1" }
                    ]
                },
                {
                    category: "Department of Justice and Equality",
                    items: [

                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" }
                    ]
                },
                {
                    category: "Department of Public Expenditure and Reform",
                    items: [
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" }
                    ]
                },
                {
                    category: "Department of the Taoiseach",
                    items: [
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" }
                    ]
                },
                {
                    category: "Department of Transport, Tourism and Sport",
                    items: [
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" },
                        { id: 5, name: "Workplace & Skills", url: "url1" }
                    ]
                }
            ];

            resolve(result);
        });
    }
}