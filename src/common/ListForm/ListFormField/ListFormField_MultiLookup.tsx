/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { sp } from '@pnp/sp';
import { ComboBox, IComboBox, IComboBoxOption, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { IListFormFieldRendererProps } from '.';
import { MultiLookupFormStateVale } from '../FormStateValue';


export const ListFormField_MultiLookup: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const [options, setOptions] = React.useState<IComboBoxOption[]>(null);

    const lookupListGuid: string = (field as any)['LookupList'].replace('{', '').replace('}', '');
    const lookupListField: string = (field as any)['LookupField'];
    
    const selectedListItems = listFormContext.formState.get<MultiLookupFormStateVale>(formStateKey);

    const fetchOptions = async () => {

        if (!options) {

            const listItems = await sp.web.lists.getById(lookupListGuid).items.top(5000).select('Id', lookupListField).get();

            const sortFunction = (a: any, b: any) => {
                const aValue = a[lookupListField] || '';
                const bValue = b[lookupListField] || '';
                const aValueLower = aValue.toLowerCase();
                const bValueLower = bValue.toLowerCase();
                return (aValueLower < bValueLower) ? -1 : 1;
            }

            const orderedListItems = listItems.sort(sortFunction);
            setOptions(orderedListItems.map<IComboBoxOption>(x => ({ key: x.Id, text: x[lookupListField] ? x[lookupListField].toString() : '', data: x })));
        }
    }



    const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string): void => {
        if (option) {

            let newSelectedListItems;

            if (option.selected) {
                //add selected option
                const newlySelectedListItem = { Id: option.data.Id, [lookupListField]: option.data[lookupListField] };
                newSelectedListItems = [...selectedListItems, newlySelectedListItem];
            }
            else {
                //remove selected option
                newSelectedListItems = selectedListItems.filter(listItem => listItem.Id !== option.data.Id);
            }

            listFormContext.formState.set<MultiLookupFormStateVale>(formStateKey, newSelectedListItems);
            //trigger onchange
            props.onChange && props.onChange(newSelectedListItems);

        }
    };

    const selectedIds = selectedListItems?.map((x) => x.Id);
    const selectedTitles = selectedListItems?.map((x) => x[lookupListField]);

    React.useEffect(() => { fetchOptions(); }, []);

    return props.readonly ?
        <TextField
            value={selectedTitles?.join(', ')}
            readOnly
            {...props.controlProps}
        />
        :
        <ComboBox
            disabled={props.disabled}
            multiSelect
            allowFreeform={false}
            autoComplete='on'
            selectedKey={selectedIds}
            options={options ?? []}
            onChange={onChange}
            {...props.controlProps}
        />


};