/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './ImagePicker.module.scss';
import { IList, sp } from '@pnp/sp/presets/all';

export interface IImagePicker {
    imageFieldValue: any;
    onFileSelected: (file: File) => any;
    loading?: boolean;
    label?: string;
    inline?: boolean;
    style?: any;
    className?: string;
    readOnly?: boolean;
}

const getImageByType = (imageFieldValue: any, type: 'normal' | 'thumb') => {
    const fallBack = imageFieldValue.serverRelativeUrl;
    switch (type) {
        case 'normal': {
            return fallBack;
        }
        case 'thumb': {
            const imageUrl = imageFieldValue.thumbnailRenderer && imageFieldValue.thumbnailRenderer.spItemUrl;
            return imageUrl 
                ? `${imageUrl}/thumbnails/0/c48x48/content`
                : fallBack
        }
    }
};

export const getImage = (imageFieldValue: any, type: 'normal' | 'thumb') => {
    if(!imageFieldValue)
        return null

    let imageFieldObj;

    if( typeof imageFieldValue === 'object' &&
        !Array.isArray(imageFieldValue) &&
        imageFieldValue !== null
    ){
        imageFieldObj = imageFieldValue;
    }
    else {
        try {
            imageFieldObj = JSON.parse(imageFieldValue);
        }
        catch(e) {
            console.error(e);
        }
    }

    return getImageByType(imageFieldObj, type);
};

export const renderImage = (imageFieldValue: any, type: 'normal' | 'thumb', style?: any) => {
    const image = getImage(imageFieldValue, type);
    
    return image
        ? <img src={image} alt="" style={style || {maxHeight: 32}}/>
        : <div></div>
};

export const pushFile = async(context: any, listName:string, itemId: number, file: File, fieldName: string) => {
    const list: any = await sp.web.lists.getByTitle(listName).get();
    
    const apiRestPoint = `${context.pageContext.web.absoluteUrl}/_api/web/UploadImage(listTitle=@a1,imageName=@a2,listId=@a3,itemId=@a4)?@a1=%27${listName}%27&@a2=%27${file.name}%27&@a3=%27${list.Id}%27&@a4=${itemId}`;

    const result: SPHttpClientResponse = await context.spHttpClient.post(apiRestPoint, SPHttpClient.configurations.v1, {
      body: file
    })

    const data = await result.json();

    console.log(data);

    let newImageFieldValue;

    newImageFieldValue = {
        type: "thumbnail",
        fileName: data.Name,
        nativeFile: {},
        fieldName: fieldName,
        serverRelativeUrl: data.ServerRelativeUrl,
        id: data.UniqueId
    };

    return JSON.stringify(newImageFieldValue);
  }

export const ImagePicker: React.FunctionComponent<IImagePicker> = props => {
    const [imageSrc, setImageSrc] = React.useState(null);
    const hiddenInputRef = React.useRef(null);

    React.useEffect(() => {
        setImageSrc(getImage(props.imageFieldValue, 'thumb'));
    }, []);

    const onInputChangeHandler = async (e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.currentTarget.files && e.currentTarget.files.length) {
            const file: File = e.currentTarget.files[0];
            setImageSrc(URL.createObjectURL(file));

            return props.onFileSelected(file);
        }
    };

    return (
        <div 
            className={[styles.ImagePicker, props.className || ""].join(' ')} 
            style={{...props.style, display: props.inline ? 'flex' : 'block'}}
        >
            <label className={styles.Label}>{props.label}</label>
            <input 
                type="file"
                hidden
                ref={hiddenInputRef}
                onChange={onInputChangeHandler}
                title="Click to change this resource icon"
            />
            <div 
                className={[styles.ImagePlaceholder, !imageSrc && styles.NoImage].join(' ')} 
                onClick={() => !props.readOnly && hiddenInputRef.current.click()}
            >
                {props.loading 
                    ? <Spinner size={SpinnerSize.large} /> 
                    : imageSrc 
                        ?   <img src={imageSrc} alt="" /> 
                        :   <div className={styles.ImageSelector}>
                                {!props.readOnly && 'Click to select an image'}
                            </div>
                }
            </div>
        </div>
    );
};