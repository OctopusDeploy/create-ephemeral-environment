/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type { ActionContext, InputOptions } from "./ActionContext";

type GetIDTokenFactory = (aud?: string) => Promise<string>;

export class ActionContextTesting implements ActionContext {
    inputs: Record<string, string> = {};
    outputs: Record<string, unknown> = {};
    secrets: string[] = [];
    exportedVariables: Record<string, unknown> = {};
    failureMessage: string | undefined;
    idTokenFactory: GetIDTokenFactory | undefined;

    addInput(name: string, value: string) {
        this.inputs[name] = value;
    }

    getSecrets() {
        return this.secrets;
    }

    getFailureMessage() {
        return this.failureMessage;
    }

    setIDToken(factory: GetIDTokenFactory) {
        this.idTokenFactory = factory;
    }

    getInput(name: string, options?: InputOptions): string {
        const inputValue = this.inputs[name];
        if (inputValue === undefined && options?.required === true) throw new Error(`Input required and not supplied: ${name}`);
        return inputValue || "";
    }

    setSecret(secret: string): void {
        this.secrets.push(secret);
    }

    setFailed(message: string): void {
        this.failureMessage = message;
    }

    info(message: string): void {
        console.log(message);
    }

    error(message: string): void {
        console.error(message);
    }

    warning(message: string): void {
        console.warn(message);
    }

    debug(message: string): void {
        console.debug(message);
    }
}
