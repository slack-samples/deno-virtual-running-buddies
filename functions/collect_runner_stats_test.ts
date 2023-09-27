import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import CollectRunnerStatsFunction from "./collect_runner_stats.ts";

// Mocked date for stable testing
Date.now = () => new Date("2023-01-04").getTime();

// Collection of runs stored in the mocked datastore
// let mockRuns: DatastoreItem<typeof RunningDatastore.definition>[];
const mockRuns = [
  { runner: "U0123456", distance: 4, rundate: "2023-01-04" },
  { runner: "U0123456", distance: 2, rundate: "2023-01-04" },
  { runner: "U7777777", distance: 2, rundate: "2023-01-02" },
  { runner: "U0123456", distance: 4, rundate: "2023-01-02" },
  { runner: "U7777777", distance: 1, rundate: "2022-12-10" },
  { runner: "U0123456", distance: 2, rundate: "2022-11-11" },
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
    weekly_distance: 10,
    total_distance: 12,
  }, {
    runner: "U7777777",
    weekly_distance: 2,
    total_distance: 3,
  }];

  assertEquals(error, undefined);
  assertEquals(outputs?.runner_stats, expectedStats);
});
