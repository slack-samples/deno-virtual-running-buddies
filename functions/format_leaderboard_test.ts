import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals, assertStringIncludes } from "std/testing/asserts.ts";
import FormatLeaderboardFunction from "./format_leaderboard.ts";

const { createContext } = SlackFunctionTester("format_leaderboard");

Deno.test("Collect team stats", async () => {
  const inputs = {
    team_distance: 11,
    percent_change: 50,
    runner_stats: [{
      runner: "U0123456",
      weekly_distance: 4,
      total_distance: 8,
    }, {
      runner: "U7777777",
      weekly_distance: 2,
      total_distance: 3,
    }],
  };

  const { outputs, error } = await FormatLeaderboardFunction(
    createContext({ inputs }),
  );

  assertEquals(error, undefined);
  assertStringIncludes(outputs?.teamStatsFormatted || "", "11 miles");
  assertStringIncludes(outputs?.teamStatsFormatted || "", "50%");

  assertStringIncludes(
    outputs?.runnerStatsFormatted || "",
    "<@U0123456> ran 4 miles last week (8 total)",
  );
  assertStringIncludes(
    outputs?.runnerStatsFormatted || "",
    "<@U7777777> ran 2 miles last week (3 total)",
  );
});
