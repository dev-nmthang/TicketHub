/* tslint:disable */
/* eslint-disable */
import { TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { NumberFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';

export const ListFormField_Number: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const value = listFormContext.formState.get<NumberFormStateValue>(formStateKey);

    const min = (field as any)['MinimumValue'] < -1e+308 ? null : (field as any)['MinimumValue'];
    const max = (field as any)['MaximumValue'] > 1e+308 ? null : (field as any)['MaximumValue'];

    return (
        <TextField
            readOnly={props.readonly}
            type='number'
            min={min}
            max={max}
            disabled={props.disabled}
            value={value}
            onChange={(ev, value) => {
                const nmbr = parseFloat(value);
                const formStateValue = isNaN(nmbr) ? null : nmbr;
                listFormContext.formState.set<NumberFormStateValue>(formStateKey, formStateValue);
                //trigger onchange
                props.onChange && props.onChange(formStateValue);
            }}
            {...props.controlProps}
        >
        </TextField>
    );
};