/* tslint:disable */
/* eslint-disable */
import { Checkbox } from 'office-ui-fabric-react';
import * as React from 'react';
import { MultiChoiceFormStateValue } from '../FormStateValue';
import { IListFormFieldRendererProps } from './ListFormField';
import styles from './ListFormField_MultiChoice.module.scss';

export const ListFormField_MultiChoice: React.FunctionComponent<IListFormFieldRendererProps> = (props: IListFormFieldRendererProps) => {

    const { listFormContext, field, formStateKey } = props;

    const selectedChoices: string[] = listFormContext.formState.get<MultiChoiceFormStateValue>(formStateKey) || [];
    const choices: string[] = (field as any)['Choices'];

    const readonlyClassName = props.readonly ? styles.Readonly : '';

    return (
        <div className={`${styles.multichoice} ${readonlyClassName}`}>
            {choices && choices.map((option, index) =>
            (
                <Checkbox
                    disabled={props.disabled || props.readonly}
                    className={styles.option}
                    name={option}
                    label={option}
                    key={index}
                    checked={selectedChoices.indexOf(option) > -1}
                    onChange={(event: React.FormEvent<HTMLDivElement>, checked: boolean) => {

                        const idx = selectedChoices.indexOf(option)

                        if (checked && (idx === -1)) {
                            selectedChoices.push(option);
                        }
                        else if (!checked && idx > -1) {
                            selectedChoices.splice(idx, 1);
                        }

                        const formStateValue = [...selectedChoices]

                        listFormContext.formState.set<MultiChoiceFormStateValue>(formStateKey, formStateValue);

                        //trigger onchange
                        props.onChange && props.onChange(formStateValue);
                    }}
                    {...props.controlProps}
                />
            )
            )}
        </div>
    );
};