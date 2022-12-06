import { Trigger } from "deno-slack-api/types.ts";
import DisplayLeaderboardWorkflow from "../workflows/display_leaderboard_workflow.ts";

const DisplayWeeklyStats: Trigger<typeof DisplayLeaderboardWorkflow.definition> = {
  name: "Display weekly stats",
  type: "scheduled",
  description: "Trigger to display a weekly stats",
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
  schedule: {
    start_time: "2022-10-20T08:00:00Z",
    timezone: "EDT",
    frequency: {
      type: "weekly",
      on_days: ["Thursday"],
      repeats_every: 1,
    },
  },
};

export default DisplayWeeklyStats;