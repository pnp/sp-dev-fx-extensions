import ITenantDataProvider from "./ITenantDataProvider";

class MockTenantDataProvider implements ITenantDataProvider {

    public getTenantPropertyValue(key: string): Promise<any> {
        throw new Error("Method not implemented.");
    }  
}

export default MockTenantDataProvider;