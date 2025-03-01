/* tslint:disable */
/* eslint-disable */
import { IListFormContext } from "./IListFormContext";

/**
 * Inherit a class from this base class. Implement the validation logic in the child class.
 */
export abstract class BaseFormValidator<T> {
    /**
     * @constructor
     * @param listFormContext 
     */
    constructor(listFormContext: IListFormContext) {
        this.listFormContext = listFormContext
    }

    protected listFormContext: IListFormContext;

    protected validateRequiredField = (fieldName: string) => {

        const value = this.getFieldValue(fieldName);

        let hasValue = false;

        if (Array.isArray(value)) {
            hasValue = value.length > 0;
        }
        else {
            hasValue = !!value
        }

        if (!hasValue) {
            this.listFormContext.validation.setErrorMessage(fieldName, this.requiredMessage);
        }
    }

    protected requiredMessage = "You can't leave this blank";

    protected getFieldValue(fieldName: string) {
        let value = this.listFormContext.formState.get(fieldName);

        //if undefined, then no component was registered so far with this formstate key. This might happen even in case if the user didn't visit the second / third pivot tab yet.
        //in this case check the listitem value instead of the component value as it will remain unmodified when saving.
        if (!this.listFormContext.isNewForm && value === undefined) {
            value = this.listFormContext.listItem[fieldName];
        }
        return value;
    }
    /**
     * Validates the form
     * @param args Validation arguments
     * @returns true if the form doesn't contain validation errors
     */
    public validate(args: T): boolean {
        this.listFormContext.validation.clearErrorMessages();

        this.validation(args);

        const isValid = !this.listFormContext.validation.hasErrorMessage();

        return isValid;
    }

    /**
     * Implement this function in the descendant class
     * @abstract
     * @param args Validation arguments
     */
    protected abstract validation(args: T): void
}
