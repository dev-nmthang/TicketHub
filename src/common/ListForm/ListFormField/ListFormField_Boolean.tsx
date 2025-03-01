/* tslint:disable */
/* eslint-disable */
import { Toggle } from 'office-ui-fabric-react';
import * as React from 'react';
import { BooleanFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';
import styles from './ListFormField_Boolean.module.scss'

export const ListFormField_Boolean: React.FunctionComponent<IListFormFieldRendererProps> = (props: React.PropsWithChildren<IListFormFieldRendererProps>) => {

    const { listFormContext, field, formStateKey } = props;

    const value = listFormContext.formState.get<BooleanFormStateValue>(formStateKey);

    const classname = props.readonly ? styles.Readonly : '';

    return (
        <Toggle
            className={classname}
            disabled={props.disabled || props.readonly}
            checked={value}
            onText="Yes"
            offText="No"
            onChange={(ev, checked) => {
                listFormContext.formState.set<BooleanFormStateValue>(formStateKey, checked);
                //trigger onchange
                props.onChange && props.onChange(checked);
            }}
            {...props.controlProps}
        />
    );
};