import { getInput, setFailed, info, error, debug, warning } from "@actions/core";
import type { ActionContext, InputOptions } from "./ActionContext";
import { writeFileSync } from "fs";

export class ActionContextImpl implements ActionContext {
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

    info(message: string): void {
        return info(message);
    }

    warning(message: string): void {
        return warning(message);
    }

    error(message: string) {
        error(message);
    }

    debug(message: string) {
        debug(message);
    }
}