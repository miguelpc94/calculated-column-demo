# Calculated Column Demo

This application allows users to create and manage a data table. The unique feature of this application is the ability to create calculated columns. These columns are defined by mathematical expressions that can reference other columns in the table.

## Running the Application

To run the application, follow these steps:

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the necessary dependencies by running npm install.
4. Start the development server by running `npm run dev`.

The application should now be running on `localhost:3000`.

## Calculated Columns

A calculated column is a column whose values are computed from a mathematical expression. The expression can include numbers, mathematical operators, and references to other columns in the table.

## Expression Syntax

The syntax for expressions is straightforward. To reference a column, wrap its name in # characters. For example, if you have a column named Cell Density, you would reference it in an expression as #Cell Density#.

Here's an example of a valid expression:

```
#Cell Density# * (#Volume# + 10)
```

In this expression, 'Cell Density' and 'Volume' are column names. The expression multiplies the value in the 'Cell Density' column by the sum of the value in the 'Volume' column and 10.

The application uses the `mathjs` library to parse and evaluate expressions. This means you can use any mathematical operators or functions that the library supports in your expressions.

When you create a calculated column, the application evaluates its expression for each row in the table and stores the results. If you later change the values in a column that the expression references, the application automatically recalculates the values in the calculated column.

## Possible improvements

### Calculation syntax highlighting and validation

When the user is typing the mathematical expression for a calculated column, syntax highlghting for column names and operators could help validate it. It may also improve readability for complex expressions.

### Table compilation optimization

When a new column is created, all the data for the table needs to be recalulated(compiled). This process could be imrpoved to only update affected rows.
For massive files, instead of calculating all the rows, the process should only calculate the rows being viewed by the user plus some buffer.

### Rate of change calculations

A modifier could be added to the column name references in the calculated column's expression to indicate that a previous row value should be fetched, for example the expression `#Cell Density[-1]#` for a calculated column would produce a column with rows populated by the previous Cell Density values, as seen bellow:

| Cell Density | New calculated column |
| --------------- | --------------- |
| 10    |     |
| 20    | 10    |
| 30    | 20    |

This would allow the creation of a calculated column with expression `#Cell Density[-1]# - #Cell Density#`, which would produce the rate of change between Cell Density records.
