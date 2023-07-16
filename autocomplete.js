/**
 * Bootstrap 5 autocomplete
 */

// #region config

/**
 * @callback RenderCallback
 * @param {Object} item
 * @param {String} label
 * @param {Autocomplete} inst
 * @returns {string}
 */

/**
 * @callback ItemCallback
 * @param {Object} item
 * @param {Autocomplete} inst
 * @returns {void}
 */

/**
 * @callback ServerCallback
 * @param {Response} response
 * @param {Autocomplete} inst
 * @returns {Promise}
 */

/**
 * @typedef Config
 * @property {Boolean} showAllSuggestions Show all suggestions even if they don't match
 * @property {Number} suggestionsThreshold Number of chars required to show suggestions
 * @property {Number} maximumItems Maximum number of items to display
 * @property {Boolean} autoselectFirst Always select the first item
 * @property {Boolean} updateOnSelect Update input value on selection (doesn't play nice with autoselectFirst)
 * @property {Boolean} highlightTyped Highlight matched part of the label
 * @property {Boolean} fullWidth Match the width on the input field
 * @property {Boolean} fixed Use fixed positioning (solve overflow issues)
 * @property {Boolean} fuzzy Fuzzy search
 * @property {Array} activeClasses By default: ["bg-primary", "text-white"]
 * @property {String} labelField Key for the label
 * @property {String} valueField Key for the value
 * @property {Array} searchFields Key for the search
 * @property {String} queryParam Key for the query parameter for server
 * @property {Array|Object} items An array of label/value objects or an object with key/values
 * @property {Function} source A function that provides the list of items
 * @property {Boolean} hiddenInput Create an hidden input which stores the valueField
 * @property {String} hiddenValue Populate the initial hidden value. Mostly useful with liveServer.
 * @property {String} datalist The id of the source datalist
 * @property {String} server Endpoint for data provider
 * @property {String} serverMethod HTTP request method for data provider, default is GET
 * @property {String|Object} serverParams Parameters to pass along to the server. You can specify a "related" key with the id of a related field.
 * @property {String} serverDataKey By default: data
 * @property {Object} fetchOptions Any other fetch options (https://developer.mozilla.org/en-US/docs/Web/API/fetch#syntax)
 * @property {Boolean} liveServer Should the endpoint be called each time on input
 * @property {Boolean} noCache Prevent caching by appending a timestamp
 * @property {Number} debounceTime Debounce time for live server
 * @property {String} notFoundMessage Display a no suggestions found message. Leave empty to disable
 * @property {RenderCallback} onRenderItem Callback function that returns the label
 * @property {ItemCallback} onSelectItem Callback function to call on selection
 * @property {ServerCallback} onServerResponse Callback function to process server response. Must return a Promise
 * @property {ItemCallback} onChange Callback function to call on change-event. Returns currently selected item if any
 */

/**
 * @type {Config}
 */
const DEFAULTS = {
  showAllSuggestions: false,
  suggestionsThreshold: 1,
  maximumItems: 0,
  autoselectFirst: true,
  updateOnSelect: false,
  highlightTyped: false,
  fullWidth: false,
  fixed: false,
  fuzzy: false,
  activeClasses: ["bg-primary", "text-white"],
  labelField: "label",
  valueField: "value",
  searchFields: ["label"],
  queryParam: "query",
  items: [],
  source: null,
  hiddenInput: false,
  hiddenValue: "",
  datalist: "",
  server: "",
  serverMethod: "GET",
  serverParams: {},
  serverDataKey: "data",
  fetchOptions: {},
  liveServer: false,
  noCache: true,
  debounceTime: 300,
  notFoundMessage: "",
  onRenderItem: (item, label, inst) => {
    return label;
  },
  onSelectItem: (item, inst) => {},
  onServerResponse: (response, inst) => {
    return response.json();
  },
  onChange: (item, inst) => {},
};

// #endregion

// #region constants

const LOADING_CLASS = "is-loading";
const ACTIVE_CLASS = "is-active";
const SHOW_CLASS = "show";
const NEXT = "next";
const PREV = "prev";

const INSTANCE_MAP = new WeakMap();
let counter = 0;
let activeCounter = 0;

