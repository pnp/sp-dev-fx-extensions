//https://pnp.github.io/pnpjs/concepts/error-handling/
//Use Logger directly if the error message doesn't have to be displayed in UI

import { hOP } from "@pnp/common";
import { Logger, LogLevel } from "@pnp/logging";
import { HttpRequestError } from "@pnp/odata";

export async function handleError(e: Error | HttpRequestError): Promise<string> {

  let message: string="";
  
  if (hOP(e, "isHttpRequestError")) {

    const data = await (<HttpRequestError>e).response.json();
    message = typeof data["odata.error"] === "object" ? data["odata.error"].message.value : e.message;
    const level: LogLevel = (<HttpRequestError>e).status === 404 ? LogLevel.Warning : LogLevel.Info;

    Logger.log({
      data,
      level,
      message,
    });

  } else {
    Logger.error(e);
    message= e.message;
  }

  return message;
}