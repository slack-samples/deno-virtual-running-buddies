import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import LogRunWorkflow from "../workflows/log_run_workflow.ts";

const LogRunTrigger: Trigger<typeof LogRunWorkflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "Log a run",
  description: "Save the details of a recent run",
  workflow: `#/workflows/${LogRunWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
    user_id: {
      value: TriggerContextData.Shortcut.user_id,
    },
  },
};

export default LogRunTrigger;