// #endregion

// #region functions

/**
 * @param {Function} func
 * @param {number} timeout
 * @returns {Function}
 */
function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      //@ts-ignore
      func.apply(this, args);
    }, timeout);
  };
}

/**
 * @param {String} str
 * @returns {String}
 */
function removeDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * @param {String|Number} str
 * @returns {String}
 */
function normalize(str) {
  if (!str) {
    return "";
  }
  return removeDiacritics(str.toString()).toLowerCase();
}

/**
 * A simple fuzzy match algorithm that checks if chars are matched
 * in order in the target string
 *
 * @param {String} str
 * @param {String} lookup
 * @returns {Boolean}
 */
function fuzzyMatch(str, lookup) {
  if (str.indexOf(lookup) == 0) {
    return true;
  }
  let pos = 0;
  for (let i = 0; i < lookup.length; i++) {
    const c = lookup[i];
    if (c == " ") continue;
    pos = str.indexOf(c, pos) + 1;
    if (pos <= 0) {
      return false;
    }
  }
  return true;
}

/**
 * @param {HTMLElement} el
 * @param {HTMLElement} newEl
 * @returns {HTMLElement}
 */
function insertAfter(el, newEl) {
  return el.parentNode.insertBefore(newEl, el.nextSibling);
}

/**
 * @param {string} html
 * @returns {string}
 */
function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * @param {HTMLElement} el
 * @param {Object} attrs
 */
function attrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

// #endregion

class Autocomplete {
  /**
   * @param {HTMLInputElement} el
   * @param {Config|Object} config
   */
  constructor(el, config = {}) {
    if (!(el instanceof HTMLElement)) {
      console.error("Invalid element", el);
      return;
    }
    INSTANCE_MAP.set(el, this);
    counter++;
    activeCounter++;
    this._searchInput = el;

    this._configure(config);

    // Private vars
    this._preventInput = false;
    this._keyboardNavigation = false;
    this._searchFunc = debounce(() => {
      this._loadFromServer(true);
    }, this._config.debounceTime);

    // Create html
    this._configureSearchInput();
    this._configureDropElement();

    if (this._config.fixed) {
      document.addEventListener("scroll", this, true);
      window.addEventListener("resize", this);
    }

    // Add listeners (remove then on dispose()). See handleEvent.
    this._searchInput.addEventListener("focus", this);
    this._searchInput.addEventListener("change", this);
    this._searchInput.addEventListener("blur", this);
    this._searchInput.addEventListener("input", this);
    this._searchInput.addEventListener("keydown", this);
    this._dropElement.addEventListener("mousemove", this);

    this._fetchData();
  }

  // #region Core

  /**
   * Attach to all elements matched by the selector
   * @param {string} selector
   * @param {Config|Object} config
   */
  static init(selector = "input.autocomplete", config = {}) {
    /**
     * @type {NodeListOf<HTMLInputElement>}
     */
    const nodes = document.querySelectorAll(selector);
    nodes.forEach((el) => {
      this.getOrCreateInstance(el, config);
    });
  }

  /**
   * @param {HTMLInputElement} el
   */
  static getInstance(el) {
    return INSTANCE_MAP.has(el) ? INSTANCE_MAP.get(el) : null;
  }

  /**
   * @param {HTMLInputElement} el
   * @param {Object} config
   */
  static getOrCreateInstance(el, config = {}) {
    return this.getInstance(el) || new this(el, config);
  }

  dispose() {
    activeCounter--;

    this._searchInput.removeEventListener("focus", this);
    this._searchInput.removeEventListener("change", this);
    this._searchInput.removeEventListener("blur", this);
    this._searchInput.removeEventListener("input", this);
    this._searchInput.removeEventListener("keydown", this);
    this._dropElement.removeEventListener("mousemove", this);

    // only remove if there are no more active elements
    if (this._config.fixed && activeCounter <= 0) {
      document.removeEventListener("scroll", this, true);
      window.removeEventListener("resize", this);
    }

    this._dropElement.parentElement.removeChild(this._dropElement);

    INSTANCE_MAP.delete(this._searchInput);
  }

