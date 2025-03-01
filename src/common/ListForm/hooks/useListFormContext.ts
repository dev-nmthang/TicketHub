/* tslint:disable */
/* eslint-disable */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { sp } from "@pnp/sp";
import { FieldTypes, IFieldInfo } from "@pnp/sp/fields";
import { IListInfo } from '@pnp/sp/lists';
import * as React from "react";
import { IItemUpdateResult } from '@pnp/sp/items';
import { IListFormContext } from "../IListFormContext";
import InlineItem from "../../Common/InlineItem";
import { IListFormAttachment } from "../ListFormAttachments";
import { IListItem } from "../../Common/ListItemTypes";
import { ReactListFormContext } from "../ReactListFormContext";

export interface IListFormConfig {
    /**
     * name of the list
     */
    listName: string;
    /**
     * Id of the listitem to show. Pass 'null' in case of new form. 
     */
    itemId: number;
    /**
     * WebPartContext of the SPFX Webpart
     */
    webPartContext: WebPartContext;
    /**
     * Callback function to initiate your form before showing. This is the good place to set the inital values on your form. If a promise is returned the form rendering will await the promise before showing the form.
     * @param listFormContext 
     * @returns void or Promise
     */
    onInit?: (listFormContext: IListFormContext) => void | Promise<void>
    /**
     * readonly rendering of the form wont grey out the controls unlike disabled form
     */
    readonly?: boolean;
    /**
     * disable all controls on the form. The listFormContext object will reflect this setting
     */
    disabled?: boolean;
}

