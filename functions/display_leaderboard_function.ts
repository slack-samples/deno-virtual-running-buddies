import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { RUN_DATASTORE } from "../datastores/rundata.ts";

export const DisplayLeaderboardFunction = DefineFunction({
  callback_id: "display_leaderboard_function",
  title: "Display leaderboard function",
  description: "Function to display a leaderboard",
  source_file: "functions/display_leaderboard_function.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel for the leaderboard",
      },
      triggered_user: {
        type: Schema.slack.types.user_id,
        description: "User who triggered the workflow",
      },
    },
    required: ["channel", "triggered_user"],
  },
  output_parameters: {
    properties: {
      stats: {
        type: Schema.types.string,
        description: "Statistics to be posted",
      },
      leaders: {
        type: Schema.types.string,
        description: "Leaderboard to be posted",
      },
    },
    required: ["leaders", "stats"],
  },
});

const leaderFunction: SlackFunctionHandler<
  typeof DisplayLeaderboardFunction.definition
> = async ({ inputs, token }) => {
  const client = SlackAPI(token, {});

  // Query the datastore for all the data we collected
  const all = await client.apps.datastore.query({
    datastore: RUN_DATASTORE,
  });

  // Query for dates of the past week (days 0-7)
  let sevenDaysDate = new Date();
  sevenDaysDate.setDate(sevenDaysDate.getDate() - 7);

  const last7Days = await client.apps.datastore.query({
    datastore: RUN_DATASTORE,
    expression: "#date >= :one_week_ago",
    expression_attributes: { "#date": "rundate" },
    expression_values: { ":one_week_ago": sevenDaysDate },
  });

  // Query for dates of the past 2 weeks (previous days 0-14)
  let fourteenDaysDate = new Date();
  fourteenDaysDate.setDate(fourteenDaysDate.getDate() - 14);

  const last14Days = await client.apps.datastore.query({
    datastore: RUN_DATASTORE,
    expression: "#date >= :two_weeks_ago",
    expression_attributes: { "#date": "rundate" },
    expression_values: { ":two_weeks_ago": fourteenDaysDate },
  });

  // Total each runner's distances for the past week to get the team's total
  let totaldistancewk1 = 0;
  for (const item of all["items"]) {
    if (item.rundate > sevenDaysDate.toLocaleDateString("en-CA")) {
      totaldistancewk1 += item.distance;
    }
  }
  // Total each runner's distances for the week before last week to get the team's total
  let totaldistancewk2 = 0;
  for (const item of all["items"]) {
    if (
      item.rundate > fourteenDaysDate.toLocaleDateString("en-CA") &&
      item.rundate < sevenDaysDate.toLocaleDateString("en-CA")
    ) {
      totaldistancewk2 += item.distance;
    }
  }
  // Calculate each runner's individual total and store it in a map
  let distanceMap = new Map<string, number>();
  for (const item of all["items"]) {
    distanceMap.set(
      item.runner,
      item.distance + (distanceMap.get(item.runner) || 0),
    );
  }

  // Compare each runners' total and order them from greatest to least
  const sortedMap = new Map(
    [...distanceMap.entries()].sort((a, b) => b[1] - a[1]),
  );

  // Generate the leaderboard
  let leaders = "";
  for (let [key, value] of sortedMap.entries()) {
    leaders = `${leaders} \n <@${key}> ran ${value} miles`;
  }

  // Compare the team's total for the past week to the week before that and calculate percentage difference.
  const weeklyDiff = totaldistancewk2 - totaldistancewk1;
  let percentageDiff = 0;

  if (totaldistancewk2 != 0) {
    percentageDiff = weeklyDiff / totaldistancewk2;
  } else {
    percentageDiff = 0;
  }

  const stats =
    `Your team ran ${totaldistancewk1} miles this week: a ${percentageDiff}% difference from last week.`;

  if (!all.ok) {
    return {
      error: all.error,
      outputs: {},
    };
  } else {
    return {
      outputs: { leaders, stats },
    };
  }
};

export default leaderFunction;
