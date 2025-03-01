/* tslint:disable */
/* eslint-disable */
import { FieldValidationError } from '../ListForm';
import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';
import InlineItem from '../Common/InlineItem';
import { ActionButton, DetailsList, DetailsListLayoutMode, IColumn, Icon, IconButton, Label, TextField } from 'office-ui-fabric-react';
import { SelectionMode } from '@uifabric/utilities';
import styles from './LibraryAttachments.module.scss'
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import { useListFormContext } from '../ListForm/hooks/useListFormContext';
import { IListFormContext } from '../ListForm/IListFormContext';

export interface ILibraryAttachmentsProps {
    libraryName: string;
    lookupFieldName: string;
    sectionFieldName?: string;
    section?: string;
    disabled?: boolean;
    allowMultiple?: boolean;
    accept?: string;
}

const FORMSTATE_KEY_LIBRARYATTACHMENTS_PREFIX = 'LibraryAttachments'

export interface ILibraryAttachmentListItem {
    Id: number;
    Title: string;
    FileLeafRef: string,
    FileRef: string,
    ServerRedirectedEmbedUrl: string
}
export interface INewLibraryAttachment {
    fileName: string;
    fileInput: HTMLInputElement
}

export const LibraryAttachments: React.FunctionComponent<ILibraryAttachmentsProps> = (props: React.PropsWithChildren<ILibraryAttachmentsProps>) => {

    const [detailsListItems, setDetailsListItems] = React.useState([]);
    const [fileInputKey, setFileInputKey] = React.useState<number>(0);
    const [renamingInlineItem, setRenamingInlineItem] = React.useState<InlineItem<INewLibraryAttachment>>(null);
    const fileInput = React.useRef<HTMLInputElement>();

    const listFormContext = useListFormContext();

    const formstatekey = getFormStateKey(props.section);

    const allowMultiple = props.allowMultiple ?? true;


    const init = async () => {
        const items: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = listFormContext.formState.get(formstatekey);

        if (!items) {
            if (listFormContext.itemId) {
                const listItems: ILibraryAttachmentListItem[] = await sp.web.lists.getByTitle(props.libraryName).items
                    .filter(`(${props.lookupFieldName} eq ${listFormContext.itemId})${props.section ? `and (${props.sectionFieldName} eq '${props.section}')` : ''}`)
                    .orderBy('Id')
                    .select('*', 'FileLeafRef', 'FileRef')
                    .get();
                const newInlineItems = listItems.map<InlineItem<ILibraryAttachmentListItem>>(listItem => InlineItem.CreateFromExistingItem<ILibraryAttachmentListItem>(listItem));
                listFormContext.formState.set(formstatekey, newInlineItems);
            }
            else {
                listFormContext.formState.set(formstatekey, []);
            }
        }
    };

    const handleAttachFileClick = () => {
        fileInput.current.click();
    }

    const handleFileInputChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {

        const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = listFormContext.formState.get(formstatekey);

        const fileName = fileInput.current.files[0].name;

        const newInlineItem = InlineItem.CreateNewItem<INewLibraryAttachment>();
        newInlineItem.update('fileInput', fileInput.current);
        newInlineItem.update('fileName', fileName);

        listFormContext.formState.set(formstatekey, [...inlineItems, newInlineItem]);
        setFileInputKey(fileInputKey + 1);

    }


    const handleDeleteClick = (inlineItemToDelete: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>) => {
        inlineItemToDelete.delete();
        //refresh
        const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = listFormContext.formState.get(formstatekey);
        listFormContext.formState.set(formstatekey, [...inlineItems]);
    }
    const handleRenameClick = (inlineItem: InlineItem<INewLibraryAttachment>) => {
        setRenamingInlineItem(inlineItem);
    }
    const handleRenameChange = (inlineItem: InlineItem<INewLibraryAttachment>, newName: string) => {
        inlineItem.update('fileName', newName);

        // //refresh
        const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = listFormContext.formState.get(formstatekey);
        listFormContext.formState.set(formstatekey, [...inlineItems]);
    }
    const handleRenameBlur = () => {
        setRenamingInlineItem(null);
    }
    const handleKeyPress = (ev:React.KeyboardEvent) => {
        if (ev.keyCode == 13) {
            setRenamingInlineItem(null);
        }
    }

    const createDetailsListItems = () => {

        const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = listFormContext.formState.get(formstatekey);

        if (inlineItems) {

            const notDeletedInlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = inlineItems.filter(inlineItem => !inlineItem.isDeleted);

            const items = notDeletedInlineItems.map(inlineItem => {

                const attachment = inlineItem.current;


                const deleteButton = <IconButton
                    className={styles.ActionButton}
                    style={{ height: 'auto' }}
                    iconProps={{ iconName: 'Delete' }}
                    title="Remove"
                    disabled={props.disabled || listFormContext.readonly}
                    onClick={(ev) => { handleDeleteClick(inlineItem); }}
                />


                if (inlineItem.isNew) {
                    const fileName = (attachment as INewLibraryAttachment).fileName;

                    const isRenaming = renamingInlineItem === inlineItem;

                    const renameButton = isRenaming ? null : <IconButton
                        className={styles.ActionButton}
                        style={{ height: 'auto' }}
                        iconProps={{ iconName: 'Edit' }}
                        title="Rename"
                        disabled={props.disabled}
                        onClick={(ev) => { handleRenameClick(inlineItem as InlineItem<INewLibraryAttachment>); }}
                    />
                    const file = isRenaming ?
                        <TextField underlined value={fileName} onKeyDown={handleKeyPress} onBlur={handleRenameBlur} onChange={(ev, newValue:string) => { handleRenameChange(inlineItem as InlineItem<INewLibraryAttachment>, newValue) }} />
                        :
                        <span>{fileName}</span>

                    return {
                        'Type': <Icon className={styles.AttachmentIcon} {...getFileTypeIconProps({ extension: getFileTypeFromFileName(fileName), size: 16 })} />,
                        'FileName': file,
                        'IsNew': '(New)',
                        'Action': <div className={styles.ActionButtonContainer}>{renameButton}{deleteButton}</div>
                    }
                }
                else {
                    const fileName = (attachment as ILibraryAttachmentListItem).FileLeafRef;
                    const url = (attachment as ILibraryAttachmentListItem).FileRef

                    return {
                        'Type': <Icon className={styles.AttachmentIcon} {...getFileTypeIconProps({ extension: getFileTypeFromFileName(fileName), size: 16 })} />,
                        'FileName': <span title={`Open: ${fileName}`} className={styles.AttachmentLink} onClick={() => { window.open(url); }}>{fileName}</span>,
                        'IsNew': '',
                        'Action': deleteButton
                    }
                }



            });

            setDetailsListItems(items);
        }
    }


    React.useEffect(() => { init() }, [listFormContext.itemId]);
    React.useEffect(() => { createDetailsListItems(); }, [listFormContext.formState.get(formstatekey), renamingInlineItem]);

    return (
        <>
            <div className={styles.LibraryAttachments}>

                <DetailsList
                    items={detailsListItems}
                    compact={true}
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={false}
                />

                {(allowMultiple || detailsListItems.length === 0) &&
                    <ActionButton
                        iconProps={{ iconName: 'Add' }}
                        text="Attach file"
                        disabled={props.disabled || listFormContext.readonly}
                        onClick={handleAttachFileClick}
                    />
                }
                <input key={fileInputKey} accept={props.accept ?? ''} style={{ 'display': 'none' }} onChange={(ev) => handleFileInputChanged(ev)} ref={fileInput} type="file" name="attachmentInput" id="attachmentInput" />

            </div>

            <FieldValidationError errorMessage={listFormContext.validation.getErrorMessage(formstatekey)} />
        </>
    );
};