export const useListFormContext = (config?: IListFormConfig): IListFormContext => {

    type FormStateType = Record<string, any>;

    //if the hook was called with no configuration return the context provided from a parent component
    if (!config) {
        const ctx = React.useContext<IListFormContext>(ReactListFormContext);
        if (ctx) {
            return ctx;
        }
        else {
            throw new Error("useListFormContext has to be called with a configuration parameter on the root of the form component.");
        }
    }

    //else create the ListFormContext

    const [fetchingCompleted, setFetchingCompleted] = React.useState<boolean>(false);
    const [initialized, setInitialized] = React.useState<boolean>(false);
    const [listInfo, setListInfo] = React.useState<IListInfo>(null);
    const [originalListItem, setOriginalListItem] = React.useState<IListItem>(null);
    const [fields, setFields] = React.useState<IFieldInfo[]>(null);
    const [formState, setFormState] = React.useState<FormStateType>({});
    const [attachments, setAttachments] = React.useState<InlineItem<IListFormAttachment>[]>(null);

    //VALIDATION ERRORS
    type ValidationErrorMap = { [key: string]: string };
    const validationErrorRef = React.useRef<ValidationErrorMap>({});
    const [validationErrors, setValidationErrors] = React.useState<ValidationErrorMap>({});

    const clearValidationErrors = React.useCallback(() => {
        validationErrorRef.current = {};
        setValidationErrors(validationErrorRef.current);
    }, [])
    const getValidationError = React.useCallback((key: string) => {
        const errorMessage = validationErrorRef.current[key];
        return errorMessage;
    }, [])
    const setValidationError = React.useCallback((key: string, message: string) => {
        setValidationErrors((prevState: any) => {
            validationErrorRef.current = { ...prevState, [key]: message };
            return validationErrorRef.current;
        })

    }, [])
    const hasValidationErrors = React.useCallback(() => {
        let hasError = false;
        for (const key in validationErrorRef.current) {
            if (Object.prototype.hasOwnProperty.call(validationErrorRef.current, key)) {
                const errorMessage = validationErrorRef.current[key];
                hasError = !!errorMessage;
            }
        }
        return hasError;
    }, [])

    //FORMSTATE
    const getFormStateValue = React.useCallback(<T>(key: string):T => {
        return formState[key];
    }, [formState])
    const setFormStateValue = React.useCallback(<T>(key: string, value: T | ((oldValue: T) => T)) => {

        if (typeof value === 'function') {
            setFormState((prevFormState: FormStateType) => {

                const newValue: T = (value as Function)(prevFormState[key] as T);

                return {
                    ...prevFormState,
                    [key]: newValue
                }
            });
        }
        else {
            setFormState((prevFormState: FormStateType) => {
                return {
                    ...prevFormState,
                    [key]: value
                }
            });
        }


    }, [setFormState])

    //COMMON
    const isNewForm: boolean = React.useMemo((): boolean => (!config.itemId), [config.itemId]);

    const getField = React.useCallback((fieldInternalName: string) => {
        return fields.filter(f => f.InternalName === fieldInternalName)[0];
    },
        [fields]);

    const getFieldDefaultValue = React.useCallback((fieldInternalName: string) => {

        const field = getField(fieldInternalName);

        let value;

        switch (field.FieldTypeKind) {
            case FieldTypes.Boolean:
                value = !!Number(field.DefaultValue);
                break;
            case FieldTypes.Number:
                value = field.DefaultValue ? Number(field.DefaultValue) : null;
                break;
            case FieldTypes.MultiChoice:
                value = field.DefaultValue ? [field.DefaultValue] : [];
                break;
            case FieldTypes.Lookup:
                value = (field as any)['AllowMultipleValues'] ? [] : null;
                break;
            case FieldTypes.DateTime:
                if (field.DefaultValue === '[today]') {
                    value = new Date();
                }
                else {
                    value = field.DefaultValue;
                }
                break;
            default:
                value = field.DefaultValue;
                break;
        }

        return value;
    },
        [getField]);



    const saveListItem = React.useCallback(async (listItem: any, forceOverride: boolean = false, folderPath?: string) => {
        let result: IItemUpdateResult;
        if (isNewForm) {
            if (folderPath) {
                //create an empty item in a folder and update it
                const fieldValues = await sp.web.lists.getByTitle(listInfo.Title).addValidateUpdateItemUsingPath([{ FieldName: 'Author', FieldValue: null }], folderPath); //mandatory to give at least one field. (Author wont be null)
                const itemId = parseInt(fieldValues.filter(v => v.FieldName === 'Id')[0].FieldValue);
                result = await sp.web.lists.getByTitle(listInfo.Title).items.getById(itemId).update(listItem, undefined, listInfo.ListItemEntityTypeFullName);
            }
            else {
                result = await sp.web.lists.getByTitle(listInfo.Title).items.add(listItem, listInfo.ListItemEntityTypeFullName);
            }
        }
        else {
            let etag = '*';
            if (!forceOverride) {
                etag = (originalListItem as any)['odata.etag'];
            }
            result = await sp.web.lists.getByTitle(listInfo.Title).items.getById(originalListItem.Id).update(listItem, etag, listInfo.ListItemEntityTypeFullName);
        }
        return await result.item.get();
    },
        [isNewForm, listInfo, originalListItem]);

    const getListItemFromFormState = React.useCallback(async function <T extends IListItem = IListItem>(): Promise<T> {

        const getUserId = async (user: any): Promise<number> => {
            let userId: number = null;
            if (user) {
                const result = await sp.web.ensureUser(user.loginName);
                userId = result.data.Id;
            }
            return userId;
        }

        const extractedListItem: any = {};

        for (const key in formState) {
            if (Object.prototype.hasOwnProperty.call(formState, key)) {
                const property = formState[key];

                const field = getField(key);
                //only process the formstate property if it belongs to a field
                if (field && property !== undefined) {

                    switch (field.FieldTypeKind) {
                        case FieldTypes.DateTime:
                            extractedListItem[field.InternalName] = property ? property.toISOString() : null;
                            break;
                        case FieldTypes.User:
                            if ((field as any)['AllowMultipleValues']) {
                                let results: any[];
                                if (property) {
                                    results = await Promise.all(property.map((user: any) => getUserId(user)));
                                }
                                else {
                                    results = [];
                                }

                                extractedListItem[`${field.InternalName}Id`] = { results: results };
                            }
                            else {
                                extractedListItem[`${field.InternalName}Id`] = property ? await getUserId(property[0]) : null;
                            }
                            break;
                        case FieldTypes.MultiChoice:
                            extractedListItem[field.InternalName] = { results: property };
                            break;
                        case FieldTypes.Lookup:
                            if ((field as any)['AllowMultipleValues']) {
                                extractedListItem[`${field.InternalName}Id`] = { results: property ? property.map((x: any) => x.Id) : null };
                            }
                            else {
                                extractedListItem[`${field.InternalName}Id`] = property ? property.Id : null;
                            }
                            break;
                        default:
                            extractedListItem[field.InternalName] = property;
                            break;
                    }
                }
            }
        }

        return extractedListItem as T;
    }
        ,
        [formState, getField]);

    //FETCHING RESOURCES
    React.useEffect(() => {

        const loadList = async (listName: string): Promise<IListInfo> => {
            const listInfo: IListInfo = await sp.web.lists.getByTitle(listName).get();
            return listInfo;
        }

        const loadListFields = async (listName: string): Promise<IFieldInfo[]> => {
            const fieldInfos = await sp.web.lists.getByTitle(listName).fields();
            const visiblefields = fieldInfos.filter(f => f.Hidden === false);
            return visiblefields;
        }

        const loadListItem = async (fieldInfos: IFieldInfo[], listInfo: IListInfo, listName: string, itemId: number) => {
            const excludeFields = ['_AuthorByline'];
            const forceExpandFields = ['Author', 'Editor'];
            const nonInternalFields = fieldInfos.filter(f =>
                forceExpandFields.some(ef => f.InternalName === ef)
                || (
                    !f.FromBaseType &&
                    !excludeFields.some(ef => f.InternalName === ef)
                )
            );

            const userFields = nonInternalFields.filter(f => f.FieldTypeKind === FieldTypes.User);
            const lookupFields = nonInternalFields.filter(f => f.FieldTypeKind === FieldTypes.Lookup && (f as any)['IsDependentLookup'] !== true); //do not try retrieve dependent lookupfields aka additional lookup columns. It causes server error.


            const breakArrayIntoChunks = <T,>(arr: T[], chunkSize: number = 10): T[][] => {
                const result = [];
                for (let i = 0; i < arr.length; i += chunkSize) {
                    result.push(arr.slice(i, i + chunkSize));
                }

                return result;
            }
            const extractExpandFields = (field: IFieldInfo) => {
                const result = [`${field.InternalName}/Id`];
                switch (field.FieldTypeKind) {
                    case FieldTypes.User:
                        result.push(`${field.InternalName}/Title`);
                        result.push(`${field.InternalName}/Name`);
                        result.push(`${field.InternalName}/FirstName`);
                        result.push(`${field.InternalName}/LastName`);
                        break;
                    case FieldTypes.Lookup:
                        result.push(`${field.InternalName}/${(field as any)['LookupField']}`)
                }

                return result;
            };


            const query = sp.web.lists.getByTitle(listName).items.getById(itemId);
            let listItem = await query.select('*').get();

            const expandFields: IFieldInfo[] = [...userFields, ...lookupFields];

            await Promise.all(
                //the query string url can be too long in some cases because of the expand fields -> break the expand field requests into smaller chunks.
                breakArrayIntoChunks(expandFields).map(async (nextFieldInfos: IFieldInfo[]) => {
                    const expandList: string[] = nextFieldInfos.map(f => f.InternalName);
                    const selectList = nextFieldInfos.map(f => extractExpandFields(f)).reduce((acc: string[], currentValue: string[]) => acc.concat(currentValue), []);
                    const result = await query.select(...selectList).expand(...expandList).get();

                    listItem = { ...listItem, ...result };
                }));

            return listItem;
        }

        (async () => {
            const listInfoPromise = loadList(config.listName);
            const fieldInfosPromise = loadListFields(config.listName);
            const listInfo = await listInfoPromise;
            const fieldInfos = await fieldInfosPromise;

            let listItem;
            if (isNewForm) {
                listItem = null;
            }
            else {
                listItem = await loadListItem(fieldInfos, listInfo, config.listName, config.itemId);
            }

            setListInfo(listInfo);
            setFields(fieldInfos);
            setOriginalListItem(listItem);
            setFetchingCompleted(true);
        })();

    }, [config.listName, config.itemId]);


    const ctx: IListFormContext = {
        itemId: config.itemId,
        fields: fields,
        list: listInfo,
        isNewForm: isNewForm,
        listItem: originalListItem,
        readonly: !!config.readonly,
        disabled: !!config.disabled,
        webPartContext: config.webPartContext,
        formState: {
            get: getFormStateValue,
            set: setFormStateValue,
            getBoolean: getFormStateValue,
            setBoolean: setFormStateValue,
            getChoice: getFormStateValue,
            setChoice: setFormStateValue,
            getDateTime: getFormStateValue,
            setDateTime: setFormStateValue,
            getLookup: getFormStateValue,
            setLookup: setFormStateValue,
            getMultiChoice: getFormStateValue,
            setMultiChoice: setFormStateValue,
            getMultiLookup: getFormStateValue,
            setMultiLookup: setFormStateValue,
            getNumber: getFormStateValue,
            setNumber: setFormStateValue,
            getText: getFormStateValue,
            setText: setFormStateValue,
            getUsers: getFormStateValue,
            setUsers: setFormStateValue,
        },
        validation: {
            getErrorMessage: getValidationError,
            setErrorMessage: setValidationError,
            hasErrorMessage: hasValidationErrors,
            clearErrorMessages: clearValidationErrors
        },
        initialized: initialized,
        getFieldDefaultValue: getFieldDefaultValue,
        getField: getField,
        getListItemFromFormState: getListItemFromFormState,
        saveListItem: saveListItem,
        attachments: {
            getAttachments: () => attachments?.filter(a => !a.isDeleted),
            getAttachmentsAndDeletedAttachments: () => attachments,
            setAttachments: setAttachments
        },
    };


    React.useEffect(() => {
        (async () => {
            if (fetchingCompleted) {
                if (config.onInit) {
                    await config.onInit(ctx);
                }
                setInitialized(true);
            }
        })();
    }, [fetchingCompleted]);

    return ctx;
}
