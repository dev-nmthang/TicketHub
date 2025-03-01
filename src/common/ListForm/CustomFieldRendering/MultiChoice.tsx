/* tslint:disable */
/* eslint-disable */
import { Checkbox, ComboBox, Dropdown, IComboBox, IComboBoxOption, Icon, IconButton, IDropdownOption, ISelectableOption, SelectableOptionMenuItemType, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import { IListFormFieldRendererProps } from '..';
import { MultiChoiceFormStateValue } from '../FormStateValue';
import styles from './MultiChoice.module.scss';

export const MultiChoice: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;


    const selectedChoices: string[] = listFormContext.formState.get<MultiChoiceFormStateValue>(formStateKey) || [];
    const choices: string[] = (field as any)['Choices'];

    const selectedAllStatus: 'none' | 'some' | 'all' = selectedChoices.length === 0 ? 'none' : (selectedChoices.length === choices.length ? 'all' : 'some');

    const options = React.useMemo(() => {
        return [
            { key: 'selectAll', text: 'Select All', itemType: SelectableOptionMenuItemType.Header },
            { key: 'divider', text: '-', itemType: SelectableOptionMenuItemType.Divider },
            ...choices.map((choice): IDropdownOption => ({
                key: choice,
                text: choice
            }))
        ]
    }, [choices])

    const handleChange = (option: IDropdownOption): void => {

        const key = String(option.key);
        const idx = selectedChoices.indexOf(key);

        if (option.selected && (idx === -1)) {
            selectedChoices.push(key);
        }
        else if (!option.selected && idx > -1) {
            selectedChoices.splice(idx, 1);
        }

        const formStateValue = [...selectedChoices];

        listFormContext.formState.set<MultiChoiceFormStateValue>(formStateKey, formStateValue);

        //trigger onchange
        props.onChange && props.onChange(formStateValue);
    }

    const handleRemoveClick = (ev: React.MouseEvent, option: IDropdownOption): void => {
        ev.stopPropagation();
        option.selected = false;
        handleChange(option);
    }

    const handleSelectAllChange = (ev: React.FormEvent, checked?: boolean) => {

        let formStateValue: string[];

        if (selectedAllStatus === 'all') {
            //deselect all
            formStateValue = [];
        }
        else if (selectedAllStatus === 'none' || selectedAllStatus === 'some') {
            //select all
            formStateValue = [...choices];
        }

        listFormContext.formState.set<MultiChoiceFormStateValue>(formStateKey, formStateValue);

        //trigger onchange
        props.onChange && props.onChange(formStateValue);
    }

    const renderOption = (option: ISelectableOption, defaultRenderer: (props: ISelectableOption) => JSX.Element): JSX.Element => {

        if (option.key === 'selectAll') {
            return  <Checkbox
                className={styles.SelectAll}
                label='Select All'
                indeterminate={selectedAllStatus === 'some'}
                checked={selectedAllStatus === 'all'}
                onChange={handleSelectAllChange}
            />
        }
        else {
            return defaultRenderer(option);
        }
    }


    const renderSelectedOptions = (selectedOptions: IDropdownOption[]): JSX.Element => {
        return <div className={styles.SelectedOptions}>
            {
                selectedOptions.map((option: IDropdownOption) =>
                (
                    <div className={`${styles.Item} ${props.disabled ? styles.DisabledItem : ''}`} key={option.key}>
                        <div className={styles.ItemText}>
                            {option.text}
                        </div>
                        <div className={styles.ItemRemove} onClick={(ev) => handleRemoveClick(ev, option)}>
                            <Icon iconName='Cancel' />
                        </div>
                    </div>
                )
                )
            }
        </div>
    }

    return (
        <Dropdown
            className={styles.MultiChoice}
            disabled={props.disabled}
            multiSelect
            allowFreeform={false}
            autoComplete='on'
            selectedKeys={selectedChoices}
            onRenderTitle={renderSelectedOptions}
            options={options}
            onRenderItem={renderOption}
            onChange={(event: React.FormEvent<IComboBox>, option: IDropdownOption, index: number) => handleChange(option)}
            {...props.controlProps}
        />
    );
};