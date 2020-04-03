import { Log } from '@microsoft/sp-core-library';
var LOG_SOURCE = 'Utilities';
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    /*
    *@description -Reads session storage and return value
    @param - key: session storage key name
    */
    Utilities.getFromSessionStorage = function (key) {
        var sessionValue = null;
        try {
            if (key !== undefined && key) {
                sessionValue = window.sessionStorage.getItem(key);
            }
        }
        catch (error) {
            Log.error(LOG_SOURCE, error);
        }
        return sessionValue;
    };
    /*
    *@description - Stores data in session storage
    *@param - key: session storage key
    *@param - value: session storage value
    */
    Utilities.updateSessionStorage = function (key, value) {
        try {
            if (key && key !== undefined && value && value !== undefined) {
                window.sessionStorage.setItem(key, value);
            }
        }
        catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    };
    /*
    *@description - Sets Cookie Value
    *@param - cName: cookie key name
    *@param - cValue: cookie key value
    *@param - exDays: number of days to expire the cookie
    */
    Utilities.setCookie = function (cName, cValue, exDays) {
        try {
            var expires = "";
            if (exDays) {
                var d = new Date();
                d.setTime(d.getTime() + (exDays * 24 * 60 * 60 * 1000));
                expires = "expires=" + d.toUTCString();
            }
            document.cookie = cName + "=" + cValue + ";" + expires + ";path=/";
        }
        catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    };
    /*
    *@description - Reads value from Cookie
    *@param - cName: cookie key name whose value to be retrieved
    */
    Utilities.getCookie = function (cName) {
        try {
            var name_1 = cName + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name_1) == 0) {
                    return c.substring(name_1.length, c.length);
                }
            }
            return "";
        }
        catch (error) {
            Log.error(LOG_SOURCE, error);
        }
    };
    return Utilities;
}());
export default Utilities;
//# sourceMappingURL=Utilities.js.map