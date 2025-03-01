/* tslint:disable */
/* eslint-disable */
import { Guid } from '@microsoft/sp-core-library';

export default class InlineItem<T = any> {

    public static CreateNewItem<T = any>(newItem?: T): InlineItem<T> {
        return new InlineItem<T>(true, newItem);
    }
    public static CreateFromExistingItem<T = any>(existingItem: T): InlineItem<T> {
        return new InlineItem<T>(false, existingItem);
    }

    private constructor(isnew: boolean, item?: T) {
        this._isnew = isnew;
        if (isnew) {
            this._originalItem = null;
            this._changes = item ? { ...item } : {};
        }
        else {
            this._originalItem = item;
            this._changes = {};
        }
        this._guid = Guid.newGuid();
    }

    private _guid: Guid;
    get guid(): Guid {
        return this._guid;
    }

    private _originalItem: T;
    get original(): T {
        return this._originalItem;
    }

    get current(): Partial<T> {
        return { ...this._originalItem, ...this._changes }
    }

    private _deleted: boolean = false;
    private _isnew: boolean;
    private _changes: Partial<T>;
    private _isdirty: boolean = false;

    public update = (propertyKey: keyof T, value: any): void => {
        this._changes[propertyKey] = value;
        this._isdirty = true;
    }

    public delete = () => {
        this._deleted = true;
    }

    get isNew(): boolean {
        return this._isnew;
    }

    get isDeleted(): boolean {
        return this._deleted;
    }

    get isDirty():boolean{
        return this._isdirty;
    }

}