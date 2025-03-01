/* tslint:disable */
/* eslint-disable */
import * as React from "react";
import { useListFormContext } from "./useListFormContext";
import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { IListFormContext } from "../IListFormContext";
import { IPeoplePickerUser } from "../../PeoplePicker/IPeoplePickerUser";

export function useRegisterField(listFormContext: IListFormContext, fieldInternalName: string): void {


    React.useEffect(() => {

        if (listFormContext.initialized) {

            //initialize the default or stored value in the formstate if it is undefined
            if (listFormContext.formState.get(fieldInternalName) === undefined) {

                const field: IFieldInfo = listFormContext.getField(fieldInternalName);
                if (!field) {
                    throw new Error(`useRegisterField error: Field with name '${fieldInternalName}' doesn't exist in the list '${listFormContext.list.Title}'`);
                }



                let initialOrDefaultValue;

                if (listFormContext.isNewForm) {
                    initialOrDefaultValue = listFormContext.getFieldDefaultValue(fieldInternalName);
                }
                else {
                    initialOrDefaultValue = listFormContext.listItem[fieldInternalName];
                }

                let formStateValue;

                // transform the initial data for the specified field type:

                //MULTILOOKUP
                if (field.FieldTypeKind === FieldTypes.Lookup && (field as any)['AllowMultipleValues']) {

                    const lookupListField: string = (field as any)['LookupField'];

                    const initialListItems = initialOrDefaultValue.map((x: any) => ({
                        Id: x.Id,
                        [lookupListField]: x[lookupListField]
                    }));

                    formStateValue = initialListItems;
                }
                //MULTICHOICE
                else if (field.FieldTypeKind === FieldTypes.MultiChoice){
                    formStateValue = initialOrDefaultValue || [];
                }
                //DATETIME
                else if (field.FieldTypeKind === FieldTypes.DateTime) {
                    const intialDate: Date = initialOrDefaultValue ? new Date(initialOrDefaultValue) : null;
                    formStateValue = intialDate;
                }
                //USER
                else if (field.FieldTypeKind === FieldTypes.User) {
                    const initialUsers: Partial<IPeoplePickerUser>[] = [].concat(initialOrDefaultValue || []).map<Partial<IPeoplePickerUser>>(x => ({ loginName: x.Name }));
                    formStateValue = initialUsers;
                }
                //OTHER
                else {
                    //NO TRANSFORMATION NEEDED
                    formStateValue = initialOrDefaultValue;
                }

                listFormContext.formState.set(fieldInternalName, formStateValue);
            }
        }

    }, [
        fieldInternalName,
        listFormContext.initialized,
    ]);
}