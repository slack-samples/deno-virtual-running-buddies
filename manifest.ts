import { Manifest } from "deno-slack-sdk/mod.ts";
import RunningDatastore from "./datastores/run_data.ts";
import LogRunWorkflow from "./workflows/log_run_workflow.ts";
import DisplayLeaderboardWorkflow from "./workflows/display_leaderboard_workflow.ts";
import { RunnerStatsType } from "./types/runner_stats.ts";

export default Manifest({
  name: "virtual-running-buddies",
  description: "Log runs with virtual running buddies!",
  icon: "assets/icon.png",
  workflows: [LogRunWorkflow, DisplayLeaderboardWorkflow],
  outgoingDomains: [],
  datastores: [RunningDatastore],
  types: [RunnerStatsType],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "channels:read",
    "triggers:write",
  ],
});
