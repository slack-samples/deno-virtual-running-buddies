import * as mf from "mock-fetch/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import CollectTeamStatsFunction from "./collect_team_stats.ts";
import RunningDatastore from "../datastores/run_data.ts";

// Mocked date for stable testing
Date.now = () => new Date("2023-01-06").getTime();

// Collection of runs stored in the mocked datastore
let mockRuns: DatastoreItem<typeof RunningDatastore.definition>[];

// Replaces globalThis.fetch with the mocked copy
mf.install();

mf.mock("POST@/api/apps.datastore.query", async (args) => {
  const body = await args.formData();
  const dates = JSON.parse(body.get("expression_values") as string);
  const runs = mockRuns.filter((run) => (
    run.rundate >= dates[":start_date"] && run.rundate <= dates[":end_date"]
  ));
  return new Response(JSON.stringify({ ok: true, items: runs }));
});

const { createContext } = SlackFunctionTester("collect_team_stats");

Deno.test("Retrieve the empty set", async () => {
  mockRuns = [];
  const { outputs, error } = await CollectTeamStatsFunction(
    createContext({ inputs: {} }),
  );
  assertEquals(error, undefined);
  assertEquals(outputs?.weekly_distance, 0);
  assertEquals(outputs?.percent_change, 0);
});

Deno.test("Count only runs from the past week", async () => {
  mockRuns = [
    { id: "R006", runner: "U0123456", distance: 8, rundate: "2023-01-07" },
    { id: "R005", runner: "U0123456", distance: 4, rundate: "2023-01-06" },
    { id: "R004", runner: "U7777777", distance: 2, rundate: "2023-01-02" },
    { id: "R003", runner: "U0123456", distance: 4, rundate: "2022-12-31" },
    { id: "R002", runner: "U7777777", distance: 6, rundate: "2022-12-31" },
    { id: "R001", runner: "U8888888", distance: 1, rundate: "2022-12-28" },
  ];
  const { outputs, error } = await CollectTeamStatsFunction(
    createContext({ inputs: {} }),
  );
  assertEquals(error, undefined);
  assertEquals(outputs?.weekly_distance, 16);
  assertEquals(outputs?.percent_change, 1500);
});

Deno.test("Handle the infinite change", async () => {
  mockRuns = [
    { id: "R001", runner: "U0123456", distance: 10, rundate: "2023-01-05" },
  ];
  const { outputs, error } = await CollectTeamStatsFunction(
    createContext({ inputs: {} }),
  );
  assertEquals(error, undefined);
  assertEquals(outputs?.weekly_distance, 10);
  assertEquals(outputs?.percent_change, 0);
});
