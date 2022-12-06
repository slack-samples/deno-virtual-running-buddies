import { Trigger } from "deno-slack-api/types.ts";
import LogRunWorkflow from "../workflows/log_run_workflow.ts";

const LogRunTrigger: Trigger<typeof LogRunWorkflow.definition> = {
  type: "shortcut",
  name: "Log run trigger",
  description: "Trigger to log a run",
  workflow: "#/workflows/log_run_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default LogRunTrigger;
