import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { RUN_DATASTORE } from "../datastores/run_data.ts";

export const LogRunFunction = DefineFunction({
  callback_id: "log_run",
  title: "Log a run",
  description: "Record a run in the datastore",
  source_file: "functions/log_run.ts",
  input_parameters: {
    properties: {
      runner: {
        type: Schema.slack.types.user_id,
        description: "Runner",
      },
      distance: {
        type: Schema.types.number,
        description: "Distance",
      },
      rundate: {
        type: Schema.slack.types.date,
        description: "Run date",
      },
    },
    required: ["runner", "distance", "rundate"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(LogRunFunction, async ({ inputs, client }) => {
  const { distance, rundate, runner } = inputs;
  const uuid = crypto.randomUUID();

  const putResponse = await client.apps.datastore.put({
    datastore: RUN_DATASTORE,
    item: {
      id: uuid,
      runner: runner,
      distance: distance,
      rundate: rundate,
    },
  });

  if (!putResponse.ok) {
    return { error: `Failed to store run: ${putResponse.error}` };
  }
  return { outputs: {} };
});
