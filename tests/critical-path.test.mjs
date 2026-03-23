import { registerCriticalPathCoreTests } from "./critical-path.core.mjs";
import { registerDevServerLifecycle } from "./critical-path.harness.mjs";

registerDevServerLifecycle();
registerCriticalPathCoreTests();
