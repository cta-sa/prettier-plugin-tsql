const {
  concat,
  hardline,
  fill,
  indent,
  align,
  group,
  softline,
  join,
  line,
} = require("prettier/doc").builders;

const typeRegEx = /Microsoft\.SqlServer\.TransactSql\.ScriptDom\.(\w+), Microsoft\.SqlServer\.TransactSql\.ScriptDom/;
const getPathType = (path, opts, print) => path.$type.replace(typeRegEx, "$1");

const nodes = {
  TSqlScript: (path, opts, print) => {
    return concat([
      join(concat([hardline]), path.map(printer, "Batches")),
      hardline,
    ]);
  },
  TSqlBatch: (path, opts, print) => {
    return concat([
      join(concat([hardline]), path.map(printer, "Statements")),
      hardline,
    ]);
  },
  SelectStatement: (path, opts, print) => {
    const before = [];

    if (path.getValue().WithCtesAndXmlNamespaces)
      before.push(path.call(printer, "WithCtesAndXmlNamespaces"), hardline);

    return concat([
      concat(before),
      path.call(printer, "QueryExpression"),
      hardline,
    ]);
  },
  WithCtesAndXmlNamespaces: (path, opts, print) => {
    return concat([
      "WITH ",
      join(
        concat([",", hardline]),
        path.map(printer, "CommonTableExpressions")
      ),
    ]);
  },
  CommonTableExpression: (path, opts, print) => {
    return concat([
      path.call(printer, "ExpressionName"),
      " AS (",
      indent(
        concat([hardline, path.call(printer, "QueryExpression")]),
        hardline,
        ")"
      ),
    ]);
  },
  QuerySpecification: (path, opts, print) => {
    const after = [];

    if (path.getValue().FromClause)
      after.push(hardline, path.call(printer, "FromClause"));

    if (path.getValue().WhereClause)
      after.push(hardline, path.call(printer, "WhereClause"));

    if (path.getValue().OrderByClause)
      after.push(hardline, path.call(printer, "OrderByClause"));

    const elements = path
      .map(printer, "SelectElements")
      .map((a) => concat([line, a, ","]));

    if (elements.length > 0) elements[elements.length - 1].parts.pop();

    return concat(["SELECT", align(7, fill(elements)), concat(after)]);
  },
  FromClause: (path, opts, print) => {
    return concat([
      "FROM ",
      align(5, join(concat([",", line]), path.map(printer, "TableReferences"))),
    ]);
  },
  WhereClause: (path, opts, print) => {
    return concat(["WHERE ", align(6, path.call(printer, "SearchCondition"))]);
  },
  OrderByClause: (path, opts, print) => {
    return concat([
      "ORDER BY ",
      align(9, join(concat([",", line]), path.map(printer, "OrderByElements"))),
    ]);
  },
  ExpressionWithSortOrder: (path, opts, print) => {
    let type = "";
    switch (path.getValue().SortOrder) {
      case 0:
        type = "";
        break;
      case 1:
        type = "ASC";
        break;
      case 2:
        type = " DESC";
        break;
      default:
        throw new Error("default");
    }
    return concat([path.call(printer, "Expression"), type]);
  },
  BooleanTernaryExpression: (path, opts, print) => {
    let type = "";
    switch (path.getValue().TernaryExpressionType) {
      case 0:
        type = "BETWEEN ";
        break;
      case 1:
        type = "NOT BETWEEN ";
        break;
      default:
        throw new Error("default");
    }

    return concat([
      path.call(printer, "FirstExpression"),
      indent(
        concat([
          line,
          type,
          align(type.length, path.call(printer, "SecondExpression")),
          align(
            4,
            concat([
              line,
              "AND ",
              align(4, path.call(printer, "ThirdExpression")),
            ])
          ),
        ])
      ),
    ]);
  },
  QualifiedJoin: (path, opts, print) => {
    let join = "";
    switch (path.getValue().QualifiedJoinType) {
      case 0:
        join = "INNER";
        break;
      case 1:
        join = "LEFT";
        break;
      case 2:
        join = "RIGHT";
        break;
      case 3:
        join = "FULL";
        break;
      default:
        throw new Error("default");
    }
    join += " JOIN ";

    return concat([
      path.call(printer, "FirstTableReference"),
      indent(
        concat([
          hardline,
          join,
          path.call(printer, "SecondTableReference"),
          indent(
            concat([
              line,
              "ON ",
              align(3, path.call(printer, "SearchCondition")),
            ])
          ),
        ])
      ),
    ]);
  },
  BooleanParenthesisExpression: (path, opts, print) => {
    return concat(["(", align(1, path.call(printer, "Expression")), ")"]);
  },
  BooleanBinaryExpression: (path, opts, print) => {
    let type = "";
    switch (path.getValue().BinaryExpressionType) {
      case 0:
        type = "AND ";
        break;
      case 1:
        type = "OR ";
        break;
      default:
        throw new Error("default");
    }

    return concat([
      path.call(printer, "FirstExpression"),
      hardline,
      type,
      align(type.length, path.call(printer, "SecondExpression")),
    ]);
  },
  BooleanComparisonExpression: (path, opts, print) => {
    let type = "";
    switch (path.getValue().ComparisonType) {
      case 0:
        type = " = ";
        break;
      case 1:
        type = " > ";
        break;
      case 2:
        type = " < ";
        break;
      case 3:
        type = " >= ";
        break;
      case 4:
        type = " <= ";
        break;
      case 5:
        type = " <> ";
        break;
      case 6:
        type = " != ";
        break;
      case 7:
        type = " !< ";
        break;
      case 8:
        type = " !> ";
        break;
      case 9:
        throw new Error("LeftOuterJoin");
      case 10: // RightOuterJoin
        throw new Error("RightOuterJoin");
      default:
        throw new Error("default");
    }

    return concat([
      path.call(printer, "FirstExpression"),
      type,
      path.call(printer, "SecondExpression"),
    ]);
  },
  NamedTableReference: (path, opts, print) => {
    return concat([
      path.call(printer, "SchemaObject"),
      concat(path.getValue().Alias ? [" ", path.call(printer, "Alias")] : []),
    ]);
  },
  SelectScalarExpression: (path, opts, print) => {
    const output = [path.call(printer, "Expression")];

    if (path.getValue().ColumnName)
      output.push(" ", path.call(printer, "ColumnName"));

    return concat(output);
  },
  IdentifierOrValueExpression: (path, opts, print) => {
    return path.getValue().Identifier
      ? path.call(printer, "Identifier")
      : path.call(printer, "ValueExpression");
  },
  Identifier: (path, opts, print) => {
    let quote = "";
    switch (path.getValue().QuoteType) {
      case 0:
        break;
      case 1:
        quote = "]";
        break;
      case 2:
        quote = '"';
        break;
      default:
        throw new Error("default");
    }

    return concat([
      quote == "]" ? "[" : quote,
      path.getValue().Value.replace(quote, quote + quote),
      quote,
    ]);
  },
  ColumnReferenceExpression: (path, opts, print) => {
    return path.call(printer, "MultiPartIdentifier");
  },
  MultiPartIdentifier: (path, opts, print) => {
    return join(".", path.map(printer, "Identifiers"));
  },
  ConvertCall: (path, opts, print) => {
    const parameters = [
      path.call(printer, "DataType"),
      path.call(printer, "Parameter"),
    ];

    if (path.getValue().Style) parameters.push(path.call(printer, "Style"));

    return group(
      concat([
        "CONVERT(",
        indent(concat([softline, join(concat([",", line]), parameters)])),
        softline,
        ")",
      ])
    );
  },
  SqlDataTypeReference: (path, opts, print) => {
    return concat([
      path.call(printer, "Name"),
      concat(
        path.getValue().Parameters.length == 0
          ? []
          : ["(", join(", ", path.map(printer, "Parameters")), ")"]
      ),
    ]);
  },
  IntegerLiteral: (path, opts, print) => {
    return path.getValue().Value;
  },
  StringLiteral: (path, opts, print) => {
    return "'" + path.getValue().Value.replace("'", "''") + "'";
  },
  SchemaObjectName: (path, opts, print) => {
    return join(".", path.map(printer, "Identifiers"));
  },
  FunctionCall: (path, opts, print) => {
    return group(
      concat([
        concat(
          path.getValue().CallTarget
            ? [path.call(printer, "CallTarget"), "."]
            : []
        ),
        path.call(printer, "FunctionName"),
        "(",
        indent(
          concat([
            softline,
            join(concat([",", line]), path.map(printer, "Parameters")),
          ])
        ),
        ")",
      ])
    );
  },
  MultiPartIdentifierCallTarget: (path, opts, print) => {
    return path.call(printer, "MultiPartIdentifier");
  },
  SearchedCaseExpression: (path, opts, print) => {
    const expressions = path.map(printer, "WhenClauses");

    if (path.getValue().ElseExpression)
      expressions.push(
        group(concat(["ELSE ", align(5, path.call(printer, "ElseExpression"))]))
      );

    return group(
      concat([
        "CASE",
        indent(concat([hardline, join(hardline, expressions)])),
        hardline,
        "END",
      ])
    );
  },
  SimpleCaseExpression: (path, opts, print) => {
    const expressions = path.map(printer, "WhenClauses");

    if (path.getValue().ElseExpression)
      expressions.push(
        group(concat(["ELSE ", align(5, path.call(printer, "ElseExpression"))]))
      );

    return group(
      concat([
        "CASE",
        indent(concat([hardline, join(hardline, expressions)])),
        hardline,
        "END",
      ])
    );
  },
  SearchedWhenClause: (path, opts, print) => {
    return group(
      concat([
        "WHEN ",
        align(5, path.call(printer, "WhenExpression")),
        indent(
          concat([
            line,
            "THEN ",
            align(5, path.call(printer, "ThenExpression")),
          ])
        ),
      ])
    );
  },
  SimpleWhenClause: (path, opts, print) => {
    return group(
      concat([
        "WHEN ",
        align(5, path.call(printer, "WhenExpression")),
        indent(
          concat([
            line,
            "THEN ",
            align(5, path.call(printer, "ThenExpression")),
          ])
        ),
      ])
    );
  },
  InPredicate: (path, opts, print) => {
    return group(
      concat([
        path.call(printer, "Expression"),
        " IN (",
        indent(
          concat([
            softline,
            join(concat([",", line]), path.map(printer, "Values")),
          ])
        ),
        softline,
        ")",
      ])
    );
  },
  CoalesceExpression: (path, opts, print) => {
    return group(
      concat([
        "COALESCE(",
        indent(
          concat([
            softline,
            join(concat([",", line]), path.map(printer, "Expressions")),
          ])
        ),
        softline,
        ")",
      ])
    );
  },
  UnaryExpression: (path, opts, print) => {
    let type = "";
    switch (path.getValue().UnaryExpressionType) {
      case 0:
        type = "+";
        break;
      case 1:
        type = "-";
        break;
      case 2:
        type = "~";
        break;
      default:
        throw new Error("default");
    }

    return concat([type, path.call(printer, "Expression")]);
  },
  BooleanIsNullExpression: (path, opts, print) => {
    return concat([
      path.call(printer, "Expression"),
      path.getValue().IsNot ? " IS NOT NULL" : " IS NULL",
    ]);
  },
  ScalarSubquery: (path, opts, print) => {
    return concat([
      "(",
      indent(concat([hardline, path.call(printer, "QueryExpression")])),
      hardline,
      ")",
    ]);
  },
  BinaryExpression: (path, opts, print) => {
    let type = "";
    switch (path.getValue().BinaryExpressionType) {
      case 0:
        type = " + ";
        break;
      case 1:
        type = " - ";
        break;
      case 2:
        type = " * ";
        break;
      case 3:
        type = " / ";
        break;
      case 4:
        type = " % ";
        break;
      case 5:
        type = " & ";
        break;
      case 6:
        type = " | ";
        break;
      case 7:
        type = " ^ ";
        break;
      default:
        throw new Error("default");
    }

    return concat([
      path.call(printer, "FirstExpression"),
      type,
      path.call(printer, "SecondExpression"),
    ]);
  },
  SelectStarExpression: (path, opts, print) => {
    return concat([
      concat(
        path.getValue().Qualifier ? [path.call(printer, "Qualifier"), "."] : []
      ),
      "*",
    ]);
  },
  ParenthesisExpression: (path, opts, print) => {
    return concat(["(", path.call(printer, "Expression"), ")"]);
  },
  QueryDerivedTable: (path, opts, print) => {
    return concat([
      "(",
      indent(concat([hardline, path.call(printer, "QueryExpression")])),
      hardline,
      ")",
      concat(path.getValue().Alias ? [" ", path.call(printer, "Alias")] : []),
    ]);
  },
};

const printer = (path, opts, print) => {
  const cleanType = getPathType(path.getValue());

  if (!nodes[cleanType]) throw new Error(cleanType + " not found");

  return nodes[cleanType](path, opts, print);
};

module.exports = printer;
