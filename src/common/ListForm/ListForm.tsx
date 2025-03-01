/* tslint:disable */
/* eslint-disable */
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { IListFormContext } from './IListFormContext';
import { IListFormFieldProps, ListFormField } from './ListFormField/ListFormField';
import { ReactListFormContext } from './ReactListFormContext';



export interface IListFormProps {
  listFormContext: IListFormContext;
  className?: string;
  showLoadingWhileInitalize?: boolean
}

type ListFormFunctionComponent = React.FunctionComponent<IListFormProps> & {Field:React.FunctionComponent<IListFormFieldProps>}

export const ListForm: ListFormFunctionComponent = (props: React.PropsWithChildren<IListFormProps>) => {

  const {showLoadingWhileInitalize=true} = props;

  return (
    <div className={props.className || ''}>
      {
        props.listFormContext.initialized ?
          <ReactListFormContext.Provider value={props.listFormContext}>
            {props.children}
          </ReactListFormContext.Provider>
          :
          (showLoadingWhileInitalize && <Spinner label='Please wait...' size={SpinnerSize.large} />)
      }
    </div>
  );
};

ListForm.Field = ListFormField;