const columns: IColumn[] = [
    { key: 'columnType', name: 'Type', fieldName: 'Type', minWidth: 15, maxWidth: 15 },
    { key: 'columnFileName', name: 'File Name', fieldName: 'FileName', minWidth: 150 },
    { key: 'columnIsNew', name: '', fieldName: 'IsNew', minWidth: 35, maxWidth: 35 },
    { key: 'columnAction', name: '', fieldName: 'Action', minWidth: 50, maxWidth: 50 },
];


export const getFormStateKey = (section?: string) => {
    return `${FORMSTATE_KEY_LIBRARYATTACHMENTS_PREFIX}${section ? '_' + section : ''}`;
}

const getFileTypeFromFileName = (filename: string) => filename?.split('.')?.pop();

export const saveLibraryAttachments = async (formContext: IListFormContext, listItemId: number, libraryName: string, lookupFieldName: string, sectionFieldName?: string, section?: string) => {

    const formstatekey = getFormStateKey(section);
    const formStateValue = formContext.formState.get(formstatekey);
    const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = formStateValue;

    const promises: Promise<any>[] = (inlineItems ?? []).map(async inlineItem => {

        if (inlineItem.isDeleted) {
            if (inlineItem.isNew) {
                return null;
            }
            else {
                const libraryAttachmentListItem = (inlineItem.current as ILibraryAttachmentListItem);
                return sp.web.lists.getByTitle(libraryName).items.getById(libraryAttachmentListItem.Id).recycle();
            }
        }
        else {
            if (inlineItem.isNew) {

                return new Promise<void>(async (resolve, reject) => {
                    try {
                        const newAttachment = (inlineItem.current as INewLibraryAttachment);

                        const fileName = `C${listItemId}-${section}-${newAttachment.fileName}`;

                        const file = newAttachment.fileInput.files[0];

                        const folderUrl = `${formContext.webPartContext.pageContext.web.serverRelativeUrl}/${libraryName}/`;

                        const result = await sp.web.getFolderByServerRelativeUrl(folderUrl).files.add(fileName, file, true);

                        const listItem = await sp.web.getFileByServerRelativePath(result.data.ServerRelativeUrl).listItemAllFields();

                        await sp.web.lists.getByTitle(libraryName).items.getById(listItem.Id).update({
                            [lookupFieldName]: listItemId,
                            [sectionFieldName]: section
                        });

                        resolve();
                    } catch (error) {
                        reject(error);
                    }

                })

            }
            else {
                //no update is possible of existing attachments
                return null;
            }
        }
    });

    return Promise.all(promises);

}

export const getLibraryAttachments = (formContext: IListFormContext, section?: string) => {
    const formstatekey = getFormStateKey(section);
    const formStateValue = formContext.formState.get(formstatekey);
    const inlineItems: InlineItem<ILibraryAttachmentListItem | INewLibraryAttachment>[] = formStateValue;
    return inlineItems?.filter(inlineItem => !inlineItem.isDeleted);
}