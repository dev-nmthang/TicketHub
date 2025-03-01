/* tslint:disable */
/* eslint-disable */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { sp } from '@pnp/sp';
import "@pnp/sp/attachments";
import { IAttachmentInfo } from '@pnp/sp/attachments';
import * as React from 'react';
import styles from './ListFormAttachments.module.scss';
import { ActionButton, DetailsList, DetailsListLayoutMode, IColumn, Icon, IconButton, SelectionMode } from 'office-ui-fabric-react';
import { getFileTypeIconProps } from '@fluentui/react-file-type-icons';
import InlineItem from '../../Common/InlineItem';
import { useListFormContext } from '../hooks/useListFormContext';
import { IListFormContext } from '../IListFormContext';
import { IAttachmentFileInfo } from '@pnp/sp/attachments';


export interface IListFormAttachmentsProps {
    disabled?: boolean;
}

export interface IListFormAttachment extends Partial<IAttachmentInfo> {
    FileInput?: HTMLInputElement;
}

export const ListFormAttachments: React.FunctionComponent<IListFormAttachmentsProps> = (props: React.PropsWithChildren<IListFormAttachmentsProps>) => {

    const [fileInputKey, setFileInputKey] = React.useState<number>(0);

    const fileInput = React.useRef<HTMLInputElement>();

    const listFormContext = useListFormContext();

    const disabled: boolean = props.disabled || listFormContext.disabled;

    const currentAttachmentInlineItems: InlineItem<IListFormAttachment>[] = listFormContext.attachments.getAttachmentsAndDeletedAttachments();

    const fetchAttachments = async () => {

        if (!currentAttachmentInlineItems) {

            const attachments: IListFormAttachment[] = [];

            if (!listFormContext.isNewForm) {
                const alreadyUploadedAttachments: IAttachmentInfo[] = await sp.web.lists.getByTitle(listFormContext.list.Title).items.getById(listFormContext.listItem.Id).attachmentFiles.get();
                attachments.push(...alreadyUploadedAttachments);
            }
            listFormContext.attachments.setAttachments(attachments.map(attachment => InlineItem.CreateFromExistingItem(attachment)));
        }
    };


    const columns: IColumn[] = [
        {
            key: 'columnIcon',
            name: '',
            iconName: 'Page',
            isIconOnly: true,
            minWidth: 16,
            maxWidth: 16,
            onRender: (inlineItem: InlineItem<IListFormAttachment>) => {
                const fileName = inlineItem.current.FileName;
                const fileType = getFileTypeFromFileName(fileName);
                return <Icon
                    className={styles.attachmentIcon}
                    {...getFileTypeIconProps({ extension: fileType, size: 16 })}
                />
            }
        },
        {
            key: 'columnFileName',
            name: 'Attachment',
            minWidth: 210,
            isRowHeader: true,
            // isResizable: true,
            isPadded: true,
            onRender: (inlineItem: InlineItem<IListFormAttachment>) => {
                const attachment = inlineItem.current;
                if (inlineItem.isNew) {
                    return <span>{attachment.FileName}</span>
                }
                else {
                    return <a data-interception="off" target='_blank' href={attachment.ServerRelativeUrl} >{attachment.FileName}</a>
                }
            }
        },
        {
            key: 'columnIsNew',
            name: '',
            minWidth: 30,
            maxWidth: 30,
            isPadded: true,
            onRender: (inlineItem: InlineItem<IListFormAttachment>) => {
                return inlineItem.isNew ? '(new)' : '';
            }
        },
        {
            key: 'columnAction',
            name: '',
            minWidth: 20,
            maxWidth: 20,
            isIconOnly: true,
            onRender: (inlineItem: InlineItem<IListFormAttachment>) => {

                function onRemoveClick() {
                    inlineItem.delete();
                    listFormContext.attachments.setAttachments([...currentAttachmentInlineItems]);
                }

                return disabled ? null : <IconButton
                    className={styles.removeButton}
                    style={{ height: 'auto' }}
                    iconProps={{ iconName: 'Delete' }}
                    title="Remove"
                    disabled={disabled || listFormContext.readonly}
                    onClick={onRemoveClick}
                />
            }
        }
    ]


    const handleAttachFileClick = () => {
        fileInput.current.click();
    }

    const handleFileInputChanged = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const fileName = fileInput.current.files[0].name;

        const isNameReserved = (currentAttachmentInlineItems
            .filter(inlineItem => !inlineItem.isDeleted)
            .filter(inlineItem => inlineItem.current.FileName === fileName).length > 0);

        if (isNameReserved) {
            alert(`Attachment with name '${fileName}' already exists. Please upload a file with different name.`);
        }
        else {
            const newListFormAttachment: IListFormAttachment = {
                FileInput: fileInput.current,
                FileName: fileName
            }

            listFormContext.attachments.setAttachments([...currentAttachmentInlineItems, InlineItem.CreateNewItem(newListFormAttachment)]);
            setFileInputKey(fileInputKey + 1);
        }
    }

    React.useEffect(() => { fetchAttachments() }, [listFormContext.itemId])

    return (
        <div className={styles.attachments}>

            <DetailsList
                items={currentAttachmentInlineItems?.filter(x => !x.isDeleted) ?? []}
                compact={true}
                columns={columns}
                selectionMode={SelectionMode.none}
                getKey={(item: InlineItem<IListFormAttachment>, idx: number) => item.guid.toString()}
                layoutMode={DetailsListLayoutMode.justified}
                isHeaderVisible={false}
            />
            <ActionButton
                iconProps={{ iconName: 'Add' }}
                text="Attach file"
                disabled={props.disabled || listFormContext.readonly || listFormContext.disabled}
                onClick={handleAttachFileClick}
            />

            <input key={fileInputKey} style={{ 'display': 'none' }} onChange={(ev) => handleFileInputChanged(ev)} ref={fileInput} type="file" name="attachmentInput" id="attachmentInput" />

        </div>
    );
};

