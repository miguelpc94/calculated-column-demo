import * as math from 'mathjs';


/**
 * This class defines a column calculation. Each ColumnData object contains an instance of it.
 * It contains methods to parse a mathematical expression, identifying column names as variables
 * and replacing it with numbers provided from other columns before evaluating the expression.
 */
export class ColumnCalculation {
    expectedVariables: Set<string>;
    expression: string;
    variables: { [key: string]: string | number }

    /**
     * Initialize a ColumnCalculation object. Expected variables are extracted from expression
     * automatically.
     * @param expression Mathematical expression with variables wrapped in '#' characters
     */
    constructor(expression: string) {
      this.expression = expression;
      this.variables = {};
      this.expectedVariables = this.extractExpectedVariables(this.expression);
    }
    
    /**
     * Extract calculation variables wrapped in '#' characters inside a mathematical expression.
     * Eg.: The expression "#Cell Density# * #Volume#" will produce the following expected variable
     * set {"Cell Density", "Volume"}.
     * @param expression Mathematical expression
     * @returns Unique variables identified in the expression
     */
    extractExpectedVariables(expression: string): Set<string> {
      let regex = /#(.*?)#/g;
      let variables = expression.match(regex);
      let cleanedVariables: string[] = variables ? variables.map(match => match.replace(/#/g, '')) : [];
      return new Set(cleanedVariables);
    }
    
    /**
     * Store provided variables for calculation. This will be used to replace variable names in
     * the stored expression before evaluation.
     * @param variables Dictionary mapping variables to values
     * @returns This instance of ColumnCalculation
     */
    withVariables(variables: { [key: string]: string | number }) {
      this.variables = variables;
      return this;
    }
    
    /**
     * Replace variables wrapped in the expression with provided variables.
     * Eg.: The expression "#Cell Density# * #Volume#" with provided varibles {"Cell Density": "100",
     * "Volume": "900"} will produce the expression "100 * 900".
     * @returns Replaced expression ready to be evaluated
     */
    replaceExpressionVariables(): string {
      let regex: RegExp = /#(.*?)#/g;
      let replacedExpression: string = this.expression.replace(regex, (match) => {
          return this.variables[match.replace(/#/g, '')].toString();
      });
      return replacedExpression;
    }
    
    /**
     * Evaluate mathematical expression with variables replaced. In case of errors it returns "ERROR".
     * @returns String of result of expression evaluation
     */
    calculate(): string {
      try {
        let result = math.evaluate(this.replaceExpressionVariables());
        if (result === undefined) return "ERROR";
        return String(result);
      } catch (error) {
        console.error("An error occurred: ", error);
      }
      return "ERROR"
    }
  }


export enum ColumnAggregations {
  None = 'None',
  Max = 'Max',
  Average = 'Average',
  Min = 'Min',
  Sum = 'Sum'
}

/**
  * Each ColumnData object will contain an instance of this class. It defines which aggregation
  * operation will be performed and how to performe it.
  */
export class ColumnAggregator {
  operation: ColumnAggregations

  /**
    * Takes in a member of ColumnAggregations to define which aggreation will be performed.
    * @param operation
    */
  constructor(operation: ColumnAggregations) {
    this.operation = operation
  }

  /**
    * Perform the assigned aggregation on the provided rows.
    * @param rows Dictionary mapping row index to value
    * @returns Result of aggregation
    */
  calculate(rows: { [key: string]: string | number }): JSX.Element {
    let result: string = '';
    try {
      switch(this.operation) {
        case ColumnAggregations.Max:
          result = String(Object.values(rows).reduce((max: number, value: number | string) => Number(value) > max ? Number(value) : max, -Infinity));
          if (result === '-Infinity') result='NaN';
            break;
        case ColumnAggregations.Min:
          result = String(Object.values(rows).reduce((min: number, value: number | string) => Number(value) < min ? Number(value) : min, Infinity));
          if (result === 'Infinity') result='NaN';
          break;
        case ColumnAggregations.Sum:
          result = String(Object.values(rows).reduce((sum: number, value: number | string) => Number(value) + sum, 0));
          break;
        case ColumnAggregations.Average:
          result = String(Object.values(rows).reduce((sum: number, value: number | string) => Number(value) + sum, 0) / Object.values(rows).length);
          break;
        default:
          return <></>;
      }
    } catch (error) {
      console.error("An error occurred: ", error);
      result = 'ERROR'
    }
    return <strong>{this.operation}: {result}</strong>;
  }
}
  

/**
  * This class manages the data that goes into a column. It stores row data, column 
  * calculation and aggregationsIt can calculate row data, column aggregations and 
  * retrieve it when the cells are rendered.
  */
export class ColumnData {
    columnName: string;
    columnType: "time" | "data" | "calculated" | '';
    columnId: string;
    calculation: ColumnCalculation;
    rows: { [key: string]: string | number }
    aggregation: ColumnAggregator
    
    /**
     * Initialize a ColumnData with a name, type and Id. Rows are initialized as 
     * an empty dict. Calculation and aggregation are initialized with a placeholder.
     * @param columnName 
     * @param columnType
     * @param columnId 
     */
    constructor(columnName: string, columnType: "time" | "data" | "calculated" | '', columnId: string) {
      this.columnName = columnName;
      this.columnType = columnType;
      this.columnId = columnId;
      this.calculation = new ColumnCalculation('');
      this.rows = {};
      this.aggregation = new ColumnAggregator(ColumnAggregations.None)
    }
    
    /**
     * Updates ColumnCalculation to be used
     * @param calculation 
     * @returns Instance with updated ColumnCalculation
     */
    withCalculation(calculation: ColumnCalculation) {
      this.calculation = calculation;
      return this;
    }

    /**
     * Updates column aggregation to be used
     * @param aggregation 
     * @returns Instance with updated aggregation
     */
    withAggregation(aggregation: ColumnAggregations) {
      this.aggregation = new ColumnAggregator(aggregation);
      return this;
    }
    
    /**
     * Assign rows to this column. Only needed for non calcculated columns
     */
    setRows(rows: { [key: string]: string | number }) {
      this.rows = rows;
    }
    
    /**
     * Calculates the value for the provided row with the variables passed and stores it
     */
    fillCalculatedRow(rowIndex: number, variables: { [key: string]: number | string }) {
      this.rows[String(rowIndex)] = this.calculation.withVariables(variables).calculate();
    }
    
    /**
     * Retrieves stored row value
     */
    getValue(rowIndex: number): string {
      const rowIndexStr = String(rowIndex)
      if (this.rows[rowIndexStr] !== undefined) {
        return String(this.rows[rowIndexStr]);
      }
      return '';
    }

    /**
     * Calculate column aggregation. Will return empty element if aggregation is None
     */
    getAggregation(): JSX.Element {
      return this.aggregation.calculate(this.rows);
    }
}
  
/**
 * This class manages all table data. It assigns rows to ColumnData objects and 
 * compile the full table data by running the column calculations with its expected 
 * variables and column aggregations
 */
export class DataTable {
    columns: ColumnData[]
    data: { [key: string]: { [key: string]: string | number } }
    columnNameToIndexMapping: { [key: string]: number }
    maxRow: number
    isThereColumnAggregations: boolean

    /**
     * Takes in data to be distributed to ColumnData objects. The first key is column
     * index and the second is row index.
     * @param data 
     */
    constructor(data: { [key: string]: { [key: string]: string | number } }) {
      this.data = data;
      this.columns = [];
      this.columnNameToIndexMapping = {};
      this.maxRow = 0;
      this.isThereColumnAggregations = false
    }

    /**
     * Updates the ColumnNameToIndex mapping. This mapping allows to quickly lookup
     * the column's index using its name.
     */
    updateColumnNameToIndexMapping() {
      this.columnNameToIndexMapping = {}
      for (let i = 0; i < this.columns.length; i++) {
        let column = this.columns[i];
        this.columnNameToIndexMapping[column.columnName] = i
      }
    }
    
    /**
     * Add new ColumnData onjects to the DataTable. The order in which it comes
     * determines which column from data it will be assigned to it. Eg.: The first
     * ColumnData to be added will be assigned to column 0 from the data.
     * @param columns 
     */
    addColumns(columns: ColumnData[]) {
      this.columns = this.columns.concat(columns)
      this.updateColumnNameToIndexMapping();
    }
    
    /**
     * Given a row index and a ColumnData object, this method collects variables for the
     * ColumnData's ColumnCalculation. The expected variables are column names, this method
     * get the row value of index rowIndex from columns with the same names as the expected
     * variables and return a dict with the mappings.
     */
    getCalculationVariables(rowIndex: number, column: ColumnData): { [key: string]: number | string } {
      let expectedVariables = column.calculation.expectedVariables;
      let variables: { [key: string]: number | string } = {};
      for (let columnName of expectedVariables) {
        let columnIndex = this.columnNameToIndexMapping[columnName]
        if (columnIndex !== undefined) {
          variables[columnName] = this.columns[columnIndex].getValue(rowIndex)
        }
      }
      return variables;
    }
    
    /**
     * Prepares data to render the table. Meta-data such as maximum number of rows to be
     * rendered and if there are aggregations is generated here. Rows are assigned to 
     * ColumnData objects and columns with calculation are provided with the expected
     * variables and their row values are calculated and stored.
     */
    compile() {
      this.maxRow = 0;
      for (let i=0; i < this.columns.length; i++) {
        let rows = this.data[String(i)]
        if (rows !== undefined) {
          this.columns[i].setRows(rows === undefined ? {} : rows)
          let newMaxRow = Object.keys(rows).reduce((max, current) => Number(current) > max ? Number(current) : max, 0)
          this.maxRow = newMaxRow > this.maxRow ? newMaxRow : this.maxRow
        }
      }
      this.isThereColumnAggregations = false
      for (let column of this.columns) {
        if (column.aggregation.operation !== ColumnAggregations.None) this.isThereColumnAggregations = true
        if (column.columnType == 'calculated') {
          for (let r=0; r <= this.maxRow; r++) {
            column.fillCalculatedRow(r, this.getCalculationVariables(r, column))
          }
        }
      }
    }
    
    /**
     * Retrives a cell value.
     */
    getValue(rowIndex: number, columnIndex: number): string | JSX.Element {
      if (rowIndex > this.maxRow) return this.columns[columnIndex].getAggregation()
      return this.columns[columnIndex].getValue(rowIndex);
    }

    /**
     * Determines how many rows should be rendered in the table.
     */
    getRowsToRender() {
      if (this.isThereColumnAggregations) {
        return this.maxRow + 2;
      }
      return this.maxRow + 1;
    }
}


/**
 * Initial columns for dummy data
 */
export const columns: ColumnData[] = [
  new ColumnData('Time', 'time', 'time_col'),
  new ColumnData('Cell Density', 'data', 'var_col_1'),
  new ColumnData('Volume', 'data', 'var_col_2'),
]