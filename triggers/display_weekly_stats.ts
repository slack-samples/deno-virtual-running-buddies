import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import DisplayLeaderboardWorkflow from "../workflows/display_leaderboard_workflow.ts";
import "std/dotenv/load.ts";

const DisplayWeeklyStats: Trigger<
  typeof DisplayLeaderboardWorkflow.definition
> = {
  type: TriggerTypes.Scheduled,
  name: "Display weekly stats",
  description: "Display weekly running stats on a schedule",
  workflow: `#/workflows/${DisplayLeaderboardWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: Deno.env.get("RUNNERS_CHANNEL_ID")!,
    },
  },
  schedule: {
    start_time: new Date(new Date().getTime() + 60000).toISOString(),
    timezone: "EDT",
    frequency: {
      type: "weekly",
      on_days: ["Thursday"],
      repeats_every: 1,
    },
  },
};

export default DisplayWeeklyStats;
