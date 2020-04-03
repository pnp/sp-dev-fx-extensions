import { Log } from '@microsoft/sp-core-library';

const LOG_SOURCE: string = 'Utilities';
export default class Utilities {

    /*
    *@description -Reads session storage and return value
    @param - key: session storage key name
    */
    public static getFromSessionStorage(key: string): string {
        let sessionValue: string = null;
        try {
            if (key !== undefined && key) {
                sessionValue = window.sessionStorage.getItem(key);
            }

        } catch (error) {
            Log.error(LOG_SOURCE, error);
        }
        return sessionValue;
    }
    /*
    *@description - Stores data in session storage
    *@param - key: session storage key
    *@param - value: session storage value
    */
    public static updateSessionStorage(key: string, value: string): void {
        try {
            if (key && key !== undefined && value && value !== undefined) {
                window.sessionStorage.setItem(key, value);
            }

        } catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    }

    /*
    *@description - Sets Cookie Value
    *@param - cName: cookie key name
    *@param - cValue: cookie key value
    *@param - exDays: number of days to expire the cookie
    */
    public static setCookie(cName: string, cValue: string, exDays: number): void {
        try {
            let expires: string = "";
            if (exDays) {
                let d: Date = new Date();
                d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toUTCString();
            }
            document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
        } catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    }
    /*
    *@description - Reads value from Cookie
    *@param - cName: cookie key name whose value to be retrieved
    */
    public static getCookie(cName: string): string {
        try {
            let name: string = cName + "=";
            let decodedCookie: string = decodeURIComponent(document.cookie);
            let ca: string[] = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        } catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    }
}