 /**
 * Gets environment variable
 * @param name
 * @returns environment variable
 */
export function getEnviromentVariable(name: string): string {
    return process.env[name];
  }