import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPUser } from "@microsoft/sp-page-context";

export interface IAppContext {
    webPartContext: WebPartContext;
    currentUser: SPUser;
  }