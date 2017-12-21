interface ITenantDataProvider {
    /**
     * Get the value of a tenant property bag property
     * @param key the property bag key
     */
    getTenantPropertyValue(key: string): Promise<any>;
}

export default ITenantDataProvider;