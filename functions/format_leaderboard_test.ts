import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import FormatLeaderboardFunction from "./format_leaderboard.ts";

// Mocked days for the past week, prior week, and a distant week
const today = new Date();
const recentDate = new Date(new Date().setDate(today.getDate() - 2))
  .toLocaleDateString("en-CA", { timeZone: "UTC" });
const priorDate = new Date(new Date().setDate(today.getDate() - 7))
  .toLocaleDateString("en-CA", { timeZone: "UTC" });
const oldDate = new Date(new Date().setDate(today.getDate() - 20))
  .toLocaleDateString("en-CA", { timeZone: "UTC" });

// Example of runs stored in the datastore
const mockRuns = [
  { runner: "U0123456", distance: 4, rundate: recentDate },
  { runner: "U7777777", distance: 2, rundate: recentDate },
  { runner: "U0123456", distance: 4, rundate: priorDate },
  { runner: "U7777777", distance: 1, rundate: oldDate },
];

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/apps.datastore.query", () => {
  return new Response(JSON.stringify({ ok: true, items: mockRuns }));
});

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
