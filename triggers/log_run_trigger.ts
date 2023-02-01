import { Trigger } from "deno-slack-api/types.ts";
import LogRunWorkflow from "../workflows/log_run_workflow.ts";

const LogRunTrigger: Trigger<typeof LogRunWorkflow.definition> = {
  type: "shortcut",
  name: "Log a run",
  description: "Save the details of a recent run",
  workflow: `#/workflows/${LogRunWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
    user_id: {
      value: "{{data.user_id}}",
    },
  },
};

export default LogRunTrigger;
