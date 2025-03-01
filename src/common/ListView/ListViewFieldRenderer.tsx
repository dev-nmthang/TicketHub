/* tslint:disable */
/* eslint-disable */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Persona, PersonaSize } from "office-ui-fabric-react";
import { DefaultRuntime } from "@pnp/common";
import * as React from "react";
import { renderImage } from "../ImagePicker";
import { IFieldInfo } from "@pnp/sp/fields";

//render different type of columns
export default class ListViewFieldRenderer {

    public static getRenderFunction(fieldInfo: IFieldInfo): (item: any) => JSX.Element {
        const renderer: (item: any) => JSX.Element = {
            'User': (listitem: any) => ListViewFieldRenderer.renderUserColumn(listitem, fieldInfo),
            'UserMulti': (listitem: any) => ListViewFieldRenderer.renderUserColumn(listitem, fieldInfo),
            'Lookup': (listitem: any) => ListViewFieldRenderer.renderLookupColumn(listitem, fieldInfo),
            'LookupMulti': (listitem: any) => ListViewFieldRenderer.renderLookupColumn(listitem, fieldInfo),
            'Thumbnail': (listitem: any) => ListViewFieldRenderer.renderImageColumn(listitem, fieldInfo)
        }[fieldInfo?.TypeAsString]

        return renderer;
    }

    private static renderUserColumn(listitem: any, fieldInfo: IFieldInfo) {

        const personaPictureURL = ListViewFieldRenderer.getBaseUrl() + "/_layouts/15/userphoto.aspx?size=S&username=";

        const users = listitem[fieldInfo.InternalName];
        return <div>
            {users ? users.map((user:any) => {
                // return <div>{user.title}</div>

                return <Persona
                    size={PersonaSize.size24}
                    imageUrl={personaPictureURL + user.email}
                    text={`${user.title}`}
                />
            }) : null}
        </div>
    }

    private static renderLookupColumn = (listviewitem:any, fieldInfo:IFieldInfo) => {
        const values = listviewitem[fieldInfo.InternalName];
        return <div>
            {values ? values.map((lookupObject:any) => {
                return <div>{lookupObject.lookupValue}</div>
            }) : null}
        </div>
    }

    private static renderImageColumn = (listviewitem:any, fieldInfo:IFieldInfo) => {
        return renderImage(listviewitem[fieldInfo.InternalName], 'thumb');
    }

    //returns pnp configured base url
    private static getBaseUrl = () => {
        const ctx: WebPartContext = DefaultRuntime.get('spfxContext');

        //if context is used
        if (ctx) {
            return ctx.pageContext.web.absoluteUrl;
        }
        else { //if baseUrl is used
            const sp = DefaultRuntime.get('sp');
            return sp.baseUrl;
        }
    }
}






