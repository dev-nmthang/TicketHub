/* tslint:disable */
/* eslint-disable */
import * as React from 'react';

import styles from './StatusFlow.module.scss';

interface IStatusFlow {
    statusFlow: Array<string>;
    currentStatus: string;
    classNames: {
        root?: string;
        status: string;
    }
}

export const StatusFlow: React.FunctionComponent<IStatusFlow> = props => (
    <div className={[styles.StatusFlow, props.classNames.root].join(' ')}>
        {
            props.statusFlow.map(status => 
                <div className={[styles.Status, status === props.currentStatus ? props.classNames.status : styles.Inactive].join(' ')}>
                    {status}
                </div>
            )
        }
    </div>
);