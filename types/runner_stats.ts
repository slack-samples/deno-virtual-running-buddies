import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

export const RunnerStatsType = DefineType({
  title: "Runner Stats",
  description: "Information about the recent runs for a runner",
  name: "runner_stats",
  type: Schema.types.object,
  properties: {
    runner: { type: Schema.slack.types.user_id },
    weekly_distance: { type: Schema.types.number },
    total_distance: { type: Schema.types.number },
  },
  required: ["runner", "weekly_distance", "total_distance"],
});
