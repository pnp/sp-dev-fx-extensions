export interface IServiceBuilder<T> {
    withMock(): IServiceBuilder<T>;
    withProduction(): IServiceBuilder<T>;
    buildService(): T;
}