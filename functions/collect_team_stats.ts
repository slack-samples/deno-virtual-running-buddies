import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";
import RunningDatastore, { RUN_DATASTORE } from "../datastores/run_data.ts";

export const CollectTeamStatsFunction = DefineFunction({
  callback_id: "collect_team_stats",
  title: "Collect team stats",
  description: "Gather and compare run data from the last week",
  source_file: "functions/collect_team_stats.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      weekly_distance: {
        type: Schema.types.number,
        description: "Total number of miles ran last week",
      },
      percent_change: {
        type: Schema.types.number,
        description: "Percent change of miles ran compared to the prior week",
      },
    },
    required: ["weekly_distance", "percent_change"],
  },
});

export default SlackFunction(CollectTeamStatsFunction, async ({ client }) => {
  const today = new Date();

  // Collect runs from the past week (days 0-6)
  const lastWeekStartDate = new Date(new Date().setDate(today.getDate() - 6));
  const lastWeekDistance = await distanceInWeek(client, lastWeekStartDate);
  if (lastWeekDistance.error) {
    return { error: lastWeekDistance.error };
  }

  // Collect runs from the prior week (days 7-13)
  const priorWeekStartDate = new Date(new Date().setDate(today.getDate() - 13));
  const priorWeekDistance = await distanceInWeek(client, priorWeekStartDate);
  if (priorWeekDistance.error) {
    return { error: priorWeekDistance.error };
  }

  // Calculate percent difference between totals of last week and the prior week
  const weeklyDiff = lastWeekDistance.total - priorWeekDistance.total;
  let percentageDiff = 0;
  if (priorWeekDistance.total != 0) {
    percentageDiff = 100 * weeklyDiff / priorWeekDistance.total;
  }

  return {
    outputs: {
      weekly_distance: Number(lastWeekDistance.total.toFixed(2)),
      percent_change: Number(percentageDiff.toFixed(2)),
    },
  };
});

// Sum all logged runs in the seven days following startDate
async function distanceInWeek(
  client: SlackAPIClient,
  startDate: Date,
): Promise<{ total: number; error?: string }> {
  const endDate = new Date(new Date().setDate(startDate.getDate() + 6));

  console.log(startDate);
  console.log(endDate);

  const runs = await client.apps.datastore.query<
    typeof RunningDatastore.definition
  >({
    datastore: RUN_DATASTORE,
    expression: "#date BETWEEN :start_date AND :end_date",
    expression_attributes: { "#date": "rundate" },
    expression_values: {
      ":start_date": startDate.toLocaleDateString("en-CA", { timeZone: "UTC" }),
      ":end_date": endDate.toLocaleDateString("en-CA", { timeZone: "UTC" }),
    },
  });

  if (!runs.ok) {
    return { total: 0, error: `Failed to retrieve past runs: ${runs.error}` };
  }

  const total = runs.items.reduce((sum, entry) => (sum + entry.distance), 0);
  return { total };
}
