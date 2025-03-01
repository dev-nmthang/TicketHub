/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { sp } from '@pnp/sp';
import { ComboBox, IComboBoxOption, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { LookupFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';

export const ListFormField_Lookup: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const [options, setOptions] = React.useState<IComboBoxOption[]>([]);

    const lookupListField: string = (field as any)['LookupField'];

    const value = listFormContext.formState.get<LookupFormStateValue>(formStateKey);

    const fetchOptions = async () => {
        const lookupListGuid: string = (field as any)['LookupList'].replace('{', '').replace('}', '');

        const listItems = await sp.web.lists.getById(lookupListGuid).items.top(5000).select('Id', lookupListField).get();

        const sortFunction = (a: any, b: any) => {
            const aValue = a[lookupListField] || '';
            const bValue = b[lookupListField] || '';
            const aValueLower = aValue.toLowerCase();
            const bValueLower = bValue.toLowerCase();
            return (aValueLower < bValueLower) ? -1 : 1;
        }

        const orderedListItems = listItems.sort(sortFunction);
        setOptions(orderedListItems.map(x => ({ key: x.Id, text: x[lookupListField] ? x[lookupListField].toString() : '' })));
    }


    const handleChange = (selectedOption: IComboBoxOption) => {
        const newValue = {
            Id: selectedOption.key as number,
            [lookupListField]: selectedOption.text
        }
        listFormContext.formState.set<LookupFormStateValue>(formStateKey, newValue);
        //trigger onchange
        props.onChange && props.onChange(newValue);
    }

    React.useEffect(() => { fetchOptions(); }, []);


    return props.readonly ?
        <TextField
            value={value ? value.Title : null}
            readOnly
            {...props.controlProps}
        />
        :
        <ComboBox
            disabled={props.disabled}
            selectedKey={value ? value.Id : null}
            autoComplete="on"
            allowFreeform={false}
            options={options}
            onChange={(ev, selectedOption: IComboBoxOption) => handleChange(selectedOption)}
            {...props.controlProps}
        />

};