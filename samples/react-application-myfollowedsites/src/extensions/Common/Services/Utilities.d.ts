export default class Utilities {
    static getFromSessionStorage(key: string): string;
    static updateSessionStorage(key: string, value: string): void;
    static setCookie(cName: string, cValue: string, exDays: number): void;
    static getCookie(cName: string): string;
}