  /**
   * @link https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4#handling-events
   * @param {Event} event
   */
  handleEvent(event) {
    // debounce scroll and resize
    const debounced = ["scroll", "resize"];
    if (debounced.includes(event.type)) {
      if (this._timer) window.cancelAnimationFrame(this._timer);
      this._timer = window.requestAnimationFrame(() => {
        this[`on${event.type}`](event);
      });
    } else {
      this[`on${event.type}`](event);
    }
  }

  /**
   * @param {Config|Object} config
   */
  _configure(config = {}) {
    this._config = Object.assign({}, DEFAULTS);

    // Handle options, using arguments first and data attr as override
    const o = { ...config, ...this._searchInput.dataset };

    // Allow 1/0, true/false as strings
    const parseBool = (value) => ["true", "false", "1", "0", true, false].includes(value) && !!JSON.parse(value);

    // Typecast provided options based on defaults types
    for (const [key, defaultValue] of Object.entries(DEFAULTS)) {
      // Check for undefined keys
      if (o[key] === void 0) {
        continue;
      }
      const value = o[key];
      switch (typeof defaultValue) {
        case "number":
          this._config[key] = parseInt(value);
          break;
        case "boolean":
          this._config[key] = parseBool(value);
          break;
        case "string":
          this._config[key] = value.toString();
          break;
        case "object":
          // Arrays have a type object in js
          if (Array.isArray(defaultValue)) {
            if (typeof value === "string") {
              const separator = value.includes("|") ? "|" : ",";
              this._config[key] = value.split(separator);
            } else {
              this._config[key] = value;
            }
          } else {
            this._config[key] = typeof value === "string" ? JSON.parse(value) : value;
          }
          break;
        case "function":
          this._config[key] = typeof value === "string" ? window[value] : value;
          break;
        default:
          this._config[key] = value;
          break;
      }
    }
  }

  // #endregion

  // #region Html

  _configureSearchInput() {
    this._searchInput.autocomplete = "field-" + Date.now(); // off is ignored
    this._searchInput.spellcheck = false;
    // note: firefox doesn't support the properties so we use attributes
    // @link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-autocomplete
    // @link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
    // use the aria-expanded state on the element with role combobox to communicate that the list is displayed.
    attrs(this._searchInput, {
      "aria-auto-complete": "list",
      "aria-has-popup": "menu",
      "aria-expanded": "false",
      role: "combobox",
    });
    // Hidden input?
    this._hiddenInput = null;
    if (this._config.hiddenInput) {
      this._hiddenInput = document.createElement("input");
      this._hiddenInput.type = "hidden";
      this._hiddenInput.value = this._config.hiddenValue;
      this._hiddenInput.name = this._searchInput.name;
      this._searchInput.name = "_" + this._searchInput.name;
      insertAfter(this._searchInput, this._hiddenInput);
    }
  }

  _configureDropElement() {
    this._dropElement = document.createElement("ul");
    this._dropElement.id = "ac-menu-" + counter;
    this._dropElement.setAttribute("role", "menu");
    this._dropElement.classList.add(...["dropdown-menu", "autocomplete-menu", "p-0"]);
    this._dropElement.style.maxHeight = "280px";
    if (!this._config.fullWidth) {
      this._dropElement.style.maxWidth = "360px";
    }
    if (this._config.fixed) {
      this._dropElement.style.position = "fixed";
    }
    this._dropElement.style.overflowY = "auto";
    // Prevent scrolling the menu from scrolling the page
    // @link https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
    this._dropElement.style.overscrollBehavior = "contain";
    this._dropElement.style.textAlign = "unset"; // otherwise RTL is not good

    insertAfter(this._searchInput, this._dropElement);
    // include aria-controls with the value of the id of the suggested list of values.
    this._searchInput.setAttribute("aria-controls", this._dropElement.id);
  }

  // #endregion

  // #region Events

  oninput(e) {
    if (this._preventInput) {
      return;
    }
    // Input has changed, clear value
    if (this._hiddenInput) {
      this._hiddenInput.value = null;
    }
    this.showOrSearch();
  }

  onchange(e) {
    const search = this._searchInput.value;
    const item = Object.values(this._items).find((item) => item.label === search);
    this._config.onChange(item, this);
  }

