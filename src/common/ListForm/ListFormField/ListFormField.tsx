/* tslint:disable */
/* eslint-disable */
/* eslint-disable dot-notation */
import { FieldTypes, IFieldInfo } from '@pnp/sp/fields';
import * as React from 'react';
import { FieldValidationError } from './FieldValidationError';
import { useListFormContext } from '../hooks/useListFormContext';
import { useRegisterField } from '../hooks/useRegisterField';
import { IListFormContext } from '../IListFormContext';
import { ListFormField_Boolean } from './ListFormField_Boolean';
import { ListFormField_Choice } from './ListFormField_Choice';
import { ListFormField_DateTime } from './ListFormField_DateTime';
import { ListFormField_Lookup } from './ListFormField_Lookup';
import { ListFormField_MultiChoice } from './ListFormField_MultiChoice';
import { ListFormField_MultiLookup } from './ListFormField_MultiLookup';
import { ListFormField_Note } from './ListFormField_Note';
import { ListFormField_Number } from './ListFormField_Number';
import { ListFormField_Text } from './ListFormField_Text';
import { ListFormField_User } from './ListFormField_User';
import { ListFormLabel } from './ListFormLabel';

interface ICommonProps {
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  onChange?: (value: any) => void;
  controlProps?: any;
}

export interface IListFormFieldProps extends ICommonProps {
  fieldInternalName: string;
  className?: string;
  label?: string;
  labelStyle?: 'normal' | 'none' | 'invisible';
  onRenderControl?: (props: IListFormFieldRendererProps) => React.ReactElement;
  onRenderTooltipContent?: ()=> React.ReactElement;
  dependencies?: any[];
}

export interface IListFormFieldRendererProps extends ICommonProps {
  field: IFieldInfo;
  formStateKey: string;
  listFormContext: IListFormContext;
}


export const ListFormField: React.FunctionComponent<IListFormFieldProps> = (props: React.PropsWithChildren<IListFormFieldProps>) => {

  //default
  props.labelStyle = props.labelStyle || 'normal';

  const listFormContext = useListFormContext();
  const formStateKey = props.fieldInternalName;

  if (!listFormContext.initialized) {
    return null;
  }

  useRegisterField(listFormContext, formStateKey);

  const field = listFormContext.getField(formStateKey);

  const errorMessage = listFormContext.validation.getErrorMessage(formStateKey);

  return React.useMemo((): React.ReactElement<IListFormFieldRendererProps> => {

    let reactNode: React.ReactNode;

    const disabled:boolean = props.disabled || listFormContext.disabled;

    const listFormFieldRendererProps: IListFormFieldRendererProps = {
      field: field,
      formStateKey: formStateKey,
      listFormContext: listFormContext,
      onChange: props.onChange,
      disabled: disabled,
      controlProps: props.controlProps,
      required: props.required,
      readonly: !disabled && (props.readonly || listFormContext.readonly)
    };

    //if custom onrender was specified
    if (typeof props.onRenderControl === 'function') {
      reactNode = props.onRenderControl(listFormFieldRendererProps);
    }
    //else use the default field renderer
    else {
      const FieldRenderer = getDefaultFieldRenderer(field);
      reactNode = (FieldRenderer) ? React.createElement<IListFormFieldRendererProps>(FieldRenderer, listFormFieldRendererProps) : null;
    }


    const labelProps = {
      fieldInternalName: props.fieldInternalName,
      label: props.label,
      required: props.required || field && field.Required,
      onRenderTooltipContent: props.onRenderTooltipContent
    };

    return <div className={props.className || null}>
      {listFormContext.initialized ?
        <>
          {
            {
              ['normal']: <ListFormLabel {...labelProps} />,
              ['none']: null,
              ['invisible']: <ListFormLabel {...labelProps} invisible />
            }[props.labelStyle]
          }
          {reactNode}
          <FieldValidationError errorMessage={errorMessage} />
        </>
        :
        null
      }
    </div>
  },
    [
      // props.onRenderComponent,      in case of changing dynamicaly, the field wont be rerendered, but the memoized version will be used. 
      props.fieldInternalName,
      props.label,
      props.disabled,
      props.readonly,
      props.required,
      props.labelStyle,
      field,
      formStateKey,
      listFormContext.initialized,
      listFormContext.listItem,
      listFormContext.formState.get(formStateKey),
      listFormContext.readonly,
      listFormContext.disabled,
      errorMessage,
      // props.controlProps       in case of changing dynamicaly, the field wont be rerendered, but the memoized version will be used. 
      ...(props.dependencies || [])
    ]
  );


}



function getDefaultFieldRenderer(field: IFieldInfo): React.FunctionComponent<IListFormFieldRendererProps> {
  if (field) {
    const renderer = ({
      [FieldTypes.Text]: ListFormField_Text,
      [FieldTypes.Boolean]: ListFormField_Boolean,
      [FieldTypes.Number]: ListFormField_Number,
      [FieldTypes.Note]: ListFormField_Note,
      [FieldTypes.Choice]: ListFormField_Choice,
      [FieldTypes.DateTime]: ListFormField_DateTime,
      [FieldTypes.User]: ListFormField_User,
      [FieldTypes.MultiChoice]: ListFormField_MultiChoice,
      [FieldTypes.Lookup]: (field as any)['AllowMultipleValues'] ? ListFormField_MultiLookup : ListFormField_Lookup,
    } as any)[field.FieldTypeKind];

    !renderer && console.error(`Field renderer is not implemented for field: ${field.InternalName}, Type: ${FieldTypes[field.FieldTypeKind]}`);
    return renderer;
  }
  else {
    return null
  }
}