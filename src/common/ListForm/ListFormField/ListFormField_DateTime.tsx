/* tslint:disable */
/* eslint-disable */
import { DatePicker } from 'office-ui-fabric-react';
import * as React from 'react';
import { DateTimeFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';
import styles from './ListFormField_DateTime.module.scss'

export const ListFormField_DateTime: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const onChange = (newDate: Date) => {
        listFormContext.formState.set<DateTimeFormStateValue>(formStateKey, newDate);
        //trigger onchange
        props.onChange && props.onChange(newDate);
    }

    const value = listFormContext.formState.get<DateTimeFormStateValue>(formStateKey);

    const classname = props.readonly ? styles.Readonly : '';

    return (
        <DatePicker
            className={classname}
            disabled={props.disabled || props.readonly}
            allowTextInput
            value={value}
            onSelectDate={onChange}
            {...props.controlProps}
        //strings={{ shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }}
        />
    );
};