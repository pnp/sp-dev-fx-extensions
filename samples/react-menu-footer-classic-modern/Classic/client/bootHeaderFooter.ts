import HeaderFooterDataService from './common/services/HeaderFooterDataService';
import IHeaderFooterData from './common/model/IHeaderFooterData';
import ComponentManager from './common/components/ComponentManager';

export class bootstrapper {

  public onInit(): void {

    // Create the div elements to hold the header and footer
    const header = document.createElement("div");
    const footer = document.createElement("div");

    // Insert the header and footer on the page
    const ribbon = document.getElementById('s4-ribbonrow');
    const workspace = document.getElementById('s4-workspace');
    if (workspace) {

      ribbon.parentElement.insertBefore(header,ribbon);
      workspace.appendChild(footer);

      // For now this is hard-coded
      // -- UPLOAD JSON WITH MENU CONTENTS AND PUT THE URL HERE --
      const url = 'https://<tenant>.sharepoint.com/sites/scripts/Style%20Library/HeaderFooterData.json.txt';
  
      // Get the header and footer data and render it
      HeaderFooterDataService.get(url)
        .then ((data: IHeaderFooterData) => {
          ComponentManager.render(header, footer, data);
        })
        .catch ((error: string) => {
          console.log(`Error in CustomHeaderFooterApplicationCustomizer: ${error}`);
        });

    } else {

      // The element we want to attach to is missing
      console.log('Error in CustomHeaderFooterApplicationCustomizer: Unable to find element to attach header and footer');
      
    }
  }
}

// In-line code starts here
(<any>window).ExecuteOrDelayUntilBodyLoaded(() => {
  if (window.location.search.indexOf('IsDlg=1') < 0) {
    let b = new bootstrapper();
    b.onInit();  
  }
})
