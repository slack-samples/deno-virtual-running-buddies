import * as mf from "mock-fetch/mod.ts";
import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "std/testing/asserts.ts";
import LogRunFunction from "./log_run.ts";

// Replaces global fetch with the mocked copy
mf.install();

mf.mock("POST@/api/apps.datastore.put", () => {
  return new Response(JSON.stringify({ ok: true }));
});

const { createContext } = SlackFunctionTester("log_run");

Deno.test("Successfully save a run", async () => {
  const inputs = {
    runner: "U0123456",
    distance: 4,
    rundate: "2023-01-13",
  };

  const { error } = await LogRunFunction(createContext({ inputs }));
  assertEquals(error, undefined);
});
