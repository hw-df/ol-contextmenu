import { Item } from '../types';
export declare function createFragment(html: string): DocumentFragment;
export declare function getLineHeight(container: HTMLDivElement): number;
export declare function addMenuEntry(parentNode: HTMLUListElement, item: Item, isSubmenu?: boolean): HTMLLIElement;
export declare function addMenuEntries(container: HTMLUListElement, items: Item[], menuWidth: number): void;
