/* tslint:disable */
/* eslint-disable */
import { TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { TextFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';

export const ListFormField_Note: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const value = listFormContext.formState.get<TextFormStateValue>(formStateKey);

    return (
        <TextField
            readOnly={props.readonly}
            multiline
            disabled={props.disabled}
            autoAdjustHeight
            value={value}
            onChange={(ev, value) => {
                listFormContext.formState.set<TextFormStateValue>(formStateKey, value);
                //trigger onchange
                props.onChange && props.onChange(value);
            }}
            {...props.controlProps}
        />
    );
};