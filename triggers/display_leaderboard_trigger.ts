import { Trigger } from "deno-slack-sdk/types.ts";
import DisplayLeaderboardWorkflow from "../workflows/display_leaderboard_workflow.ts";

const DisplayLeaderboardTrigger: Trigger<
  typeof DisplayLeaderboardWorkflow.definition
> = {
  type: "shortcut",
  name: "Display the leaderboard",
  description: "Show stats for the team and individual runners",
  workflow: `#/workflows/${DisplayLeaderboardWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default DisplayLeaderboardTrigger;
