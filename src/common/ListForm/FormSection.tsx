import * as React from 'react';
import styles from './FormSection.module.scss';

export interface IFormSectionProps {
    /**
     * Form section heading
     */
    title: string;
}

export const FormSection: React.FunctionComponent<IFormSectionProps> = (props: React.PropsWithChildren<IFormSectionProps>) => {
    return (
        <div className={styles.formsection}>
            <div className={styles.title}>{props.title}</div>
            <div className={styles.content}>
                {props.children}
            </div>
        </div>
    );
};