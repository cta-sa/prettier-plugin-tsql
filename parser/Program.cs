using System;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.SqlServer.TransactSql.ScriptDom;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace SQLFormat
{
    public class TSqlFragmentContractResolver : DefaultContractResolver
    {
        public static readonly TSqlFragmentContractResolver Instance = new TSqlFragmentContractResolver();

        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);

            var ignore = new[] {
                "StartOffset",
                "FragmentLength",
                "StartLine",
                "StartColumn",
                "FirstTokenIndex",
                "LastTokenIndex",
                "ScriptTokenStream"
            };

            if (ignore.Contains(property.PropertyName))
                property.ShouldSerialize = instance => false;

            return property;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            if (args.Count() != 1)
            {
                Console.WriteLine(JsonConvert.SerializeObject(new { error = "you must inform only one argument" }));
                return;
            }

            var parser = new TSql150Parser(true);
            var tree = parser.Parse(new StringReader(args.First()), out var errors);
            if (errors.Count > 0)
            {
                Console.Write(JsonConvert.SerializeObject(new { error = errors.Select(error => error.Message) }));
                return;
            }

            SortOrder

            var settings = new JsonSerializerSettings
            {
                TypeNameHandling = TypeNameHandling.Objects,
                ContractResolver = new TSqlFragmentContractResolver()
            };
            Console.WriteLine(JsonConvert.SerializeObject(tree, settings));
        }
    }
}