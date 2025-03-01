import * as React from 'react';
import styles from "./FieldValidationError.module.scss";

export interface IFieldValidationError {
    errorMessage: string;
}

export const FieldValidationError: React.FunctionComponent<IFieldValidationError> = (props: React.PropsWithChildren<IFieldValidationError>) => {

    if (!!props.errorMessage) {
        return <span className={styles.fieldErrorMessage}>{props.errorMessage}</span >
    }
    else {
        return null;
    }


};