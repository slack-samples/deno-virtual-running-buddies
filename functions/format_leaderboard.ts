import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { RunnerStatsType } from "../types/runner_stats.ts";

export const FormatLeaderboardFunction = DefineFunction({
  callback_id: "format_leaderboard",
  title: "Format leaderboard message",
  description: "Format team and runner stats for a sharable message",
  source_file: "functions/format_leaderboard.ts",
  input_parameters: {
    properties: {
      team_distance: {
        type: Schema.types.number,
        description: "Total number of miles ran last week for the team",
      },
      percent_change: {
        type: Schema.types.number,
        description:
          "Percent change of miles ran compared to the prior week for the team",
      },
      runner_stats: {
        type: Schema.types.array,
        items: { type: RunnerStatsType },
        description: "Weekly and all-time total distances for runners",
      },
    },
    required: ["team_distance", "percent_change", "runner_stats"],
  },
  output_parameters: {
    properties: {
      teamStatsFormatted: {
        type: Schema.types.string,
        description: "A formatted message with team stats",
      },
      runnerStatsFormatted: {
        type: Schema.types.string,
        description: "An ordered leaderboard of runner stats",
      },
    },
    required: ["teamStatsFormatted", "runnerStatsFormatted"],
  },
});

export default SlackFunction(FormatLeaderboardFunction, ({ inputs }) => {
  const teamStatsFormatted =
    `Your team ran *${inputs.team_distance} miles* this past week: a ${inputs.percent_change}% difference from the prior week.`;

  const runnerStatsFormatted = inputs.runner_stats.sort((a, b) =>
    b.weekly_distance - a.weekly_distance
  ).map((runner) =>
    ` - <@${runner.runner}> ran ${runner.weekly_distance} miles last week (${runner.total_distance} total)`
  ).join("\n");

  return {
    outputs: { teamStatsFormatted, runnerStatsFormatted },
  };
});
