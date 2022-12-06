import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import type { SlackFunctionHandler } from "deno-slack-sdk/types.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";
import { DATASTORE } from "../datastores/rundata.ts";

export const LogRunFunction = DefineFunction({
  callback_id: "log_run_function",
  title: "Log run function",
  description: "Function to log a run",
  source_file: "functions/log_run_function.ts",
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
    properties: {
      updatedMsg: {
        type: Schema.types.string,
        description: "Updated message to be posted",
      },
    },
    required: ["updatedMsg"],
  },
});

const logFunction: SlackFunctionHandler<typeof LogRunFunction.definition> = 
async ({ inputs, token }) => {
    const { distance, rundate } = inputs;
    const updatedMsg = `:athletic_shoe: You submitted ${distance} mile(s) on ${rundate}. Keep up the great work!`;

    const client = SlackAPI(token, {});
    const uuid = crypto.randomUUID();

    const putResponse = await client.apps.datastore.put({
      datastore: DATASTORE,
      item: {
        id: uuid,
        runner: inputs.runner,
        distance: inputs.distance,
        rundate: inputs.rundate,
      },
    });

    if (!putResponse.ok) {
      return {
        error: putResponse.error,
        outputs: {},
      };
    } else {
      return {
        outputs: {updatedMsg: updatedMsg},
      };
    }
  }

export default logFunction;