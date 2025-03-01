/* eslint-disable @typescript-eslint/no-use-before-define */
/* tslint:disable */
/* eslint-disable */
import { TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { IListFormFieldRendererProps } from '..';
import { NumberFormStateValue } from '../FormStateValue';

export interface IDecimalNumberProps extends IListFormFieldRendererProps {
    numberOfDecimalPlaces: number
}

export const DecimalNumber: React.FunctionComponent<IDecimalNumberProps> = (props: React.PropsWithChildren<IDecimalNumberProps>) => {

    const { listFormContext, field, formStateKey, numberOfDecimalPlaces } = props;

    const [decimalString, setDecimalString] = React.useState<string>('');

    const value = listFormContext.formState.get<NumberFormStateValue>(formStateKey);

    const handleValueChange = () => {

        const currentNumber = convertDecimalStringToNumber(decimalString);
        const newNumber = value;

        if (currentNumber !== newNumber) {
            setDecimalString(convertNumberToDecimalString(value, props.numberOfDecimalPlaces));
        }
    }

    const handleInputChange = (input: string) => {
        //check if valid decimal string
        if (input === '' || testFixedDecimal(input, props.numberOfDecimalPlaces)) {
            setDecimalString(input);
            const number = convertDecimalStringToNumber(input);
            
            listFormContext.formState.set<NumberFormStateValue>(props.formStateKey, number);
            
            if (typeof props.onChange === 'function') {
                props.onChange(number);
            }
        }
    }

    React.useEffect(() => { handleValueChange() }, [value])

    return <TextField
        value={decimalString}
        onChange={(ev, newValue: string) => handleInputChange(newValue)}
        readOnly={!!props.readonly}
        styles={{field:{textAlign: 'end'}}}
        disabled={!!props.disabled}
        {...props.controlProps}
    />
};


export const testFixedDecimal = (numberString: string, maxNumberOfDecimalPlaces: number): boolean => {
    //eslint-disable-next-line
    return !!numberString?.match(new RegExp(`^(0|[1-9]\\d*)(\\.\\d{0,${maxNumberOfDecimalPlaces}})?$`, 'g'))
}

export const maximizeNumberDecimalPlaces = (number: number, maxNumberOfDecimalPlaces: number): number => {
    const D = Math.pow(10, maxNumberOfDecimalPlaces);
    return (Math.round(number * D) / D);
}

export const convertNumberToDecimalString = (number: number, maxNumberOfDecimalPlaces: number): string => {
    if (number === undefined || number === null) {
        return "";
    }
    else {
        return maximizeNumberDecimalPlaces(number, maxNumberOfDecimalPlaces).toString();
    }
}
export const convertDecimalStringToNumber = (decimalString: string): number => {
    if (!decimalString) {
        return null;
    }
    else {
        const ret = Number(decimalString);
        return isNaN(ret) ? null : ret;
    }
}
