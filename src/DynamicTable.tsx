import React, { useState } from 'react';
import NewColumnDialog from './NewColumnDialog';
import EditColumnDialog from './EditColumnDialog';
import {
  Button,
  ButtonGroup,
} from "@blueprintjs/core";


import { Column, Cell, Table2 } from '@blueprintjs/table';
import { dummyTableData } from './data/dummyData';
import { ColumnCalculation, ColumnData, DataTable, columns, ColumnAggregations } from './columnDataUtils'


const DynamicTable: React.FC = () => {


  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState<boolean>(false);
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState<boolean>(false);
  const [columnList, setColumnList] = useState<ColumnData[]>(columns)

  const dataTable = new DataTable(dummyTableData)
  dataTable.addColumns(columnList)
  dataTable.compile()

  const handleOpenNewColumnDialog = () => {
    setIsNewColumnDialogOpen(true);
  };

  const handleCloseNewColumnDialog = () => {
    setIsNewColumnDialogOpen(false);
  };

  const handleOpenEditColumnDialog = () => {
    setIsEditColumnDialogOpen(true);
  };

  const handleCloseEditColumnDialog = () => {
    setIsEditColumnDialogOpen(false);
  };

  const handleNewColumn = (name: string, expression: string, aggregation: ColumnAggregations) => {
    let newColumn = (new ColumnData(name, 'calculated', `${name.replace(/ /g, '_')}`))
    .withCalculation(new ColumnCalculation(expression))
    .withAggregation(aggregation)
    setColumnList(columnList.concat([newColumn]));
    setIsNewColumnDialogOpen(false);
  };

  const handleColumnEdit = (oldName: string, newName: string, newExpression: string, aggregation: ColumnAggregations) => {
    let editedColumnIndex = columnList.findIndex((column) => column.columnName === oldName);
    let newColumn = (new ColumnData(
      newName, 
      columnList[editedColumnIndex].columnType, 
      `${newName.replace(/ /g, '_')}`)
      ).withCalculation(new ColumnCalculation(newExpression))
      .withAggregation(aggregation);
    let newList = [...columnList]
    newList[editedColumnIndex] = newColumn;
    setColumnList(newList)
    setIsEditColumnDialogOpen(false)
  }

  const cellRenderer = (rowIndex: number, columnIndex: number) => {
    return <Cell>{dataTable.getValue(rowIndex, columnIndex)}</Cell>
  };

  const cols = dataTable.columns.map((column) => (
    <Column
      key={`${column.columnId}`}
      cellRenderer={cellRenderer}
      name={column.columnName}
    />
  ));

  return (
    <>
      <ButtonGroup minimal={false}>
        <Button icon="add" onClick={handleOpenNewColumnDialog}>Add column</Button>
        <Button icon="edit" onClick={handleOpenEditColumnDialog}>Edit column</Button>
      </ButtonGroup>
      <NewColumnDialog isOpen={isNewColumnDialogOpen} onClose={handleCloseNewColumnDialog} onConfirm={handleNewColumn} />
      <EditColumnDialog columns={columnList} isOpen={isEditColumnDialogOpen} onClose={handleCloseEditColumnDialog} onConfirm={handleColumnEdit} />
      <Table2 defaultRowHeight={30} numRows={dataTable.getRowsToRender()} cellRendererDependencies={[columnList]}>
        {cols}
      </Table2>
    </>
  );
};

export default DynamicTable;
