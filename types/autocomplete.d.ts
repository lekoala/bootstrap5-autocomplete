export default Autocomplete;
export type RenderCallback = (item: any, label: string, inst: Autocomplete) => string;
export type ItemCallback = (item: any, inst: Autocomplete) => void;
export type ValueCallback = (value: string, inst: Autocomplete) => void;
export type ServerCallback = (response: Response, inst: Autocomplete) => Promise<any>;
export type ErrorCallback = (e: Error, signal: AbortSignal, inst: Autocomplete) => void;
export type FetchCallback = (inst: Autocomplete) => void;
export type Config = {
    /**
     * Show all suggestions even if they don't match
     */
    showAllSuggestions: boolean;
    /**
     * Number of chars required to show suggestions
     */
    suggestionsThreshold: number;
    /**
     * Maximum number of items to display
     */
    maximumItems: number;
    /**
     * Always select the first item
     */
    autoselectFirst: boolean;
    /**
     * Ignore enter if no items are selected (play nicely with autoselectFirst=0)
     */
    ignoreEnter: boolean;
    /**
     * Tab will trigger selection if active
     */
    tabSelect: boolean;
    /**
     * Update input value on selection (doesn't play nice with autoselectFirst)
     */
    updateOnSelect: boolean;
    /**
     * Highlight matched part of the label
     */
    highlightTyped: boolean;
    /**
     * Class added to the mark label
     */
    highlightClass: string;
    /**
     * Match the width on the input field
     */
    fullWidth: boolean;
    /**
     * Use fixed positioning (solve overflow issues)
     */
    fixed: boolean;
    /**
     * Fuzzy search
     */
    fuzzy: boolean;
    /**
     * Must start with the string. Defaults to false (it matches any position).
     */
    startsWith: boolean;
    /**
     * Show fill in icon.
     */
    fillIn: boolean;
    /**
     * Additional measures to prevent browser autocomplete
     */
    preventBrowserAutocomplete: boolean;
    /**
     * Applied to the dropdown item. Accepts space separated classes.
     */
    itemClass: string;
    /**
     * By default: ["bg-primary", "text-white"]
     */
    activeClasses: any[];
    /**
     * Key for the label
     */
    labelField: string;
    /**
     * Key for the value
     */
    valueField: string;
    /**
     * Key for the search
     */
    searchFields: any[];
    /**
     * Key for the query parameter for server
     */
    queryParam: string;
    /**
     * An array of label/value objects or an object with key/values
     */
    items: any[] | any;
    /**
     * A function that provides the list of items
     */
    source: Function;
    /**
     * Create an hidden input which stores the valueField
     */
    hiddenInput: boolean;
    /**
     * Populate the initial hidden value. Mostly useful with liveServer.
     */
    hiddenValue: string;
    /**
     * Selector that will clear the input on click.
     */
    clearControl: string;
    /**
     * The id of the source datalist
     */
    datalist: string;
    /**
     * Endpoint for data provider
     */
    server: string;
    /**
     * HTTP request method for data provider, default is GET
     */
    serverMethod: string;
    /**
     * Parameters to pass along to the server.  You can specify a "related" key with (a) the id of a related field or (b) an array of related field ids.
     */
    serverParams: string | any;
    /**
     * By default: data
     */
    serverDataKey: string;
    /**
     * Any other fetch options (https://developer.mozilla.org/en-US/docs/Web/API/fetch#syntax)
     */
    fetchOptions: RequestInit;
    /**
     * Should the endpoint be called each time on input
     */
    liveServer: boolean;
    /**
     * Prevent caching by appending a timestamp
     */
    noCache: boolean;
    /**
     * Debounce time for live server
     */
    debounceTime: number;
    /**
     * Display a no suggestions found message. Leave empty to disable
     */
    notFoundMessage: string;
    /**
     * Callback function that returns the label
     */
    onRenderItem: RenderCallback;
    /**
     * Callback function to call on selection
     */
    onSelectItem: ItemCallback;
    /**
     * Callback function to call on clear
     */
    onClearItem: ValueCallback;
    /**
     * Callback function to process server response. Must return a Promise
     */
    onServerResponse: ServerCallback;
    /**
     * Callback function to process server errors.
     */
    onServerError: ErrorCallback;
    /**
     * Callback function to call on change-event. Returns currently selected item if any
     */
    onChange: ItemCallback;
    /**
     * Callback function before fetch
     */
    onBeforeFetch: FetchCallback;
    /**
     * Callback function after fetch
     */
    onAfterFetch: FetchCallback;
};
declare class Autocomplete {
    /**
     * Attach to all elements matched by the selector
     * @param {string} selector
     * @param {Partial<Config>} config
     * @returns void
     */
    static init(selector?: string, config?: Partial<Config>): void;
    /**
     * @param {HTMLInputElement} el
     * @returns {Autocomplete | null}
     */
    static getInstance(el: HTMLInputElement): Autocomplete | null;
    /**
     * @param {HTMLInputElement} el
     * @param {Partial<Config>} config
     * @returns {Autocomplete}
     */
    static getOrCreateInstance(el: HTMLInputElement, config?: Partial<Config>): Autocomplete;
    /**
     * @param {HTMLInputElement} el
     * @param {Partial<Config>} config
     */
    constructor(el: HTMLInputElement, config?: Partial<Config>);
    _searchInput: HTMLInputElement;
    /** @private */
    private _isMouse;
    /** @private */
    private _preventInput;
    /** @private */
    private _keyboardNavigation;
    /** @private */
    private _searchFunc;
    dispose(): void;
    /**
     * @private
     */
    private _getClearControl;
    /**
     * @link https://github.com/lifaon74/events-polyfill/issues/10
     * @link https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4#handling-events
     * @param {Event} event
     */
    handleEvent: (event: Event) => void;
    _timer: number;
    /**
     * @private
     * @param {Partial<Config>} config
     */
    private _configure;
    _config: any;
    /**
     * @private
     */
    private _configureSearchInput;
    _hiddenInput: HTMLInputElement;
    /**
     * @private
     */
    private _configureDropElement;
    _dropElement: HTMLUListElement;
    /**
     * @param {MouseEvent} e
     */
    onclick(e: MouseEvent): void;
    /**
     * @param {InputEvent} e
     * @returns void
     */
    oninput(e: InputEvent): void;
    /**
     * @param {InputEvent} e
     */
    onchange(e: InputEvent): void;
    /**
   * @param {FocusEvent} e
   */
    onblur(e: FocusEvent): void;
    onfocus(e: any): void;
    /**
     * keypress doesn't send arrow keys, so we use keydown
     * @param {KeyboardEvent} e
     */
    onkeydown(e: KeyboardEvent): void;
    onmouseenter(e: any): void;
    onmousemove(e: any): void;
    onmouseleave(e: any): void;
    onscroll(e: any): void;
    onresize(e: any): void;
    /**
     * @param {String} k
     * @returns {Config}
     */
    getConfig(k?: string): Config;
    /**
     * @param {String} k
     * @param {*} v
     */
    setConfig(k: string, v: any): void;
    setData(src: any): void;
    /** @private */
    private _items;
    enable(): void;
    disable(): void;
    /**
     * @returns {boolean}
     */
    isDisabled(): boolean;
    /**
     * @returns {boolean}
     */
    isDropdownVisible(): boolean;
    clear(): void;
    /**
     * @returns {HTMLElement}
     */
    getSelection(): HTMLElement;
    removeSelection(): void;
    /**
     * @private
     * @returns {Array}
     */
    private _activeClasses;
    /**
     * @private
     * @param {HTMLElement} li
     * @returns {Boolean}
     */
    private _isItemEnabled;
    /**
     * @private
     * @param {String} dir
     * @param {*|HTMLElement} sel
     * @returns {HTMLElement}
     */
    private _moveSelection;
    /**
     * Do we have enough input to show suggestions ?
     * @private
     * @returns {Boolean}
     */
    private _shouldShow;
    /**
     * Show suggestions or load them
     * @param {Boolean} check
     */
    showOrSearch(check?: boolean): void;
    /**
     * @private
     * @param {String} name
     * @returns {HTMLElement}
     */
    private _createGroup;
    /**
     * @private
     * @param {String} lookup
     * @param {Object} item
     * @returns {HTMLElement}
     */
    private _createItem;
    /**
     * Get the active element, drilling into shadowRoot if necessary.
     * @private
     * @link https://www.abeautifulsite.net/posts/finding-the-active-element-in-a-shadow-root/
     * @param {Document | ShadowRoot} root
     * @returns {Element}
     */
    private _getActiveElement;
    /**
     * Show drop menu with suggestions
     * @private
     */
    private _showSuggestions;
    /**
     * @private
     * @returns {HTMLLIElement}
     */
    private _createLi;
    /**
     * Show and position dropdown
     * @private
     */
    private _showDropdown;
    /**
     * Show or hide suggestions
     * @param {Boolean} check
     */
    toggleSuggestions(check?: boolean): void;
    /**
     * Hide the dropdown menu
     */
    hideSuggestions(): void;
    /**
     * @returns {HTMLInputElement}
     */
    getInput(): HTMLInputElement;
    /**
     * @returns {HTMLUListElement}
     */
    getDropMenu(): HTMLUListElement;
    /**
     * Position the dropdown menu
     * @private
     */
    private _positionMenu;
    /**
     * @private
     */
    private _fetchData;
    /**
     * @private
     */
    private _setHiddenVal;
    /**
     * @private
     * @param {Array|Object} src
     * @returns Array
     */
    private _normalizeData;
    /**
     * @private
     * @param {Array|Object} src An array of items or a value:label object
     */
    private _addItems;
    /**
     * @private
     * @param {boolean} show
     */
    private _loadFromServer;
    _abortController: AbortController;
}
