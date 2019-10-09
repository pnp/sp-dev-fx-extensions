using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Configuration;
using System;
using System.Data.Common;
using System.Data.SqlClient;
using System.Text;
namespace GenerateWordDocFunctionApp
{
    public static class Utilities
    {
        public static IConfiguration GetConfig(ExecutionContext context)
        {
            var config = new ConfigurationBuilder()
             .SetBasePath(context.FunctionAppDirectory)
             .AddJsonFile("local.settings.json", optional: true, reloadOnChange: true)
             .Build();

            return config;
        }

        public static string ReadJsonResponse(SqlDataReader reader)
        {
            StringBuilder stringBuilder = new StringBuilder();
            while (reader.Read())
            {
                stringBuilder.Append(reader.GetString(0));
            }
            return stringBuilder.ToString();
        }
    }
}

