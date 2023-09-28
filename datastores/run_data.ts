import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-sdk/types.ts";
import { DatastoreItem } from "deno-slack-api/types.ts";
import { DatastoreQueryResponse } from "deno-slack-api/typed-method-types/apps.ts";

export const RUN_DATASTORE = "running_datastore";

const RunningDatastore = DefineDatastore({
  name: RUN_DATASTORE,
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    runner: {
      type: Schema.slack.types.user_id,
    },
    distance: {
      type: Schema.types.number,
    },
    rundate: {
      type: Schema.slack.types.date,
    },
  },
});

/**
 * Returns the complete collection from the datastore for an expression
 *
 * @param client the client to interact with the Slack API
 * @param expressions optional filters and attributes to refine a query
 *
 * @returns ok if the query completed successfully
 * @returns items a list of responses from the datastore
 * @returns error the description of any server error
 */
export async function queryRunningDatastore(
  client: SlackAPIClient,
  expressions?: object,
): Promise<{
  ok: boolean;
  items: DatastoreItem<typeof RunningDatastore.definition>[];
  error?: string;
}> {
  const items: DatastoreItem<typeof RunningDatastore.definition>[] = [];
  let cursor = undefined;

  do {
    const runs: DatastoreQueryResponse<typeof RunningDatastore.definition> =
      await client.apps.datastore.query<typeof RunningDatastore.definition>({
        datastore: RUN_DATASTORE,
        cursor,
        ...expressions,
      });

    if (!runs.ok) {
      return { ok: false, items, error: runs.error };
    }

    cursor = runs.response_metadata?.next_cursor;
    items.push(...runs.items);
  } while (cursor);

  return { ok: true, items };
}

export default RunningDatastore;
