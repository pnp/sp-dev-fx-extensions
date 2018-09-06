@override
  public onInit(): Promise<void> {
    Log._initialize(new ConsoleLogHandler((window as any).LOG_LEVEL || LogLevel.Error));
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    if (!this.properties.siteUrl ||
      !this.properties.listName) {
      const e: Error = new Error('Missing required configuration parameters');
      Log.error(LOG_SOURCE, e);
      return Promise.reject(e);
    }


    let topPlaceholder: PlaceholderContent = this.context.placeholderProvider.tryCreateContent(PlaceholderName.Top);
    if(topPlaceholder){
      const elem: React.ReactElement<IAnnouncementsProps> = React.createElement(Announcements, {
        siteUrl: this.properties.siteUrl,
        listName: this.properties.listName,
        spHttpClient: this.context.spHttpClient
      });
      ReactDOM.render(elem, topPlaceholder.domElement);
    }

    return Promise.resolve<void>();
  }