  onblur(e) {
    this.hideSuggestions();
  }

  onfocus(e) {
    this.showOrSearch();
  }

  /**
   * keypress doesn't send arrow keys, so we use keydown
   * @param {KeyboardEvent} e
   */
  onkeydown(e) {
    const key = e.keyCode || e.key;
    switch (key) {
      case 13:
      case "Enter":
        if (this.isDropdownVisible()) {
          e.preventDefault();
          const selection = this.getSelection();
          if (selection) {
            selection.click();
          }
        }
        break;
      case 38:
      case "ArrowUp":
        e.preventDefault();
        this._keyboardNavigation = true;
        this._moveSelection(PREV);
        break;
      case 40:
      case "ArrowDown":
        e.preventDefault();
        this._keyboardNavigation = true;
        if (this.isDropdownVisible()) {
          this._moveSelection(NEXT);
        } else {
          // show menu regardless of input length
          this.showOrSearch(false);
        }
        break;
      case 27:
      case "Escape":
        if (this.isDropdownVisible()) {
          this._searchInput.focus();
          this.hideSuggestions();
        }
        break;
    }
  }

  onmousemove(e) {
    // Moving the mouse means no longer using keyboard
    this._keyboardNavigation = false;
  }

  onscroll(e) {
    this._positionMenu();
  }

  onresize(e) {
    this._positionMenu();
  }

  // #endregion

  // #region Api

  /**
   * @param {String} k
   * @returns {Config}
   */
  getConfig(k = null) {
    if (k !== null) {
      return this._config[k];
    }
    return this._config;
  }

  /**
   * @param {String} k
   * @param {*} v
   */
  setConfig(k, v) {
    this._config[k] = v;
  }

  setData(src) {
    this._items = {};
    this._addItems(src);
  }

  enable() {
    this._searchInput.setAttribute("disabled", "");
  }

  disable() {
    this._searchInput.removeAttribute("disabled");
  }

  /**
   * @returns {boolean}
   */
  isDisabled() {
    return this._searchInput.hasAttribute("disabled") || this._searchInput.disabled || this._searchInput.hasAttribute("readonly");
  }

  /**
   * @returns {boolean}
   */
  isDropdownVisible() {
    return this._dropElement.classList.contains(SHOW_CLASS);
  }

  // #endregion

  // #region Selection management

  /**
   * @returns {HTMLElement}
   */
  getSelection() {
    return this._dropElement.querySelector("a." + ACTIVE_CLASS);
  }

  removeSelection() {
    const selection = this.getSelection();
    if (selection) {
      selection.classList.remove(...this._activeClasses());
    }
  }

  /**
   * @returns {Array}
   */
  _activeClasses() {
    return [...this._config.activeClasses, ...[ACTIVE_CLASS]];
  }

  /**
   * @param {HTMLElement} li
   * @returns {Boolean}
   */
  _isItemEnabled(li) {
    if (li.style.display === "none") {
      return false;
    }
    const fc = li.firstElementChild;
    return fc.tagName === "A" && !fc.classList.contains("disabled");
  }

  /**
   * @param {String} dir
   * @param {*|HTMLElement} sel
   * @returns {HTMLElement}
   */
  _moveSelection(dir = NEXT, sel = null) {
    const active = this.getSelection();

    // select first li
    if (!active) {
      // no active selection, cannot go back
      if (dir === PREV) {
        return sel;
      }
      // find first enabled item
      if (!sel) {
        sel = this._dropElement.firstChild;
        while (sel && !this._isItemEnabled(sel)) {
          sel = sel["nextSibling"];
        }
      }
    } else {
      const sibling = dir === NEXT ? "nextSibling" : "previousSibling";

      // Iterate over enabled li
      sel = active.parentNode;
      do {
        sel = sel[sibling];
      } while (sel && !this._isItemEnabled(sel));

      // We have a new selection
      if (sel) {
        // Change classes
        active.classList.remove(...this._activeClasses());

        // Scroll if necessary
        if (dir === PREV) {
          // Don't use scrollIntoView as it scrolls the whole window
          sel.parentNode.scrollTop = sel.offsetTop - sel.parentNode.offsetTop;
        } else {
          // This is the equivalent of scrollIntoView(false) but only for parent node
          if (sel.offsetTop > sel.parentNode.offsetHeight - sel.offsetHeight) {
            sel.parentNode.scrollTop += sel.offsetHeight;
          }
        }
      } else if (active) {
        sel = active.parentElement;
      }
    }

    if (sel) {
      const a = sel.querySelector("a");
      a.classList.add(...this._activeClasses());
      this._searchInput.setAttribute("aria-activedescendant", a.id);
      if (this._config.updateOnSelect) {
        this._searchInput.value = a.dataset.label;
      }
    } else {
      this._searchInput.setAttribute("aria-activedescendant", "");
    }
    return sel;
  }

