import type { ActionContext, InputOptions } from "./ActionContext";

type GetIDTokenFactory = (aud?: string) => Promise<string>;

export class ActionContextTesting implements ActionContext {
    inputs: Record<string, string> = {};
    outputs: Record<string, unknown> = {};
    secrets: string[] = [];
    exportedVariables: Record<string, unknown> = {};
    failureMessage: string | undefined;
    idTokenFactory: GetIDTokenFactory | undefined;
    stepSummary: string = "";

    getInput(name: string, options?: InputOptions): string {
        const inputValue = this.inputs[name];
        if (inputValue === undefined && options?.required === true) throw new Error(`Input required and not supplied: ${name}`);
        return inputValue || "";
    }

    setFailed(message: string): void {
        this.failureMessage = message;
    }

    writeStepSummary(summary: string): void {
        this.stepSummary = summary;
    }

    getStepSummary(): string | undefined {
        return this.stepSummary || undefined;
    }

    error(message: string): void {
        console.error(message);
    }

    debug(message: string): void {
        console.debug(message);
    }
}
