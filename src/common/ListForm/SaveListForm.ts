/* tslint:disable */
/* eslint-disable */
import { saveListFormAttachment } from "./ListFormAttachments/ListFormAttachments";
import { IListFormContext } from "./IListFormContext";
import { IListItem } from "../Common/ListItemTypes";

export interface ISaveListFormConfiguration<PreSaveResult> {
    listFormContext: IListFormContext;
    folderPath?: string;
    skipValidation?: boolean;
    forceOverrideConcurrentSave?: boolean;
    onValidate?: (listItem: any) => boolean;
    onPreSave?: (listItem: any) => Promise<PreSaveResult> | PreSaveResult;
    getListItemUpdates?: (listItem: any, preSaveResult?: PreSaveResult) => Promise<any> | any;
    onSaveListItem?: (listItem:any, preSaveResult?: PreSaveResult) => Promise<IListItem>;
    onSaveSucceeded?: (savedListItem: any, preSaveResult?: PreSaveResult) => Promise<void> | void;
    onLoadingChanged?: (visible: boolean) => void;
    onError?: (error: any) => void;
}
export const SaveListForm = async <PreSaveResult>(properties: ISaveListFormConfiguration<PreSaveResult>): Promise<void> => {

    try {
        //ANIMATE LOADING
        properties.onLoadingChanged?.(true);

        //GET THE LISTITEM TO SAVE
        const formContextListItem = await properties.listFormContext.getListItemFromFormState();

        //VALIDATE
        if (properties.skipValidation || !properties.onValidate || properties.onValidate(formContextListItem)) {

            //PRE SAVE ACTION
            let preSaveResult: PreSaveResult;
            if (properties.onPreSave) {
                try {
                    preSaveResult = await properties.onPreSave(formContextListItem)
                } catch (error) {
                    if (error === undefined) {
                        return;
                    }
                    else {
                        throw error;
                    }
                }
            }

            //UPDATE THE LISTITEM
            const updateListItem = await properties.getListItemUpdates?.(formContextListItem, preSaveResult) ?? {};

            const listItem = {
                ...formContextListItem,
                ...updateListItem
            };

            //SAVE LISTITEM
            let savedListItem:IListItem;
            if (properties.onSaveListItem){
                savedListItem = await properties.onSaveListItem(listItem, preSaveResult);
            }
            else{
                savedListItem = await properties.listFormContext.saveListItem(listItem, properties.forceOverrideConcurrentSave, properties.folderPath);
            }

            //SAVE ATTACHMENTS
            await saveListFormAttachment(properties.listFormContext, savedListItem.Id);

            //SAVE SUCCEEDED CALLBACK
            properties.onSaveSucceeded && await properties.onSaveSucceeded(savedListItem, preSaveResult);
        }

    } catch (error) {
        //HANDLE ERROR
        if (properties.onError) {
            properties.onError(error);
        }
        else {
            alert(error);
        }
        console.error(error)
    }
    finally {
        //CLOSE LOADING ANIMATION
        properties.onLoadingChanged?.(false);
    }

}
