export class languageManager {

    public static GetStrings(): ICustomHeaderFooterApplicationCustomizerStrings {

        var localizedStrings: ICustomHeaderFooterApplicationCustomizerStrings = null;

        const pageContext: any = (<any>window)._spPageContextInfo;

        if (pageContext) {
            const uiCulture: string = pageContext.currentUICultureName;
            if (uiCulture) {
                switch (uiCulture.toLowerCase()) {
                    case 'en-us': {
                        localizedStrings = require('./common/loc/en-us');
                        break;
                    }
                    case 'fr-fr': {
                        localizedStrings = require('./common/loc/fr-fr');
                        break;
                    }
                }
            }

        }
        
        if (localizedStrings === null) {
            localizedStrings = require('./common/loc/en-us');
        }

        return localizedStrings;    
    }

}