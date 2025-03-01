/* tslint:disable */
/* eslint-disable */
import { FontIcon, ILabelProps, Label, Toggle, TooltipHost } from 'office-ui-fabric-react';
import * as React from 'react';
import { useListFormContext } from '../hooks/useListFormContext';

export interface IListFormLabelProps {
  fieldInternalName?: string;
  label?: string;
  required?: boolean;
  invisible?: boolean
  onRenderTooltipContent?: ()=> React.ReactElement;
}

export const ListFormLabel: React.FunctionComponent<IListFormLabelProps> = (props: React.PropsWithChildren<IListFormLabelProps>) => {

  let fieldInfo;

  if (props.fieldInternalName) {
    const listFormContext = useListFormContext();
    fieldInfo = listFormContext.getField(props.fieldInternalName);
  }

  const invisibleProps: ILabelProps = {};
  if (props.invisible) {
    invisibleProps.style = { visibility: 'hidden' };
  }

  const tooltipContent = props.onRenderTooltipContent?.() || fieldInfo?.Description;

  return <Label
    required={props.required}
    {...invisibleProps}
  >
    {props.label || (fieldInfo ? fieldInfo.Title : '')}
    {tooltipContent &&
      <TooltipHost style={{paddingRight: '30px'}} content={tooltipContent}>
        <FontIcon style={{ padding: '0 0 1px 5px', verticalAlign: 'middle' }} iconName="Info" />
      </TooltipHost>
    }
  </Label>
};