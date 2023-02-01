import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import CollectRunnerStatsFunction from "./collect_runner_stats.ts";

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

const { createContext } = SlackFunctionTester("collect_runner_stats");

Deno.test("Collect runner stats", async () => {
  const { outputs, error } = await CollectRunnerStatsFunction(
    createContext({ inputs: {} }),
  );

  const expectedStats = [{
    runner: "U0123456",
    weekly_distance: 4,
    total_distance: 8,
  }, {
    runner: "U7777777",
    weekly_distance: 2,
    total_distance: 3,
  }];

  assertEquals(error, undefined);
  assertEquals(outputs?.runner_stats, expectedStats);
});
