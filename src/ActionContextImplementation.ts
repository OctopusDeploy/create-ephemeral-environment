import { getInput, setFailed, error, debug } from "@actions/core";
import type { ActionContext, InputOptions } from "./ActionContext";
import { writeFileSync } from "fs";

export class ActionContextImplementation implements ActionContext {
    getInput(name: string, options?: InputOptions): string {
        return getInput(name, options);
    }

    setFailed(message: string): void {
        return setFailed(message);
    }

    writeStepSummary(summary: string): void {
        const stepSummaryFile = process.env.GITHUB_STEP_SUMMARY;
        if (stepSummaryFile) {
            writeFileSync(
                stepSummaryFile,
                summary
            );
        }
    }

    error(message: string): void {
        error(message);
    }

    debug(message: string): void {
        debug(message);
    }
}