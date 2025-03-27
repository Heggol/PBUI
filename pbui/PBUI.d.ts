export declare class PBUIState {
    update(key: string, value: any): void;
    get<T>(key: string): T | undefined;
    reset(): void;
}

export declare class PBUI {
    state: PBUIState;

    connect(url?: string, options?: object): void;
    subscribe(event: string, listener): void;
    disconnect(): void;
    on(event: string, callback: (data: any) => void): void;
    send(event: string, data:any): void;
    setApiBase(url: string): void;
    request(method: string, endpoint: string, data?: object, headers?: object): Promise<any>;
}

export default PBUI;