import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";

import { CollectTeamStatsFunction } from "../functions/collect_team_stats.ts";
import { CollectRunnerStatsFunction } from "../functions/collect_runner_stats.ts";
import { FormatLeaderboardFunction } from "../functions/format_leaderboard.ts";

const DisplayLeaderboardWorkflow = DefineWorkflow({
  callback_id: "display_leaderboard_workflow",
  title: "Display the leaderboard",
  description:
    "Show team statistics and highlight the top runners from the past week",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
      interactivity: { type: Schema.slack.types.interactivity },
    },
    required: ["channel", "interactivity"],
  },
});

// Step 1: Gather team stats from the past week
const teamStats = DisplayLeaderboardWorkflow.addStep(
  CollectTeamStatsFunction,
  {},
);

// Step 2: Collect individual runner stats
const runnerStats = DisplayLeaderboardWorkflow.addStep(
  CollectRunnerStatsFunction,
  {},
);

// Step 3: Format the leaderboard message
const leaderboard = DisplayLeaderboardWorkflow.addStep(
  FormatLeaderboardFunction,
  {
    team_distance: teamStats.outputs.weekly_distance,
    percent_change: teamStats.outputs.percent_change,
    runner_stats: runnerStats.outputs.runner_stats,
  },
);

// Step 4: Post the leaderboard message to channel
DisplayLeaderboardWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: DisplayLeaderboardWorkflow.inputs.channel,
  message:
    `${leaderboard.outputs.teamStatsFormatted}\n\n${leaderboard.outputs.runnerStatsFormatted}`,
});

export default DisplayLeaderboardWorkflow;
