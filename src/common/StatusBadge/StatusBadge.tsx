/* tslint:disable */
/* eslint-disable */
import styles from './StatusBadge.module.scss';
import * as React from 'react';
import { getStatusBadgeColor, IBadgeColor } from './StatusBadgeColorPresets';

export interface IStatusBadgeProps {
    status: string;
    className?: string;
    colors?: { [key: string]: IBadgeColor };
    bordered?: boolean;
}

export const StatusBadge: React.FunctionComponent<IStatusBadgeProps> = (props: React.PropsWithChildren<IStatusBadgeProps>) => {

    const statusStyle = `Status--${props.status?.replace(/[^a-z0-9+]+/gi, '')}`;


    let badgeColor: IBadgeColor = props.colors?.[props.status];

    if (!badgeColor) {
        badgeColor = getStatusBadgeColor(props.status)
    }

    return props.status ? (
        <div
            className={`${styles.StatusBadge} ${statusStyle} ${props.className ?? ''} ${props.bordered ? styles.Bordered : ''}`}
            style={{
                backgroundColor: badgeColor.bgcolor,
                color: badgeColor.color
            }}
        >
            {props.status}
        </div>
    )
        :
        null;
};
