import React from 'react';

import { Button, Dialog, FormGroup, InputGroup, Classes, HTMLSelect } from '@blueprintjs/core';
import { Tooltip2 } from "@blueprintjs/popover2";
import { ColumnAggregations } from './columnDataUtils';

interface NewColumnDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string, expression: string, aggregation: ColumnAggregations)=> void;
}

const NewColumnDialog: React.FC<NewColumnDialogProps> = ({ isOpen, onClose, onConfirm }) => {
    const [expression, setExpression] = React.useState<string>('');
    const [columnName, setColumnName] = React.useState<string>('');
    const [aggregator, setAgregator] = React.useState<ColumnAggregations>(ColumnAggregations.None);

    const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpression(e.target.value);
    };

    const handleColumnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColumnName(e.target.value);
    };

    const handleSelectedAggregator = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const aggregator = ColumnAggregations[event.target.value as keyof typeof ColumnAggregations]
        setAgregator(aggregator)
    };

    const handleConfirm = () => {
        onConfirm(columnName, expression, aggregator);
        setExpression('');
        setColumnName('')
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
            title="New calculated column"
            className={Classes.DIALOG}
        >
            <div className={Classes.DIALOG_BODY}>
                <FormGroup
                    label="New column name"
                    labelFor="text-input"
                    labelInfo="(required)"
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
                <FormGroup
                    label="Calculation"
                    labelFor="text-input"
                    labelInfo="(required)"
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
                </FormGroup>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    {columnName !== '' && expression !== '' ? 
                        <Button intent="primary" onClick={handleConfirm} className={Classes.BUTTON}>Confirm</Button>
                    : ''}
                </div>
            </div>
        </Dialog>
    );
    
};

export default NewColumnDialog;
