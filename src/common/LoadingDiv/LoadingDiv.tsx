/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import styles from './LoadingDiv.module.scss';
import * as defaultImage from './loading.png';

export type LoadingDivStyles = 'root' | 'spinnerOverlay' | 'spinner' | 'content' | 'message';
export type LoadingDivMessagePosition = 'top' | 'bottom' | 'left' | 'right';
export type LoadingDivImageType = 'square' | 'circle';

export interface ILoadingDivStyles {
    root?: any; 
    spinnerOverlay?: any,
    spinner?: any; 
    content?: any;
    message?: any;
}

export interface ILoadingDivProps {
    loading: boolean;
    imageUrl?: string;
    imageSize?: string;
    imageType?: LoadingDivImageType;
    message?: string;
    messageFontSize?: string;
    messagePosition?: LoadingDivMessagePosition;
    disableAnimation?: boolean;
    styles?: ILoadingDivStyles;
}

const defaultProps: Partial<ILoadingDivProps> = {
    imageSize: '64px',
    messageFontSize: '14px',
    imageType: 'circle'
};

export const LoadingDiv: React.FunctionComponent<ILoadingDivProps> = (props: React.PropsWithChildren<ILoadingDivProps>) => {

    const getElementStyle = (styleKey: LoadingDivStyles) => {
        return props.styles && props.styles[styleKey] 
            ? props.styles[styleKey]
            : {};
    };

    const getMessagePositionClassName = () => {
        return {
            top: styles.MessageTop,
            bottom: styles.MessageBottom,
            left: styles.MessageLeft,
            right: styles.MessageRight
        }[props.messagePosition] || styles.MessageBottom;
    };

    return (
        <div 
            className={`${styles.LoadingDivWrapper} ${props.loading && styles.Loading}`}
            style={getElementStyle('root')}
        >
            <div 
                className={`${styles.SpinnerOverlay} ${getMessagePositionClassName()}`}
                style={getElementStyle('spinnerOverlay')}
            >
                <div 
                    className={[
                        styles.SpinnerImageWrapper,
                        !props.disableAnimation && styles.Animated,
                        props.imageType == 'circle' && styles.Circle
                    ].filter(Boolean).join(' ')} 
                    style={{
                        height: props.imageSize,
                        width: props.imageSize, 
                        ...getElementStyle('spinner')
                    }}
                >
                    <img src={props.imageUrl || defaultImage} alt="" />
                </div>
                {props.message && 
                    <div 
                        className={styles.SpinnerMessage}
                        style={{
                            fontSize: props.messageFontSize,
                            ...getElementStyle('message')
                        }}
                    >
                        {props.message}
                    </div>
                }
            </div>
            <div 
                className={styles.Content}
                style={getElementStyle('content')}
            >
                {props.children}
            </div>
            
        </div>
    );
};

LoadingDiv.defaultProps = defaultProps;