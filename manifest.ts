import { Manifest } from "deno-slack-sdk/mod.ts";
import { RunningDatastore } from "./datastores/rundata.ts";
import LogRunWorkflow from "./workflows/log_run_workflow.ts";
import DisplayLeaderboardWorkflow from "./workflows/display_leaderboard_workflow.ts";

export default Manifest({
  name: "virtual-running-buddies",
  description: "Log runs with virtual running buddies!",
  icon: "assets/shoes.png",
  workflows: [LogRunWorkflow, DisplayLeaderboardWorkflow],
  outgoingDomains: [],
  datastores: [RunningDatastore],
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
