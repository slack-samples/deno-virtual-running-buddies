import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import DisplayLeaderboardWorkflow from "../workflows/display_leaderboard_workflow.ts";

const DisplayLeaderboardTrigger: Trigger<
  typeof DisplayLeaderboardWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Display the leaderboard",
  description: "Show stats for the team and individual runners",
  workflow: `#/workflows/${DisplayLeaderboardWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default DisplayLeaderboardTrigger;
