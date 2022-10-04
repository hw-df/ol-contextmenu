
  /*!
  * ol-contextmenu - v5.1.0
  * https://github.com/jonataswalker/ol-contextmenu
  * Built: Tue Oct 04 2022 16:20:59 GMT+0200 (Central European Summer Time)
  */

var S = Object.defineProperty;
var k = (s, t, e) => t in s ? S(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var a = (s, t, e) => (k(s, typeof t != "symbol" ? t + "" : t, e), e);
import H from "ol/control/Control";
var b = /* @__PURE__ */ ((s) => (s.CONTEXTMENU = "contextmenu", s.CLICK = "click", s.DBLCLICK = "dblclick", s))(b || {}), f = /* @__PURE__ */ ((s) => (s.BEFOREOPEN = "beforeopen", s.OPEN = "open", s.CLOSE = "close", s.ADD_MENU_ENTRY = "add-menu-entry", s))(f || {});
const O = {
  width: 150,
  scrollAt: 4,
  eventType: b.CONTEXTMENU,
  defaultItems: !0,
  items: [],
  beforeOpenHandler: () => {
  },
  closeHandler: () => {
  }
}, d = "ol-ctx-menu", r = {
  namespace: d,
  container: `${d}-container`,
  separator: `${d}-separator`,
  submenu: `${d}-submenu`,
  hidden: `${d}-hidden`,
  icon: `${d}-icon`,
  zoomIn: `${d}-zoom-in`,
  zoomOut: `${d}-zoom-out`,
  unselectable: "ol-unselectable"
}, x = [
  {
    text: "Zoom In",
    classname: `${r.zoomIn} ${r.icon}`,
    callback: (s, t) => {
      const e = t.getView();
      e.animate({
        zoom: Number(e.getZoom()) + 1,
        duration: 700,
        center: s.coordinate
      });
    }
  },
  {
    text: "Zoom Out",
    classname: `${r.zoomOut} ${r.icon}`,
    callback: (s, t) => {
      const e = t.getView();
      e.animate({
        zoom: Number(e.getZoom()) - 1,
        duration: 700,
        center: s.coordinate
      });
    }
  }
];
var w = { exports: {} };
function M() {
}
M.prototype = {
  on: function(s, t, e) {
    var n = this.e || (this.e = {});
    return (n[s] || (n[s] = [])).push({
      fn: t,
      ctx: e
    }), this;
  },
  once: function(s, t, e) {
    var n = this;
    function i() {
      n.off(s, i), t.apply(e, arguments);
    }
    return i._ = t, this.on(s, i, e);
  },
  emit: function(s) {
    var t = [].slice.call(arguments, 1), e = ((this.e || (this.e = {}))[s] || []).slice(), n = 0, i = e.length;
    for (n; n < i; n++)
      e[n].fn.apply(e[n].ctx, t);
    return this;
  },
  off: function(s, t) {
    var e = this.e || (this.e = {}), n = e[s], i = [];
    if (n && t)
      for (var o = 0, l = n.length; o < l; o++)
        n[o].fn !== t && n[o].fn._ !== t && i.push(n[o]);
    return i.length ? e[s] = i : delete e[s], this;
  }
};
w.exports = M;
var T = w.exports.TinyEmitter = M;
const y = new T();
function E(s) {
  const t = document.createDocumentFragment(), e = document.createElement("div");
  for (e.innerHTML = s; e.firstChild; )
    t.append(e.firstChild);
  return t;
}
function D(s) {
  const t = document.importNode(s), e = s.offsetWidth;
  t.style.cssText = `position: fixed; top: 0; left: 0; overflow: auto; visibility: hidden; pointer-events: none; height: unset; max-height: unset; width: ${e}px`;
  const n = E("<span>Foo</span>"), i = E("<span>Foo</span>"), o = document.createElement("li"), l = document.createElement("li");
  o.append(n), l.append(i), t.append(o), t.append(l), s.parentNode?.append(t);
  const u = t.offsetHeight / 2;
  return s.parentNode?.removeChild(t), u;
}
function L(s, t, e = !1) {
  const n = `_${Math.random().toString(36).slice(2, 11)}`;
  if (typeof t != "string" && "text" in t) {
    const u = `<span>${t.text}</span>`, m = E(u), c = document.createElement("li");
    return t.classname = t.classname || "", t.icon && (t.classname === "" ? t.classname = r.icon : t.classname.includes(r.icon) === !1 && (t.classname += ` ${r.icon}`), c.setAttribute("style", `background-image:url(${t.icon})`)), c.id = n, c.className = t.classname, c.append(m), s.append(c), y.emit(
      f.ADD_MENU_ENTRY,
      {
        id: n,
        isSubmenu: e,
        isSeparator: !1,
        callback: "callback" in t ? t.callback : null,
        data: "data" in t ? t.data : null
      },
      c
    ), c;
  }
  const i = `<li id="${n}" class="${r.separator}"><hr></li>`, o = E(i);
  s.append(o);
  const l = s.lastChild;
  return y.emit(
    f.ADD_MENU_ENTRY,
    {
      id: n,
      isSubmenu: e,
      isSeparator: !0,
      callback: null,
      data: null
    },
    l
  ), l;
}
function v(s, t, e) {
  t.forEach((n) => {
    if (typeof n != "string" && "items" in n && Array.isArray(n.items)) {
      const i = L(s, n, !0);
      i.classList.add(r.submenu);
      const o = document.createElement("ul");
      o.classList.add(r.container), o.style.width = `${e}px`, i.append(o), v(o, n.items, e);
    } else
      L(s, n);
  });
}
function g(s, t) {
  if (!s)
    throw new Error(t);
}
class P extends H {
  constructor(e = {}) {
    g(typeof e == "object", "@param `opts` should be object type!");
    const n = document.createElement("div");
    super({ element: n });
    a(this, "map");
    a(this, "container");
    a(this, "coordinate", []);
    a(this, "pixel", []);
    a(this, "contextMenuEventListener");
    a(this, "entryCallbackEventListener");
    a(this, "mapMoveListener");
    a(this, "beforeOpenHandler");
    a(this, "closeHandler");
    a(this, "lineHeight", 0);
    a(this, "disabled");
    a(this, "opened");
    a(this, "items", []);
    a(this, "menuEntries", /* @__PURE__ */ new Map());
    a(this, "options");
    this.options = { ...O, ...e };
    const i = document.createElement("ul");
    n.append(i), n.style.width = `${this.options.width}px`, n.classList.add(
      r.container,
      r.unselectable,
      r.hidden
    ), this.container = n, this.contextMenuEventListener = (o) => {
      this.handleContextMenu(o);
    }, this.entryCallbackEventListener = (o) => {
      this.handleEntryCallback(o);
    }, this.mapMoveListener = () => {
      this.handleMapMove();
    }, this.beforeOpenHandler = (o, l) => {
      this.options.beforeOpenHandler(o, l);
    }, this.closeHandler = () => {
      this.options.closeHandler();
    }, this.disabled = !1, this.opened = !1, y.on(
      f.ADD_MENU_ENTRY,
      (o, l) => {
        this.handleAddMenuEntry(o, l);
      },
      this
    );
  }
  clear() {
    for (const e of this.menuEntries.keys())
      this.removeMenuEntry(e);
    this.container.replaceChildren(), this.container.append(document.createElement("ul"));
  }
  enable() {
    this.disabled = !1;
  }
  disable() {
    this.disabled = !0;
  }
  getDefaultItems() {
    return x;
  }
  countItems() {
    return this.menuEntries.size;
  }
  extend(e) {
    g(Array.isArray(e), "@param `items` should be an Array."), v(
      this.container.firstElementChild,
      e,
      this.options.width
    );
  }
  closeMenu() {
    this.opened = !1, this.container.classList.add(r.hidden), this.closeHandler();
  }
  isOpen() {
    return this.opened;
  }
  updatePosition(e) {
    g(Array.isArray(e), "@param `pixel` should be an Array."), this.isOpen() && (this.pixel = e, this.positionContainer());
  }
  pop() {
    const e = Array.from(this.menuEntries.keys()).pop();
    e && this.removeMenuEntry(e);
  }
  shift() {
    const e = Array.from(this.menuEntries.keys()).shift();
    e && this.removeMenuEntry(e);
  }
  push(e) {
    e && this.extend([e]);
  }
  setMap(e) {
    if (super.setMap(e), e) {
      this.map = e, this.map.getViewport().addEventListener(this.options.eventType, this.contextMenuEventListener, !1), this.map.on("movestart", () => {
        this.handleMapMove();
      }), this.items = this.options.defaultItems ? this.options.items.concat(x) : this.options.items, v(
        this.container.firstElementChild,
        this.items,
        this.options.width
      );
      const n = this.getMenuEntriesLength();
      this.lineHeight = n > 0 ? this.container.offsetHeight / n : D(this.container);
    } else
      this.removeListeners(), this.clear();
  }
  removeListeners() {
    this.map.getViewport().removeEventListener(this.options.eventType, this.contextMenuEventListener, !1);
  }
  removeMenuEntry(e) {
    const n = document.getElementById(e);
    n?.remove(), n?.removeEventListener("click", this.entryCallbackEventListener), this.menuEntries.delete(e);
  }
  handleContextMenu(e) {
    this.coordinate = this.map.getEventCoordinate(e), this.pixel = this.map.getEventPixel(e), this.beforeOpenHandler(this.coordinate, this.pixel), !this.disabled && (this.options.eventType === b.CONTEXTMENU && (e.stopPropagation(), e.preventDefault()), setTimeout(() => {
      this.openMenu();
    }), e.target?.addEventListener(
      "pointerdown",
      (n) => {
        this.opened && (n.stopPropagation(), this.closeMenu());
      },
      { once: !0 }
    ));
  }
  openMenu() {
    this.menuEntries.size !== 0 && (this.opened = !0, this.positionContainer(), this.container.classList.remove(r.hidden));
  }
  getMenuEntriesLength() {
    return Array.from(this.menuEntries).filter(
      ([, e]) => e.isSeparator === !1 || e.isSubmenu === !1
    ).length;
  }
  positionContainer() {
    const e = this.map.getSize() || [0, 0], n = {
      w: e[0] - this.pixel[0],
      h: e[1] - this.pixel[1]
    }, i = {
      w: this.container.offsetWidth,
      h: Math.round(this.lineHeight * this.getMenuEntriesLength())
    }, o = n.w >= i.w ? this.pixel[0] + 5 : this.pixel[0] - i.w;
    this.container.style.left = `${o}px`, this.container.style.top = n.h >= i.h ? `${this.pixel[1] - 10}px` : `${this.pixel[1] - i.h}px`, this.container.style.right = "auto", this.container.style.bottom = "auto", n.w -= i.w;
    const l = (c) => Array.from(c.children).filter(
      (p) => p.tagName === "LI" && p.classList.contains(r.submenu)
    );
    let u = 0;
    const m = (c, p) => {
      u += 1, l(c).forEach((C) => {
        const A = p >= i.w ? i.w - 8 : (i.w + 8) * -1, h = C.querySelector(
          `ul.${r.container}`
        ), $ = Math.round(
          this.lineHeight * Array.from(h.children).filter((N) => N.tagName === "LI").length
        );
        h.style.left = `${A}px`, h.style.right = "auto", h.style.top = n.h >= $ + i.h ? "0" : `-${h.offsetHeight - 25}px`, h.style.bottom = "auto", h.style.zIndex = String(u), l(h).length > 0 && m(h, p - i.w);
      });
    };
    m(this.container.firstElementChild, n.w);
  }
  handleMapMove() {
    this.closeMenu();
  }
  handleEntryCallback(e) {
    e.preventDefault(), e.stopPropagation();
    const n = e.currentTarget, i = this.menuEntries.get(n.id);
    if (!i)
      return;
    const o = {
      coordinate: this.coordinate,
      data: i.data
    };
    this.closeMenu(), i.callback?.(o, this.map);
  }
  handleAddMenuEntry(e, n) {
    this.menuEntries.set(e.id, e), "callback" in e && typeof e.callback == "function" && n.addEventListener("click", this.entryCallbackEventListener, !1);
  }
}
export {
  P as default
};