  // #endregion

  // #region Implementation

  /**
   * Do we have enough input to show suggestions ?
   * @returns {Boolean}
   */
  _shouldShow() {
    if (this.isDisabled()) {
      return false;
    }
    return this._searchInput.value.length >= this._config.suggestionsThreshold;
  }

  /**
   * Show suggestions or load them
   * @param {Boolean} check
   */
  showOrSearch(check = true) {
    if (check && !this._shouldShow()) {
      this.hideSuggestions();
      return;
    }
    if (this._config.liveServer) {
      this._searchFunc();
    } else if (this._config.source) {
      this._config.source(this._searchInput.value, (items) => {
        this.setData(items);
        this._showSuggestions();
      });
    } else {
      this._showSuggestions();
    }
  }

  /**
   * @param {String} name
   * @returns {HTMLElement}
   */
  _createGroup(name) {
    const newChild = document.createElement("li");
    newChild.setAttribute("role", "presentation");
    const newChildSpan = document.createElement("span");
    newChild.append(newChildSpan);
    newChildSpan.classList.add(...["dropdown-header", "text-truncate"]);
    newChildSpan.innerHTML = name;
    return newChild;
  }

  /**
   * @param {String} lookup
   * @param {Object} item
   * @returns {HTMLElement}
   */
  _createItem(lookup, item) {
    let label = item.label;

    if (this._config.highlightTyped) {
      const idx = normalize(label).indexOf(lookup);
      label =
        label.substring(0, idx) +
        `<mark>${label.substring(idx, idx + lookup.length)}</mark>` +
        label.substring(idx + lookup.length, label.length);
    }

    label = this._config.onRenderItem(item, label, this);

    const newChild = document.createElement("li");
    newChild.setAttribute("role", "presentation");
    const newChildLink = document.createElement("a");
    newChild.append(newChildLink);
    newChildLink.id = this._dropElement.id + "-" + this._dropElement.children.length;
    newChildLink.classList.add(...["dropdown-item", "text-truncate"]);
    newChildLink.setAttribute("data-value", item.value);
    newChildLink.setAttribute("data-label", item.label);
    // Behave like a datalist (tab doesn't allow item selection)
    // @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
    newChildLink.setAttribute("tabindex", "-1");
    newChildLink.setAttribute("role", "menuitem");
    newChildLink.setAttribute("href", "#");
    newChildLink.innerHTML = label;
    if (item.data) {
      for (const [key, value] of Object.entries(item.data)) {
        newChildLink.dataset[key] = value;
      }
    }

    // Hover sets active item
    newChildLink.addEventListener("mouseenter", (event) => {
      // Don't trigger enter if using arrows
      if (this._keyboardNavigation) {
        return;
      }
      this.removeSelection();
      newChild.querySelector("a").classList.add(...this._activeClasses());
    });
    // Prevent searchInput losing focus and close the menu
    newChildLink.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });
    // Apply value
    newChildLink.addEventListener("click", (event) => {
      event.preventDefault();

      // Prevent input otherwise it might trigger autocomplete due to value change
      this._preventInput = true;
      this._searchInput.value = decodeHtml(item.label);
      // Populate value in hidden input
      if (this._hiddenInput) {
        this._hiddenInput.value = item.value;
      }
      this._config.onSelectItem(item, this);
      this.hideSuggestions();
      this._preventInput = false;
    });

    return newChild;
  }

  /**
   * Show drop menu with suggestions
   */
  _showSuggestions() {
    // It's not focused anymore
    if (document.activeElement != this._searchInput) {
      return;
    }
    const lookup = normalize(this._searchInput.value);
    this._dropElement.innerHTML = "";

    const keys = Object.keys(this._items);
    let count = 0;
    let firstItem = null;

    const groups = [];
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entry = this._items[key];

      // Check search length since we can trigger dropdown with arrow
      const showAllSuggestions = this._config.showAllSuggestions || lookup.length === 0;
      // Do we find a matching string or do we display immediately ?
      let isMatched = lookup.length == 0 && this._config.suggestionsThreshold === 0;
      if (!showAllSuggestions && lookup.length > 0) {
        // match on any field
        this._config.searchFields.forEach((sf) => {
          const text = normalize(entry[sf]);
          const found = this._config.fuzzy ? fuzzyMatch(text, lookup) : text.indexOf(lookup) == 0;
          if (found) {
            isMatched = true;
          }
        });
      }
      const selectFirst = isMatched || lookup.length === 0;
      if (showAllSuggestions || isMatched) {
        count++;

        // Group
        if (entry.group && !groups.includes(entry.group)) {
          const newItem = this._createGroup(entry.group);
          this._dropElement.appendChild(newItem);
          groups.push(entry.group);
        }

        const newItem = this._createItem(lookup, entry);
        // Only select as first item if its matching or no lookup
        if (!firstItem && selectFirst) {
          firstItem = newItem;
        }
        this._dropElement.appendChild(newItem);
        if (this._config.maximumItems > 0 && count >= this._config.maximumItems) {
          break;
        }
      }
    }

    if (firstItem && this._config.autoselectFirst) {
      this.removeSelection();
      this._moveSelection(NEXT, firstItem);
    }

    if (count === 0) {
      if (this._config.notFoundMessage) {
        const newChild = document.createElement("li");
        newChild.setAttribute("role", "presentation");
        newChild.innerHTML = `<span class="dropdown-item">${this._config.notFoundMessage}</span>`;
        this._dropElement.appendChild(newChild);
        this._showDropdown();
      } else {
        // Remove dropdown if not found
        this.hideSuggestions();
      }
    } else {
      // Or show it if necessary
      this._showDropdown();
    }
  }

  /**
   * Show and position dropdown
   */
  _showDropdown() {
    this._dropElement.classList.add(SHOW_CLASS);
    attrs(this._searchInput, {
      "aria-expanded": "true",
    });
    this._positionMenu();
  }

  /**
   * Show or hide suggestions
   * @param {Boolean} check
   */
  toggleSuggestions(check = true) {
    if (this._dropElement.classList.contains(SHOW_CLASS)) {
      this.hideSuggestions();
    } else {
      this.showOrSearch(check);
    }
  }

  /**
   * Hide the dropdown menu
   */
  hideSuggestions() {
    this._dropElement.classList.remove(SHOW_CLASS);
    attrs(this._searchInput, {
      "aria-expanded": "false",
    });
    this.removeSelection();
  }

  /**
   * @returns {HTMLInputElement}
   */
  getInput() {
    return this._searchInput;
  }

  /**
   * @returns {HTMLUListElement}
   */
  getDropMenu() {
    return this._dropElement;
  }

  /**
   * Position the dropdown menu
   */
  _positionMenu() {
    const styles = window.getComputedStyle(this._searchInput);
    const bounds = this._searchInput.getBoundingClientRect();
    const isRTL = styles.direction === "rtl";

    // Don't position left if not fixed since it may not work in all situations
    // due to offsetParent margin or in tables
    let left = null;
    let top = null;

    if (this._config.fixed) {
      left = bounds.x;
      top = bounds.y + bounds.height;

      // Align end
      if (isRTL && !this._config.fullWidth) {
        left -= this._dropElement.offsetWidth - bounds.width;
      }
    }

    // Reset any height overflow adjustement
    this._dropElement.style.transform = "unset";

    // Use full holder width
    if (this._config.fullWidth) {
      this._dropElement.style.width = this._searchInput.offsetWidth + "px";
    }

    // Position element
    if (left !== null) {
      this._dropElement.style.left = left + "px";
    }
    if (top !== null) {
      this._dropElement.style.top = top + "px";
    }

    // Overflow height
    const dropBounds = this._dropElement.getBoundingClientRect();
    const h = window.innerHeight;

    // We display above input if it overflows
    if (dropBounds.y + dropBounds.height > h) {
      this._dropElement.style.transform = "translateY(calc(-100% - " + this._searchInput.offsetHeight + "px))";
    }
  }

  _fetchData() {
    this._items = {};

    // From an array of items or an object
    this._addItems(this._config.items);

    // From a datalist
    const dl = this._config.datalist;
    if (dl) {
      const datalist = document.querySelector(`#${dl}`);
      if (datalist) {
        const items = Array.from(datalist.children).map((o) => {
          const value = o.getAttribute("value") ?? o.innerHTML.toLowerCase();
          const label = o.innerHTML;

          return {
            value,
            label,
          };
        });
        this._addItems(items);
      } else {
        console.error(`Datalist not found ${dl}`);
      }
    }
    this._setHiddenVal();

    // From an external source
    if (this._config.server && !this._config.liveServer) {
      this._loadFromServer();
    }
  }

  _setHiddenVal() {
    if (this._config.hiddenInput && !this._config.hiddenValue) {
      for (const [value, entry] of Object.entries(this._items)) {
        if (entry.label == this._searchInput.value) {
          this._hiddenInput.value = value;
        }
      }
    }
  }

  /**
   * @param {Array|Object} src An array of items or a value:label object
   */
  _addItems(src) {
    const keys = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const entry = src[key];

      if (entry.group && entry.items) {
        entry.items.forEach((e) => (e.group = entry.group));
        this._addItems(entry.items);
        continue;
      }

      const label = typeof entry === "string" ? entry : entry.label;
      const item = typeof entry !== "object" ? {} : entry;

      // Normalize entry
      item.label = entry[this._config.labelField] ?? label;
      item.value = entry[this._config.valueField] ?? key;

      // Make sure we have a label
      if (item.label) {
        this._items[item.value] = item;
      }
    }
  }

  /**
   * @param {boolean} show
   */
  _loadFromServer(show = false) {
    if (this._abortController) {
      this._abortController.abort();
    }
    this._abortController = new AbortController();

    // Read data params dynamically as well
    let extraParams = this._searchInput.dataset.serverParams || {};
    if (typeof extraParams == "string") {
      extraParams = JSON.parse(extraParams);
    }
    const params = Object.assign({}, this._config.serverParams, extraParams);
    // Pass current value
    params[this._config.queryParam] = this._searchInput.value;
    // Prevent caching
    if (this._config.noCache) {
      params.t = Date.now();
    }
    // We have a related field
    if (params.related) {
      /**
       * @type {HTMLInputElement}
       */
      //@ts-ignore
      const input = document.getElementById(params.related);
      if (input) {
        params.related = input.value;
        const inputName = input.getAttribute("name");
        if (inputName) {
          params[inputName] = input.value;
        }
      }
    }

    const urlParams = new URLSearchParams(params);
    let url = this._config.server;
    let fetchOptions = Object.assign(this._config.fetchOptions, {
      method: this._config.serverMethod || "GET",
      signal: this._abortController.signal,
    });

    if (fetchOptions.method === "POST") {
      fetchOptions.body = urlParams;
    } else {
      url += "?" + urlParams.toString();
    }

    this._searchInput.classList.add(LOADING_CLASS);
    fetch(url, fetchOptions)
      .then((r) => this._config.onServerResponse(r, this))
      .then((suggestions) => {
        const data = suggestions[this._config.serverDataKey] || suggestions;
        this.setData(data);
        this._setHiddenVal();
        this._abortController = null;
        if (show) {
          this._showSuggestions();
        }
      })
      .catch((e) => {
        if (e.name === "AbortError") {
          return;
        }
        console.error(e);
      })
      .finally((e) => {
        this._searchInput.classList.remove(LOADING_CLASS);
      });
  }

  // #endregion
}

export default Autocomplete;
