import { setFailed } from "@actions/core";
import { ActionContextImpl } from "./ActionContextImpl";
import { createEnvironment } from "./createEnvironment";

createEnvironment(new ActionContextImpl()).catch((error) => {
  setFailed(error);
  process.exit(1);
});