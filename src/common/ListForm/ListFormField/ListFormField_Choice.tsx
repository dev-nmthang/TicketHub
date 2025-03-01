/* tslint:disable */
/* eslint-disable */
import { Dropdown, IDropdownOption, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { ChoiceFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';

export const ListFormField_Choice: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;


    const options = React.useMemo<IDropdownOption[]>(() =>
        (field as any)['Choices'].map((x: string) => ({ key: x, text: x }))
        , [field]);


    const selectedValue = listFormContext.formState.get<ChoiceFormStateValue>(formStateKey);



    return props.readonly ?
        <TextField
            value={selectedValue}
            readOnly
            {...props.controlProps}
        />
        :
        <Dropdown
            disabled={props.disabled}
            selectedKey={selectedValue}
            onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                const formStateValue = item.key as string;
                listFormContext.formState.set<ChoiceFormStateValue>(formStateKey, formStateValue);
                //trigger onchange
                props.onChange && props.onChange(formStateValue);
            }}
            placeholder="Select an option"
            options={options}
            {...props.controlProps}
        />

};