export class AppContext {
    private static subscribedFunctions: ((value: string) => void)[] = [];
    private static _userLogin: string = null;

    public static get userLogin(): string {
        return this._userLogin;
    }

    public static set userLogin(newValue: string) {
        this._userLogin = newValue;
    }

    public static subscribeToContextChange(func: (value: string) => void): void {
        this.subscribedFunctions.push(func);
    }
    public static notifySubscribers(value: string): void {
        if (!this.subscribedFunctions || this.subscribedFunctions.length === 0) { return; }

        for (const subscribedFunction of this.subscribedFunctions) {
            subscribedFunction(value);
        }
    }
}