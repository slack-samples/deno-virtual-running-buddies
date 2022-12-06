import { Trigger } from "deno-slack-api/types.ts";
import DisplayLeaderboardWorkflow from "../workflows/display_leaderboard_workflow.ts";

const DisplayLeaderboardTrigger: Trigger<typeof DisplayLeaderboardWorkflow.definition> = {
  type: "shortcut",
  name: "Display leaderboard trigger",
  description: "Trigger to display a leaderboard",
  workflow: "#/workflows/display_leaderboard_workflow",
  inputs: {
    interactivity: {
      value: "{{data.interactivity}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
    triggered_user: {
      value: "{{data.user_id}}",
    },
  },
};

export default DisplayLeaderboardTrigger;