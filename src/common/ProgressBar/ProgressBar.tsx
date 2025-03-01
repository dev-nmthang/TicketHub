/* tslint:disable */
/* eslint-disable */
import * as React from 'react';
import styles from './ProgressBar.module.scss';

interface IProgressBarProps {
    label?: string;
    total: number;
    current: number;
    showValue?: boolean;
    showAsPercentage?: boolean;
    classNames?: {
        root?: string;
        label?: string;
        wrapper?: string;
        bar?: string;
        text?: string;
    };
}

export const ProgressBar: React.FunctionComponent<IProgressBarProps> = props => {
    const barWidth =
        props.current && props.total
            ? props.current / props.total > 1
                ? 100
                : Math.floor((props.current / props.total) * 100)
            : 0;

    return (
        <div className={`${styles.ProgressBar} ${props.classNames && props.classNames.root}`}>
            {props.label && <div className={`${styles.Label} ${props.classNames && props.classNames.label}`}>{props.label}</div>}
            <div className={`${styles.BarWrapper} ${props.classNames && props.classNames.wrapper}`}>
                <div className={`${styles.Bar} ${props.classNames && props.classNames.bar}`} style={{ width: `${barWidth}%` }}>
                    {props.showValue &&
                        <div className={`${styles.Text} ${props.classNames && props.classNames.text}`}>
                            {
                                props.showAsPercentage
                                    ? `${barWidth}%`
                                    : `${props.current}/${props.total}`
                            }
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

