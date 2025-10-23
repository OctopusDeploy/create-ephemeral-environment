export type InputOptions = {
    required?: boolean;
};

export interface ActionContext {
    getInput: (name: string, options?: InputOptions) => string;
    setFailed: (message: string) => void;

    info: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    debug: (message: string) => void;

}