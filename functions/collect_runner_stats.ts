import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import RunningDatastore, { RUN_DATASTORE } from "../datastores/run_data.ts";
import { RunnerStatsType } from "../types/runner_stats.ts";

export const CollectRunnerStatsFunction = DefineFunction({
  callback_id: "collect_runner_stats",
  title: "Collect runner stats",
  description: "Gather statistics of past runs for all runners",
  source_file: "functions/collect_runner_stats.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      runner_stats: {
        type: Schema.types.array,
        items: { type: RunnerStatsType },
        description: "Weekly and all-time total distances for runners",
      },
    },
    required: ["runner_stats"],
  },
});

export default SlackFunction(CollectRunnerStatsFunction, async ({ client }) => {
  // Query the datastore for all the data we collected
  const runs = await client.apps.datastore.query<
    typeof RunningDatastore.definition
  >({ datastore: RUN_DATASTORE });

  if (!runs.ok) {
    return { error: `Failed to retrieve past runs: ${runs.error}` };
  }

  const runners = new Map<typeof Schema.slack.types.user_id, {
    runner: typeof Schema.slack.types.user_id;
    total_distance: number;
    weekly_distance: number;
  }>();

  const today = new Date();
  const startOfLastWeek = new Date(new Date().setDate(today.getDate() - 6));

  // Add run statistics to the associated runner
  runs.items.forEach((run) => {
    const isRecentRun =
      run.rundate >= startOfLastWeek.toLocaleDateString("en-CA");

    // Find existing runner record or create new one
    const runner = runners.get(run.runner) ||
      { runner: run.runner, total_distance: 0, weekly_distance: 0 };

    // Add run distance to the runner's totals
    runners.set(run.runner, {
      runner: run.runner,
      total_distance: runner.total_distance + run.distance,
      weekly_distance: runner.weekly_distance + (isRecentRun && run.distance),
    });
  });

  // Return an array with runner stats
  return {
    outputs: { runner_stats: [...runners.entries()].map((r) => r[1]) },
  };
});