export const saveListFormAttachment = async (listFormContext: IListFormContext, listItemId: number) => {

    const attachmentInlineItems = listFormContext.attachments.getAttachmentsAndDeletedAttachments() ?? [];

    const removedFileNames: string[] = [];
    const newAttachmentFileInfos: IAttachmentFileInfo[] = [];

    const promises = attachmentInlineItems.map<Promise<void>>(async (attachmentInlineItem) => {
        //attachments to be deleted
        if (attachmentInlineItem.isDeleted && !attachmentInlineItem.isNew) {
            removedFileNames.push(attachmentInlineItem.current.FileName)
        }

        //new attachments
        if (!attachmentInlineItem.isDeleted && attachmentInlineItem.isNew) {

            const content = await readFileInputContent(attachmentInlineItem.current.FileInput);

            newAttachmentFileInfos.push({
                name: attachmentInlineItem.current.FileName,
                content: content
            });
        }
    })

    await Promise.all(promises);

    await Promise.all([
        // UPLOAD NEW FILE ATTACHMENTS
        newAttachmentFileInfos.length > 0 ?
            sp.web.lists.getByTitle(listFormContext.list.Title).items.getById(listItemId).attachmentFiles.addMultiple(newAttachmentFileInfos)
            : null,
        // RECYCLE REMOVED ATTACHMENTS
        removedFileNames.length > 0 ?
            sp.web.lists.getByTitle(listFormContext.list.Title).items.getById(listItemId).attachmentFiles.recycleMultiple(...removedFileNames)
            : null
    ]);

}

async function readFileInputContent(fileInput: HTMLInputElement): Promise<string | ArrayBuffer> {

    return new Promise<string | ArrayBuffer>((resolve, reject) => {

        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const content = reader.result;
            resolve(content);
        }
        reader.onerror = (ev) => {
            reject('Error occured while reading the file.');
        }

        reader.readAsArrayBuffer(file);
    });
}


// const getFileNameFromPath = (path: string) => path.split('/').pop().split('\\').pop();
const getFileTypeFromFileName = (filename: string) => filename.split('.').pop();


