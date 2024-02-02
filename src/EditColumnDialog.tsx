import React from 'react';

import { Button, Dialog, FormGroup, InputGroup, Classes, HTMLSelect } from '@blueprintjs/core';
import { Tooltip2 } from "@blueprintjs/popover2";
import { ColumnAggregations, ColumnData } from './columnDataUtils';

interface EditColumnDialogProps {
    isOpen: boolean;
    columns: ColumnData[]
    onClose: () => void;
    onConfirm: (oldName: string, newName: string, newExpression: string, aggregation: ColumnAggregations) => void;
}

const NewColumnDialog: React.FC<EditColumnDialogProps> = ({ isOpen, onClose, onConfirm, columns }) => {
    const [expression, setExpression] = React.useState<string>('');
    const [columnName, setColumnName] = React.useState<string>('');
    const [aggregator, setAgregator] = React.useState<ColumnAggregations>(ColumnAggregations.None);
    const [selectedColumn, setSelectedColumn] = React.useState<string>('');

    const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpression(e.target.value);
    };

    const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnName(e.target.value);
    };

    const getColumn = (columnName: string): ColumnData => {
        const selectedColumn = columns.find((column) => column.columnName === columnName)
        if (selectedColumn === undefined) {
            return new ColumnData('', '', '')
        }
        return selectedColumn
    }

    const handleSelectedColumnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedColumn = getColumn(event.target.value)
        setSelectedColumn(event.target.value);
        setColumnName(selectedColumn.columnName)
        setExpression(selectedColumn.calculation.expression)
        setAgregator(selectedColumn.aggregation.operation)
    };

    const handleSelectedAggregator = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const aggregator = ColumnAggregations[event.target.value as keyof typeof ColumnAggregations]
        setAgregator(aggregator)
    };

    const handleConfirm = () => {
        onConfirm(selectedColumn, columnName, expression, aggregator);
        setSelectedColumn('');
        setExpression('');
        setColumnName('');
        setAgregator(ColumnAggregations.None);
    };

    const tooltipContent = (
        <span>
            Valid expressions include numbers, other column names wrapped in '#' characters, and mathematical operators. 
            E.g., "#Cell Density# * (#Volume# + 10)", where 'Cell Desity' and 'Volume' are column names.
        </span>
    );

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Edit column"
            className={Classes.DIALOG}
        >
            <div className={Classes.DIALOG_BODY}>
                <FormGroup label="Choose a column" labelFor="select-input">
                    <HTMLSelect id="select-input" value={selectedColumn} onChange={handleSelectedColumnChange} fill>
                        <option value="">Select an option...</option>
                        {columns.map((column) => <option key={column.columnId} value={column.columnName}>{column.columnName}</option>)}
                    </HTMLSelect>
                </FormGroup>
                {selectedColumn !== '' ? <>
                <FormGroup
                    label="New column name"
                    labelFor="text-input"
                    labelInfo=""
                    className={Classes.FORM_GROUP}
                >
                    <InputGroup 
                        id="text-input" 
                        placeholder="Type column name here" 
                        value={columnName} 
                        onChange={handleColumnNameChange}
                        className={Classes.INPUT_GROUP}
                        />
                </FormGroup>
                <FormGroup label="Aggregation" labelFor="select-input">
                    <HTMLSelect id="select-input" value={aggregator} onChange={handleSelectedAggregator} fill>
                        <option value="">Select an option...</option>
                        {Object.values(ColumnAggregations).map((aggregation) => <option key={aggregation} value={aggregation}>{aggregation}</option>)}
                    </HTMLSelect>
                </FormGroup>
                {getColumn(selectedColumn).columnType == 'calculated' ? <FormGroup
                    label="Calculation"
                    labelFor="text-input"
                    className={Classes.FORM_GROUP}
                >
                    <Tooltip2 content={tooltipContent} hoverOpenDelay={300}>
                        <InputGroup 
                            id="text-input" 
                            placeholder="Type expression here" 
                            value={expression} 
                            onChange={handleExpressionChange}
                            className={Classes.INPUT_GROUP}
                        />
                    </Tooltip2>
                </FormGroup>:''} </> : ''}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {selectedColumn !== '' ? <Button intent="primary" onClick={handleConfirm} className={Classes.BUTTON}>Confirm</Button> : ''}
                </div>
            </div>
        </Dialog>
    );
    
};

export default NewColumnDialog;
