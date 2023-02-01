import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { LogRunFunction } from "../functions/log_run.ts";

const LogRunWorkflow = DefineWorkflow({
  callback_id: "log_run_workflow",
  title: "Log run workflow",
  description: "Workflow to log a run",
  input_parameters: {
    properties: {
      interactivity: { type: Schema.slack.types.interactivity },
      channel: { type: Schema.slack.types.channel_id },
      user_id: { type: Schema.slack.types.user_id },
    },
    required: ["interactivity", "channel", "user_id"],
  },
});

// Step 1: Collect run information with a form
const inputForm = LogRunWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Log your run",
    interactivity: LogRunWorkflow.inputs.interactivity,
    submit_label: "Submit run",
    fields: {
      elements: [{
        name: "runner",
        title: "Runner",
        type: Schema.slack.types.user_id,
        default: LogRunWorkflow.inputs.user_id,
      }, {
        name: "distance",
        title: "Distance (in miles)",
        type: Schema.types.number,
        minimum: 0,
      }, {
        name: "rundate",
        title: "Run date",
        type: Schema.slack.types.date,
        default: new Date().toLocaleDateString("en-CA"),
      }, {
        name: "channel",
        title: "Channel to send entry to",
        type: Schema.slack.types.channel_id,
        default: LogRunWorkflow.inputs.channel,
      }],
      required: ["channel", "runner", "distance", "rundate"],
    },
  },
);

// Step 2: Save run info to the datastore
LogRunWorkflow.addStep(LogRunFunction, {
  runner: inputForm.outputs.fields.runner,
  distance: inputForm.outputs.fields.distance,
  rundate: inputForm.outputs.fields.rundate,
});

// Step 3: Post a message about the run
LogRunWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: inputForm.outputs.fields.channel,
  message:
    `:athletic_shoe: <@${inputForm.outputs.fields.runner}> submitted ${inputForm.outputs.fields.distance} mile(s) on ${inputForm.outputs.fields.rundate}. Keep up the great work!`,
});

export default LogRunWorkflow;
