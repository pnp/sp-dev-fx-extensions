using System;
using System.Collections.Generic;
using Microsoft.Azure;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConvertToPDFRequest
{
    public static class EnvironmentConfigurationManager
    {
        /// <summary>
        /// Return ConnectionString from Cloud config if is defined as a Setting
        /// or from .config file (ConnectionStrings node)
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        /// <remarks>
        /// CloudConfigurationManager is not able to find the ConnectionString when is defined
        /// in a .config file
        /// </remarks>
        public static string GetConnectionString(string key)
        {
            var connectionString = CloudConfigurationManager.GetSetting(key);

            if (string.IsNullOrEmpty(connectionString))
            {
                return ConfigurationManager.ConnectionStrings[key].ConnectionString;
            }

            return connectionString;
        }

        public static string GetSetting(string key) => CloudConfigurationManager.GetSetting(key);

        public static string GetEnvironmentVariable(string key)
        {
            var value = Environment.GetEnvironmentVariable(key);

            if (string.IsNullOrEmpty(value))
            {
                return EnvironmentConfigurationManager.GetSetting(key);
            }

            return value;
        }
    }
}
