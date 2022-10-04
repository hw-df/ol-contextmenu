import { Map as OlMap, View, Feature } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj';
import { Style, Icon, Text } from 'ol/style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Coordinate, format } from 'ol/coordinate';
import Point from 'ol/geom/Point';

import ContextMenu from 'ol-contextmenu';
import { Item, ItemWithNested, SingleItem, ContextMenuEvent } from 'ol-contextmenu/dist/types';

import './style.css';
import { Pixel } from 'ol/pixel';

const view = new View({ center: [0, 0], zoom: 4 });
const vectorLayer = new VectorLayer({ source: new VectorSource() });
const baseLayer = new TileLayer({ source: new OSM() });

const map = new OlMap({
    target: 'map',
    view,
    layers: [baseLayer, vectorLayer],
});

const pinIcon =
    'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/pin_drop.png';
const centerIcon =
    'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/center.png';
const listIcon =
    'https://cdn.jsdelivr.net/gh/jonataswalker/ol-contextmenu@604befc46d737d814505b5d90fc171932f747043/examples/img/view_list.png';

const actionsSubmenuItems: SingleItem[] = [
    {
        text: 'Add a Marker',
        icon: pinIcon,
        callback: marker,
    },
];

const actionsSubmenu: ItemWithNested = {
    text: 'Some more Actions',
    icon: listIcon,
    items: actionsSubmenuItems,
};

const actionsItems: SingleItem[] = [
    {
        text: 'Add a Marker',
        icon: pinIcon,
        callback: marker,
    },
    {
        text: 'Center map here',
        icon: centerIcon,
        callback: center,
    },
];

const firstLevelSubmenu: ItemWithNested = {
    text: 'Some Actions',
    icon: listIcon,
    items: [actionsSubmenu, ...actionsItems],
};

const items: Item[] = [
    {
        text: 'Center map here',
        classname: 'bold',
        icon: centerIcon,
        callback: center,
    },
    {
        text: 'Add a Marker',
        icon: pinIcon,
        callback: marker,
    },
    '-', // this is a separator
    {
        text: 'Some more Actions, loooong',
        items: [
            {
                text: 'Add a Marker',
                icon: pinIcon,
                callback: marker,
            },
        ],
    },
    '-', // this is a separator
];

items.push(firstLevelSubmenu);

const contextmenu = new ContextMenu({
    width: 200,
    defaultItems: true,
    items,
    beforeOpenHandler: myBeforeOpenHandler
});

map.addControl(contextmenu);

console.log({ contextmenu });

contextmenu.on('beforeopen', (evt:ContextMenuEvent) => {
    console.log('beforeopen!!!', { evt });
    console.log({ evt });
});

contextmenu.on('close', (evt:ContextMenuEvent) => {
    console.log('close!!!', { evt });
});

map.on('moveend', () => {
    console.log('moveend', contextmenu.isOpen());
});

function myBeforeOpenHandler(coordinate: Coordinate, pixel: Pixel) {
    console.log('MyBeforeOpen!!', coordinate, pixel);
    console.log('this???', this);
}

function elastic(t: number) {
    return 2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
}

function center(obj: any) {
    view.animate({
        duration: 700,
        easing: elastic,
        center: obj.coordinate,
    });
}

function marker(obj: any) {
    const coord4326 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326');
    const template = 'Coordinate is ({x} | {y})';
    const iconStyle = new Style({
        image: new Icon({ scale: 0.6, src: pinIcon }),
        text: new Text({
            offsetY: 25,
            text: format(coord4326, template, 2),
            font: '15px Open Sans,sans-serif',
            fill: new Fill({ color: '#111' }),
            stroke: new Stroke({ color: '#eee', width: 2 }),
        }),
    });
    const feature = new Feature({
        type: 'removable',
        geometry: new Point(obj.coordinate),
    });

    feature.setStyle(iconStyle);
    vectorLayer.getSource()?.addFeature(feature);
}
