import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import CollectRunnerStatsFunction from "./collect_runner_stats.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import RunningDatastore from "../datastores/run_data.ts";

// Mocked date for stable testing
Date.now = () => new Date("2023-01-04").getTime();

// Collection of runs stored in the mocked datastore
const mockRuns: DatastoreItem<typeof RunningDatastore.definition>[] = [
  { id: "R006", runner: "U0123456", distance: 4, rundate: "2023-01-04" },
  { id: "R005", runner: "U0123456", distance: 2, rundate: "2023-01-04" },
  { id: "R004", runner: "U7777777", distance: 2, rundate: "2023-01-02" },
  { id: "R003", runner: "U0123456", distance: 4, rundate: "2023-01-02" },
  { id: "R002", runner: "U7777777", distance: 1, rundate: "2022-12-10" },
  { id: "R001", runner: "U0123456", distance: 2, rundate: "2022-11-11" },
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
