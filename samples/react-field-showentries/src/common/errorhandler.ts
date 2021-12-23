//https://pnp.github.io/pnpjs/concepts/error-handling/

import { hOP } from "@pnp/common";
import { Logger, LogLevel } from "@pnp/logging";
import { HttpRequestError } from "@pnp/odata";

export async function handleError(e: Error | HttpRequestError): Promise<void> {

  if (hOP(e, "isHttpRequestError")) {

    // we can read the json from the response
    const data = await (<HttpRequestError>e).response.json();

    // parse this however you want
    const message = typeof data["odata.error"] === "object" ? data["odata.error"].message.value : e.message;

    // we use the status to determine a custom logging level
    const level: LogLevel = (<HttpRequestError>e).status === 404 ? LogLevel.Warning : LogLevel.Info;

    // create a custom log entry
    Logger.log({
      data,
      level,
      message,
    });

  } else {
    // not an HttpRequestError so we just log message
    Logger.error(e);
  }
}