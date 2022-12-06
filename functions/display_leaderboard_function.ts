import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { DATASTORE } from "../datastores/rundata.ts";

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

const leaderFunction: SlackFunctionHandler<typeof DisplayLeaderboardFunction.definition> = 
async ({ inputs, token } ) => {
    const client = SlackAPI (token, {});

    // Query the datastore for all the data we collected
    const all = await client.apps.datastore.query ({
      datastore: DATASTORE,
    });

    // Query for dates of the past week (days 0-7)
    var date1 = new Date()
    date1.setDate(date1.getDate() - 7)

    const last7Days = await client.apps.datastore.query ({
      datastore: DATASTORE,
      expression: "#date >= :one_week_ago",
      expression_attributes: { "#date": "rundate" },
      expression_values: { ":one_week_ago": date1 },
    });

    // Query for dates of the past 2 weeks (previous days 0-14)
    var date2 = new Date()
    date2.setDate(date2.getDate() - 14)

    const last14Days = await client.apps.datastore.query ({
      datastore: DATASTORE,
      expression: "#date >= :two_weeks_ago",
      expression_attributes: { "#date": "rundate" },
      expression_values: { ":two_weeks_ago": date2 },
    });

    // Total each runner's distances for the past week to get the team's total
    var totaldistancewk1 = 0;
    for (const item of all["items"]) {
      if (item.rundate > date1.toLocaleDateString('en-CA')) {
        totaldistancewk1 += item.distance;
      }
    }
    // Total each runner's distances for the week before last week to get the team's total
    var totaldistancewk2 = 0;
    for (const item of all["items"]) {
      if (item.rundate > date2.toLocaleDateString('en-CA') && item.rundate < date1.toLocaleDateString('en-CA')) {
        totaldistancewk2 += item.distance;
      }
    }
    // Calculate each runner's individual total and store it in a map
    let distance_map = new Map<string, number>();
    for (const item of all["items"]) {
      distance_map.set(item.runner, item.distance + (distance_map.get(item.runner) || 0))
    }

    // Compare each runners' total and order them from greatest to least
    const sorted_map = new Map([...distance_map.entries()].sort((a, b) => b[1] - a[1]));

    // TODO: Convert user IDs to user names for displaying the leaderboard. Are user scopes supported?

    // Generate the leaderboard
    var leaders = '';
    for (let [key, value] of sorted_map.entries()) {
      leaders = leaders.concat(key.toString(), " ran ", value.toString(), " miles.\n");
    }

    // Compare the team's total for the past week to the week before that and calculate percentage difference.
    var weeklyDiff = totaldistancewk2 - totaldistancewk1;
    var percentageDiff = (weeklyDiff/totaldistancewk2);

    var stats = '';
    stats = stats.concat("Your team ran ", totaldistancewk2.toString(), " miles this week: ", percentageDiff.toString(), "% difference from last week.");

    if (!all.ok) {
      return {
        error: all.error,
        outputs: {},
      };
    } else {
      return {
        outputs: {leaders: leaders, stats: stats},
      };
    }
};

export default leaderFunction;