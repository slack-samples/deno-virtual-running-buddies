import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { LogRunFunction } from "../functions/log_run_function.ts";

const LogRunWorkflow = DefineWorkflow({
  callback_id: "log_run_workflow",
  title: "Log run workflow",
  description: "Workflow to log a run",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
    },
    required: ["interactivity"],
  },
});

const inputForm = LogRunWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Log your run",
    interactivity: LogRunWorkflow.inputs.interactivity,
    submit_label: "Submit run",
    fields: {
      elements: [{
        name: "channel",
        title: "Channel to send entry to",
        type: Schema.slack.types.channel_id,
        default: LogRunWorkflow.inputs.channel,
      }, {
        name: "runner",
        title: "Runner",
        type: Schema.slack.types.user_id,
      }, {
        name: "distance",
        title: "Distance (in miles)",
        type: Schema.types.number,
      }, {
        name: "rundate",
        title: "Run date",
        type: Schema.slack.types.date,
      }],
      required: ["channel", "runner", "distance", "rundate"],
    },
  },
);

const logRunFunctionStep = LogRunWorkflow.addStep(LogRunFunction, {
  runner: inputForm.outputs.fields.runner,
  distance: inputForm.outputs.fields.distance,
  rundate: inputForm.outputs.fields.rundate,
});

LogRunWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: inputForm.outputs.fields.channel,
  message: logRunFunctionStep.outputs.updatedMsg,
});

export default LogRunWorkflow;
