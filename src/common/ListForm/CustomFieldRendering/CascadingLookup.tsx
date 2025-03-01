/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import { ComboBox, IComboBoxOption, TextField } from 'office-ui-fabric-react';
import { sp } from '@pnp/sp/presets/all';
import { FieldValidationError, IListFormFieldRendererProps, ListFormLabel } from '..';
import { useListFormContext } from '../hooks/useListFormContext';
import { IListFormContext } from '../IListFormContext';
import { LookupFormStateValue } from '../FormStateValue';


export interface ICascadingLookupProps extends IListFormFieldRendererProps {
    lookupListName: string;
    dependencyFieldName: string
    lookupListRelatedFieldName: string;
    onPopulateOptions?: (optionListItems: any[], selectedDependencyValue: any) => IComboBoxOption[] | Promise<IComboBoxOption[]>
    disabled?: boolean;
}

export const CascadingLookup: React.FunctionComponent<ICascadingLookupProps> = ({
    dependencyFieldName,
    field,
    // listFormContext, IMPORTANT: DO NOT USE. USE INSTEAD THE useListFormContext AS IT RERENDERS THE CONTROL WHEN THE DEPENDENCY FIELD CHANGES 
    lookupListName,
    lookupListRelatedFieldName,
    formStateKey,
    controlProps,
    disabled,
    onChange,
    onPopulateOptions,
    readonly,
    required
}: React.PropsWithChildren<ICascadingLookupProps>) => {

    const listFormContext:IListFormContext = useListFormContext();

    const [listItems, setListItems] = React.useState<any[]>(null);
    const [options, setOptions] = React.useState<IComboBoxOption[]>([]);

    const lookupListDisplayTextFieldName: string = (field as any)['LookupField'];

    const value = listFormContext.formState.get<LookupFormStateValue>(formStateKey);
    const selectedDependencyValue = listFormContext.formState.get<LookupFormStateValue>(dependencyFieldName);

    const fetchListItems = async () => {
        const listItems = await sp.web.lists.getByTitle(lookupListName).items.getAll();
        setListItems(listItems);
    }

    const setupAvailableSelection = async () => {

        if (listItems) {
            let options: IComboBoxOption[];

            if (onPopulateOptions) {
                options = await onPopulateOptions(listItems, selectedDependencyValue);
            }
            else {
                const optionListItems = listItems.filter(x => selectedDependencyValue && x[`${lookupListRelatedFieldName}Id`] === selectedDependencyValue.Id);
                options = optionListItems.map(x => ({ key: x.Id, text: x[lookupListDisplayTextFieldName] }));
            }

            setOptions(options);
            //update formstate when the selected value is filtered out.
            if (value && !options.some(o => o.key === value.Id)) {
                listFormContext.formState.set<LookupFormStateValue>(formStateKey, null);
            }
        }
    }



    const handleChange = (selectedOption: IComboBoxOption) => {
        const newValue = {
            Id: selectedOption.key as number,
            [lookupListDisplayTextFieldName]: selectedOption.text
        }

        listFormContext.formState.set<LookupFormStateValue>(formStateKey, newValue);

        //trigger onchange
        onChange && onChange(newValue);
    }

    React.useEffect(() => { void fetchListItems() }, []);
    React.useEffect(() => { void setupAvailableSelection() }, [listItems, selectedDependencyValue]);


    return (readonly ?
        <TextField
            value={value ? value.Title : null}
            readOnly
            {...controlProps}
        />
        :
        <ComboBox
            disabled={disabled}
            selectedKey={value ? value.Id : null}
            autoComplete='on'
            allowFreeform={false}
            options={options}
            onChange={(ev, selectedOption: IComboBoxOption) => handleChange(selectedOption)}
            {...controlProps}
        />
    );
};