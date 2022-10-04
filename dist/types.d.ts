import type { Coordinate } from 'ol/coordinate';
import type { Pixel } from 'ol/pixel';
import { Map as OlMap } from 'ol';
import BaseEvent from 'ol/events/Event';
export declare enum EventTypes {
    CONTEXTMENU = "contextmenu",
    CLICK = "click",
    DBLCLICK = "dblclick"
}
export declare enum CustomEventTypes {
    BEFOREOPEN = "beforeopen",
    OPEN = "open",
    CLOSE = "close",
    ADD_MENU_ENTRY = "add-menu-entry"
}
export declare type ContextMenuEvent = BaseEvent & {
    coordinate: Coordinate;
    pixel: Pixel;
};
export declare type CallbackObject = {
    coordinate: Coordinate;
    data: unknown;
};
export declare type ItemSeparator = '-';
export declare type SingleItem = {
    text: string;
    classname?: string;
    icon?: string;
    callback: (object: CallbackObject, map: OlMap) => void;
    data?: unknown;
};
export declare type MenuEntry = {
    id: string;
    isSubmenu: boolean;
    isSeparator: boolean;
    callback: SingleItem['callback'] | null;
    data: unknown;
};
export declare type ItemWithNested = {
    text: string;
    classname?: string;
    icon?: string;
    items: Item[];
};
export declare type Item = SingleItem | ItemSeparator | ItemWithNested;
export declare type Options = {
    width: number;
    scrollAt: number;
    eventType: `${EventTypes}`;
    defaultItems: boolean;
    beforeOpenHandler: (coordinate: Coordinate, pixel: Pixel) => void;
    closeHandler: () => void;
    items: Item[];
};
