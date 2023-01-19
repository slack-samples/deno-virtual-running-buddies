import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { DisplayLeaderboardFunction } from "../functions/display_leaderboard_function.ts";

const DisplayLeaderboardWorkflow = DefineWorkflow({
  callback_id: "display_leaderboard_workflow",
  title: "Display leaderboard workflow",
  description: "Workflow to display a leaderboard to a channel",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["channel", "interactivity"],
  },
});

const leaderboardFunctionStep = DisplayLeaderboardWorkflow.addStep(
  DisplayLeaderboardFunction,
  {
    channel: DisplayLeaderboardWorkflow.inputs.channel,
    triggered_user:
      DisplayLeaderboardWorkflow.inputs.interactivity?.interactor.id,
  },
);

DisplayLeaderboardWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: DisplayLeaderboardWorkflow.inputs.channel,
  message:
    `${leaderboardFunctionStep.outputs.leaders}. ${leaderboardFunctionStep.outputs.stats}`,
});

export default DisplayLeaderboardWorkflow;
