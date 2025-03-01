/* tslint:disable */
/* eslint-disable */
import { DefaultButton, Dialog, DialogFooter, DialogType, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';

export interface IConfirmOptions {
    title?: string;
    message: string;
    onConfirm: (comment?: string) => void;
    onReject?: () => void;
    commentType?: 'mandatory' | 'optional' | 'none';
}

export interface IConfirmDialogProps {
    confirmOptions: IConfirmOptions;
    onDismiss: () => void;
}

export const ConfirmDialog: React.FunctionComponent<IConfirmDialogProps> = (props: React.PropsWithChildren<IConfirmDialogProps>) => {
    const [comment, setComment] = React.useState('');
    const [validationFailed, setValidationFailed] = React.useState(false);

    const visible = !!props.confirmOptions;
    const title = (props.confirmOptions ? props.confirmOptions.title : '') || 'Confirm';
    const message = props.confirmOptions ? props.confirmOptions.message : '';
    const commentType = (props.confirmOptions ? props.confirmOptions.commentType : '') || 'none';

    const validate = () => {
        const valid = commentType !== 'mandatory' || !!comment;
        setValidationFailed(!valid);
        return valid;
    }

    const handleOk = () => {
        if (validate()) {
            props.onDismiss();
            setComment('');
            props.confirmOptions && props.confirmOptions.onConfirm(comment);
        }
    }

    const handleClose = () => {
        props.onDismiss();
        props.confirmOptions.onReject?.()
        setComment('');
    }

    return (visible ? <Dialog
        hidden={false}
        minWidth={600}
        modalProps={{isBlocking: true }}
        onDismiss={handleClose}
        styles={{root: {whiteSpace: 'pre'}}}
        dialogContentProps={{
            type: DialogType.normal,
            title: title,
            closeButtonAriaLabel: 'Close',
            subText: message,
        }}
    // modalProps={modalProps}
    >
        {commentType !== 'none' &&
            <TextField
                required={commentType === 'mandatory'}
                errorMessage={(validationFailed ? 'Please leave a comment.' : '')}
                rows={6}
                multiline
                placeholder={'Comment...'}
                value={comment}
                onChange={(ev, newValue) => { setComment(newValue) }}
            />
        }

        <DialogFooter>
            <PrimaryButton onClick={handleOk} text="Ok" />
            <DefaultButton onClick={handleClose} text="Cancel" />
        </DialogFooter>
    </Dialog>
        :
        null
    );
};