import { Web } from "@pnp/sp/presets/all";

const Environment = {
  Site_URL: "https://m365x44410739.sharepoint.com/sites/PRIDE-EmployeeResourceGroup/",
}

const Sp = Web(Environment.Site_URL);
export { Environment, Sp };
