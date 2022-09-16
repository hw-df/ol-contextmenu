
  /*!
  * ol-contextmenu - v4.1.2
  * https://github.com/jonataswalker/ol-contextmenu
  * Built: Fri Sep 16 2022 16:13:01 GMT+0200 (Central European Summer Time)
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/control/Control')) :
  typeof define === 'function' && define.amd ? define(['ol/control/Control'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ContextMenu = factory(global.ol.control.Control));
}(this, (function (Control) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var Control__default = /*#__PURE__*/_interopDefaultLegacy(Control);

  const namespace = 'ol-ctx-menu';

  var cssVars = {
    namespace,
    container: `${namespace}-container`,
    separator: `${namespace}-separator`,
    submenu: `${namespace}-submenu`,
    hidden: `${namespace}-hidden`,
    icon: `${namespace}-icon`,
    zoomIn: `${namespace}-zoom-in`,
    zoomOut: `${namespace}-zoom-out`,
    unselectable: 'ol-unselectable',
  };

  const CSS_VARS = cssVars;

  const EVENT_TYPE = {
    /**
     * Triggered before context menu is open.
     */
    BEFOREOPEN: 'beforeopen',
    /**
     * Triggered when context menu is open.
     */
    OPEN: 'open',
    /**
     * Triggered when context menu is closed.
     */
    CLOSE: 'close',
    /**
     * Internal. Triggered when a menu entry is added.
     */
    ADD_MENU_ENTRY: 'add-menu-entry',
    /**
     * Internal.
     */
    CONTEXTMENU: 'contextmenu',
    /**
     * Internal.
     */
    HOVER: 'mouseover',
  };

  const DEFAULT_OPTIONS = {
    width: 150,
    scrollAt: 4,
    eventType: EVENT_TYPE.CONTEXTMENU,
    defaultItems: true,
  };

  const DEFAULT_ITEMS = [
    {
      text: 'Zoom In',
      classname: `${cssVars.zoomIn} ${cssVars.icon}`,
      callback: (obj, map) => {
        const view = map.getView();
        view.animate({
          zoom: +view.getZoom() + 1,
          duration: 700,
          center: obj.coordinate,
        });
      },
    },
    {
      text: 'Zoom Out',
      classname: `${cssVars.zoomOut} ${cssVars.icon}`,
      callback: (obj, map) => {
        const view = map.getView();
        view.animate({
          zoom: +view.getZoom() - 1,
          duration: 700,
          center: obj.coordinate,
        });
      },
    },
  ];

  /**
   * Overwrites obj1's values with obj2's and adds
   * obj2's if non existent in obj1
   * @returns obj3 a new object based on obj1 and obj2
   */
  function mergeOptions(obj1, obj2) {
    let obj3 = {};
    for (let attr1 in obj1) obj3[attr1] = obj1[attr1];
    for (let attr2 in obj2) obj3[attr2] = obj2[attr2];
    return obj3;
  }

  function assert(condition, message = 'Assertion failed') {
    if (!condition) {
      if (typeof Error !== 'undefined') throw new Error(message);
      throw message; // Fallback
    }
  }

  /**
   * Does str contain test?
   * @param {String} str_test
   * @param {String} str
   * @returns Boolean
   */
  function contains(str_test, str) {
    return !!~str.indexOf(str_test);
  }

  function getUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  function isDefAndNotNull(val) {
    // Note that undefined == null.
    return val != null; // eslint-disable-line no-eq-null
  }

  function isNumeric(str) {
    return /^\d+$/.test(str);
  }

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to remove a class.
   */
  function addClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach((each) => addClass(each, classname));
      return;
    }

    const array = Array.isArray(classname) ? classname : classname.split(/\s+/);
    let i = array.length;

    while (i--) {
      if (!hasClass(element, array[i])) {
        _addClass(element, array[i], timeout);
      }
    }
  }

  /**
   * @param {Element|Array<Element>} element DOM node or array of nodes.
   * @param {String|Array<String>} classname Class or array of classes.
   * For example: 'class1 class2' or ['class1', 'class2']
   * @param {Number|undefined} timeout Timeout to add a class.
   */
  function removeClass(element, classname, timeout) {
    if (Array.isArray(element)) {
      element.forEach((each) => removeClass(each, classname, timeout));
      return;
    }

    const array = Array.isArray(classname) ? classname : classname.split(/\s+/);
    let i = array.length;

    while (i--) {
      if (hasClass(element, array[i])) {
        _removeClass(element, array[i], timeout);
      }
    }
  }

  /**
   * @param {Element} element DOM node.
   * @param {String} classname Classname.
   * @return {Boolean}
   */
  function hasClass(element, c) {
    // use native if available
    return element.classList
      ? element.classList.contains(c)
      : classRegex(c).test(element.className);
  }

  /**
   * Abstraction to querySelectorAll for increased
   * performance and greater usability
   * @param {String} selector
   * @param {Element} context (optional)
   * @param {Boolean} find_all (optional)
   * @return (find_all) {Element} : {Array}
   */
  function find(selector, context = window.document, find_all) {
    let simpleRe = /^(#?[\w-]+|\.[\w-.]+)$/,
      periodRe = /\./g,
      slice = Array.prototype.slice,
      matches = [];

    // Redirect call to the more performant function
    // if it's a simple selector and return an array
    // for easier usage
    if (simpleRe.test(selector)) {
      switch (selector[0]) {
        case '#':
          matches = [$(selector.substr(1))];
          break;
        case '.':
          matches = slice.call(
            context.getElementsByClassName(
              selector.substr(1).replace(periodRe, ' ')
            )
          );
          break;
        default:
          matches = slice.call(context.getElementsByTagName(selector));
      }
    } else {
      // If not a simple selector, query the DOM as usual
      // and return an array for easier usage
      matches = slice.call(context.querySelectorAll(selector));
    }

    return find_all ? matches : matches[0];
  }

  function $(id) {
    id = id[0] === '#' ? id.substr(1, id.length) : id;
    return document.getElementById(id);
  }

  function offset(element) {
    const rect = element.getBoundingClientRect();
    const docEl = document.documentElement;
    return {
      left: rect.left + window.pageXOffset - docEl.clientLeft,
      top: rect.top + window.pageYOffset - docEl.clientTop,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  function getViewportSize() {
    return {
      w: window.innerWidth || document.documentElement.clientWidth,
      h: window.innerHeight || document.documentElement.clientHeight,
    };
  }

  function createFragment(html) {
    let frag = document.createDocumentFragment(),
      temp = document.createElement('div');
    temp.innerHTML = html;
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    return frag;
  }

  function classRegex(classname) {
    return new RegExp(`(^|\\s+) ${classname} (\\s+|$)`);
  }

  function _addClass(el, klass, timeout) {
    // use native if available
    if (el.classList) {
      el.classList.add(klass);
    } else {
      el.className = (el.className + ' ' + klass).trim();
    }

    if (timeout && isNumeric(timeout)) {
      window.setTimeout(() => _removeClass(el, klass), timeout);
    }
  }

  function _removeClass(el, klass, timeout) {
    if (el.classList) {
      el.classList.remove(klass);
    } else {
      el.className = el.className.replace(classRegex(klass), ' ').trim();
    }
    if (timeout && isNumeric(timeout)) {
      window.setTimeout(() => _addClass(el, klass), timeout);
    }
  }

  /**
   * @class Internal
   */
  class Internal {
    /**
     * @constructor
     * @param {Function} base Base class.
     */
    constructor(base) {
      /**
       * @type {ol.control.Control}
       */
      this.Base = base;
      /**
       * @type {ol.Map}
       */
      this.map = undefined;
      /**
       * @type {Element}
       */
      this.viewport = undefined;
      /**
       * @type {ol.Coordinate}
       */
      this.coordinateClicked = undefined;
      /**
       * @type {ol.Pixel}
       */
      this.pixelClicked = undefined;
      /**
       * @type {Number}
       */
      this.lineHeight = 0;
      /**
       * @type {Object}
       */
      this.items = {};
      /**
       * @type {Boolean}
       */
      this.opened = false;
      /**
       * @type {Object}
       */
      this.submenu = {
        left: base.options.width - 15 + 'px',
        lastLeft: '', // string + px
      };
      /**
       * @type {Function}
       */
      this.eventHandler = this.handleEvent.bind(this);
      /**
       * @type {Function}
       */
      this.eventMapMoveHandler = this.handleMapMoveEvent.bind(this);
      return this;
    }

    init(map) {
      this.map = map;
      this.viewport = map.getViewport();
      this.setListeners();
      this.Base.Html.createMenu();

      this.lineHeight =
        this.getItemsLength() > 0
          ? this.Base.container.offsetHeight / this.getItemsLength()
          : this.Base.Html.cloneAndGetLineHeight();
    }

    getItemsLength() {
      let count = 0;
      Object.keys(this.items).forEach((k) => {
        if (this.items[k].submenu || this.items[k].separator) return;
        count++;
      });
      return count;
    }

    getPixelClicked() {
      return this.pixelClicked;
    }

    getCoordinateClicked() {
      return this.coordinateClicked;
    }

    positionContainer(pixel) {
      const container = this.Base.container;
      const mapSize = this.map.getSize();
      // how much (width) space left over
      const space_left_h = mapSize[1] - pixel[1];
      // how much (height) space left over
      const space_left_w = mapSize[0] - pixel[0];

      const menuSize = {
        w: container.offsetWidth,
        // a cheap way to recalculate container height
        // since offsetHeight is like cached
        h: Math.round(this.lineHeight * this.getItemsLength()),
      };
      // submenus
      const subs = find(`li.${CSS_VARS.submenu}>div`, container, true);

      if (space_left_w >= menuSize.w) {
        container.style.right = 'auto';
        container.style.left = `${pixel[0] + 5}px`;
      } else {
        container.style.left = 'auto';
        container.style.right = '15px';
      }
      // set top or bottom
      if (space_left_h >= menuSize.h) {
        container.style.bottom = 'auto';
        container.style.top = `${pixel[1] - 10}px`;
      } else {
        container.style.top = 'auto';
        container.style.bottom = 0;
      }

      removeClass(container, CSS_VARS.hidden);

      if (subs.length) {
        if (space_left_w < menuSize.w * 2) {
          // no space (at right) for submenu
          // position them at left
          this.submenu.lastLeft = `-${menuSize.w}px`;
        } else {
          this.submenu.lastLeft = this.submenu.left;
        }
        subs.forEach((sub) => {
          // is there enough space for submenu height?
          const viewport = getViewportSize();
          const sub_offset = offset(sub);
          const sub_height = sub_offset.height;
          let sub_top = space_left_h - sub_height;

          if (sub_top < 0) {
            sub_top = sub_height - (viewport.h - sub_offset.top);
            sub.style.top = `-${sub_top}px`;
          }
          sub.style.left = this.submenu.lastLeft;
        });
      }
    }

    openMenu(pixel, coordinate) {
      this.Base.dispatchEvent({
        type: EVENT_TYPE.OPEN,
        pixel: pixel,
        coordinate: coordinate,
      });
      this.opened = true;
      this.positionContainer(pixel);
    }

    closeMenu() {
      this.opened = false;
      addClass(this.Base.container, CSS_VARS.hidden);
      this.Base.dispatchEvent({
        type: EVENT_TYPE.CLOSE,
      });
    }

    setListeners() {
      this.viewport.addEventListener(
        this.Base.options.eventType,
        this.eventHandler,
        false
      );

      this.map.on('movestart', this.eventMapMoveHandler);
    }

    removeListeners() {
      this.viewport.removeEventListener(
        this.Base.options.eventType,
        this.eventHandler,
        false
      );

      this.map.un('movestart', this.eventMapMoveHandler);
    }

    handleEvent(evt) {
      const this_ = this;

      this.coordinateClicked = this.map.getEventCoordinate(evt);
      this.pixelClicked = this.map.getEventPixel(evt);

      this.Base.dispatchEvent({
        type: EVENT_TYPE.BEFOREOPEN,
        pixel: this.pixelClicked,
        coordinate: this.coordinateClicked,
      });

      if (this.Base.disabled) return;

      if (this.Base.options.eventType === EVENT_TYPE.CONTEXTMENU) {
        // don't be intrusive with other event types
        evt.stopPropagation();
        evt.preventDefault();
      }

      this.openMenu(this.pixelClicked, this.coordinateClicked);

      //one-time fire
      evt.target.addEventListener(
        'pointerdown',
        {
          handleEvent: function (e) {
            const isSubmenuItem = e.target.parentNode.classList.contains(
              'ol-ctx-menu-submenu'
            );
            if (this_.opened && !isSubmenuItem) {
              this_.closeMenu();
              e.stopPropagation();
              evt.target.removeEventListener(e.type, this, false);
            }
          },
        },
        false
      );
    }

    handleMapMoveEvent(evt) {
      this.closeMenu();
    }

    setItemListener(li, index) {
      const this_ = this;
      if (li && typeof this.items[index].callback === 'function') {
        (function (callback) {
          li.addEventListener(
            'click',
            function (evt) {
              evt.preventDefault();
              const obj = {
                coordinate: this_.getCoordinateClicked(),
                data: this_.items[index].data || null,
              };
              this_.closeMenu();
              callback(obj, this_.map);
            },
            false
          );
        })(this.items[index].callback);
      }
    }
  }

  /**
   * @class Html
   */
  class Html {
    /**
     * @constructor
     * @param {Function} base Base class.
     */
    constructor(base) {
      this.Base = base;
      this.container = this.Base.container;
      return this;
    }

    static createContainer(hidden, width) {
      const container = document.createElement('div');
      const ul = document.createElement('ul');
      const klasses = [CSS_VARS.container, CSS_VARS.unselectable];

      hidden && klasses.push(CSS_VARS.hidden);
      container.className = klasses.join(' ');
      container.style.width = parseInt(width, 10) + 'px';
      container.appendChild(ul);
      return container;
    }

    createMenu() {
      let items = [];

      if ('items' in this.Base.options) {
        items = this.Base.options.defaultItems
          ? this.Base.options.items.concat(DEFAULT_ITEMS)
          : this.Base.options.items;
      } else if (this.Base.options.defaultItems) {
        items = DEFAULT_ITEMS;
      }
      // no item
      if (items.length === 0) return false;
      // create entries
      items.forEach(this.addMenuEntry, this);
    }

    addMenuEntry(item) {
      if (item.items && Array.isArray(item.items)) {
        // submenu - only a second level
        item.classname = item.classname || '';
        if (!contains(CSS_VARS.submenu, item.classname)) {
          item.classname = item.classname.length
            ? ' ' + CSS_VARS.submenu
            : CSS_VARS.submenu;
        }

        let li = this.generateHtmlAndPublish(this.container, item);
        let sub = this.constructor.createContainer(
          false,
          this.Base.options.width
        );
        sub.style.left =
          this.Base.Internal.submenu.lastLeft || this.Base.Internal.submenu.left;
        li.appendChild(sub);

        item.items.forEach((each) => {
          this.generateHtmlAndPublish(sub, each, true);
        });
      } else {
        this.generateHtmlAndPublish(this.container, item);
      }
    }

    generateHtmlAndPublish(parent, item, submenu) {
      const index = getUniqueId();
      let html,
        frag,
        element,
        separator = false;

      // separator
      if (typeof item === 'string' && item.trim() === '-') {
        html = `<li id="${index}" class="${CSS_VARS.separator}"><hr></li>`;
        frag = createFragment(html);
        // http://stackoverflow.com/a/13347298/4640499
        element = [].slice.call(frag.childNodes, 0)[0];
        parent.firstChild.appendChild(frag);
        // to exclude from lineHeight calculation
        separator = true;
      } else {
        item.classname = item.classname || '';
        html = `<span>${item.text}</span>`;
        frag = createFragment(html);
        element = document.createElement('li');

        if (item.icon) {
          if (item.classname === '') {
            item.classname = CSS_VARS.icon;
          } else if (item.classname.indexOf(CSS_VARS.icon) === -1) {
            item.classname += ` ${CSS_VARS.icon}`;
          }
          element.setAttribute('style', `background-image:url(${item.icon})`);
        }

        element.id = index;
        element.className = item.classname;
        element.appendChild(frag);
        parent.firstChild.appendChild(element);
      }

      this.Base.Internal.items[index] = {
        id: index,
        submenu: submenu || 0,
        separator: separator,
        callback: item.callback,
        data: item.data || null,
      };
      this.Base.Internal.setItemListener(element, index);
      return element;
    }

    removeMenuEntry(index) {
      const element = find('#' + index, this.container.firstChild);
      element && this.container.firstChild.removeChild(element);
      delete this.Base.Internal.items[index];
    }

    cloneAndGetLineHeight() {
      // for some reason I have to calculate with 2 items
      const cloned = this.container.cloneNode();
      const frag = createFragment('<span>Foo</span>');
      const frag2 = createFragment('<span>Foo</span>');
      const element = document.createElement('li');
      const element2 = document.createElement('li');

      element.appendChild(frag);
      element2.appendChild(frag2);
      cloned.appendChild(element);
      cloned.appendChild(element2);

      this.container.parentNode.appendChild(cloned);
      const height = cloned.offsetHeight / 2;
      this.container.parentNode.removeChild(cloned);
      return height;
    }
  }

  /**
   * @class Base
   * @extends {ol.control.Control}
   */
  class Base extends Control__default['default'] {
    /**
     * @constructor
     * @param {object|undefined} opt_options Options.
     */
    constructor(opt_options = {}) {
      assert(
        typeof opt_options == 'object',
        '@param `opt_options` should be object type!'
      );

      let options = mergeOptions(DEFAULT_OPTIONS, opt_options);

      const element = Html.createContainer(true, options.width);

      super({
        element: element,
      });

      this.container = this.element = element;
      this.options = options;
      this.disabled = false;

      this.Internal = new Internal(this);
      this.Html = new Html(this);
    }

    /**
     * Remove all elements from the menu.
     */
    clear() {
      Object.keys(this.Internal.items).forEach(
        this.Html.removeMenuEntry,
        this.Html
      );
    }

    /**
     * Close the menu programmatically.
     */
    close() {
      this.Internal.closeMenu();
    }

    /**
     * Enable menu
     */
    enable() {
      this.disabled = false;
    }

    /**
     * Disable menu
     */
    disable() {
      this.disabled = true;
    }

    /**
     * @return {Array} Returns default items
     */
    getDefaultItems() {
      return DEFAULT_ITEMS;
    }

    /**
     * @return {Number} Returns how many items
     */
    countItems() {
      return Object.keys(this.Internal.items).length;
    }

    /**
     * Add items to the menu. This pushes each item in the provided array
     * to the end of the menu.
     * @param {Array} arr Array.
     */
    extend(arr) {
      assert(Array.isArray(arr), '@param `arr` should be an Array.');
      arr.forEach(this.push, this);
    }

    isOpen() {
      return this.Internal.opened;
    }

    /**
     * Update the menu's position.
     */
    updatePosition(pixel) {
      assert(Array.isArray(pixel), '@param `pixel` should be an Array.');

      if (this.isOpen()) {
        this.Internal.positionContainer(pixel);
      }
    }

    /**
     * Remove the last item of the menu.
     */
    pop() {
      const keys = Object.keys(this.Internal.items);
      this.Html.removeMenuEntry(keys[keys.length - 1]);
    }

    /**
     * Insert the provided item at the end of the menu.
     * @param {Object|String} item Item.
     */
    push(item) {
      assert(isDefAndNotNull(item), '@param `item` must be informed.');
      this.Html.addMenuEntry(item);
    }

    /**
     * Remove the first item of the menu.
     */
    shift() {
      this.Html.removeMenuEntry(Object.keys(this.Internal.items)[0]);
    }

    /**
     * Not supposed to be used on app.
     */
    setMap(map) {
      Control__default['default'].prototype.setMap.call(this, map);

      if (map) {
        // let's start since now we have the map
        this.Internal.init(map, this);
      } else {
        // I'm removed from the map - remove listeners
        this.Internal.removeListeners();
      }
    }
  }

  return Base;

})));
