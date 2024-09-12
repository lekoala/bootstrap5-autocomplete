# Autocomplete for Bootstrap 4/5

[![NPM](https://nodei.co/npm/bootstrap5-autocomplete.png?mini=true)](https://nodei.co/npm/bootstrap5-autocomplete/)
[![Downloads](https://img.shields.io/npm/dt/bootstrap5-autocomplete.svg)](https://www.npmjs.com/package/bootstrap5-autocomplete)

## How to use

An ES6 autocomplete for your `input` using standards Bootstrap 5 (and 4) styles.

No additional CSS needed!

```js
import Autocomplete from "./autocomplete.js";
Autocomplete.init();
```

## Server side support

You can also use options provided by the server. This script expects a JSON response with the following structure:

```json
{
    "optionValue1":"optionLabel1",
    "optionValue2":"optionLabel2",
    ...
}
```

or

```json
[
  {
    "value": "server1",
    "label": "Server 1"
  },
  ...
]
```

Simply set `data-server` where your endpoint is located. The suggestions will be populated upon init except if `data-live-server` is set, in which case, it will be populated on type. A ?query= parameter is passed along with the current value of the searchInput.

Data can be nested in the response under the data key (configurable with serverDataKey).

## Options

Options can be either passed to the constructor (eg: optionName) or in data-option-name format.

| Name                       | Type                                           | Description                                                                                             |
| -------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| showAllSuggestions         | <code>Boolean</code>                           | Show all suggestions even if they don't match                                                           |
| suggestionsThreshold       | <code>Number</code>                            | Number of chars required to show suggestions                                                            |
| maximumItems               | <code>Number</code>                            | Maximum number of items to display                                                                      |
| autoselectFirst            | <code>Boolean</code>                           | Always select the first item                                                                            |
| ignoreEnter                | <code>Boolean</code>                           | Ignore enter if no items are selected (play nicely with autoselectFirst=0)                              |
| tabSelect                  | <code>Boolean</code>                           | Tab will trigger selection if active                                                                    |
| updateOnSelect             | <code>Boolean</code>                           | Update input value on selection (doesn't play nice with autoselectFirst)                                |
| highlightTyped             | <code>Boolean</code>                           | Highlight matched part of the label                                                                     |
| highlightClass             | <code>String</code>                            | Class added to the mark label                                                                           |
| fullWidth                  | <code>Boolean</code>                           | Match the width on the input field                                                                      |
| fixed                      | <code>Boolean</code>                           | Use fixed positioning (solve overflow issues)                                                           |
| fuzzy                      | <code>Boolean</code>                           | Fuzzy search                                                                                            |
| startsWith                 | <code>Boolean</code>                           | Must start with the string. Defaults to false (it matches any position).                                |
| fillIn                     | <code>Boolean</code>                           | Show fill in icon.                                                                                      |
| preventBrowserAutocomplete | <code>Boolean</code>                           | Additional measures to prevent browser autocomplete                                                     |
| itemClass                  | <code>String</code>                            | Applied to the dropdown item. Accepts space separated classes.                                          |
| activeClasses              | <code>Array</code>                             | By default: ["bg-primary", "text-white"]                                                                |
| labelField                 | <code>String</code>                            | Key for the label                                                                                       |
| valueField                 | <code>String</code>                            | Key for the value                                                                                       |
| searchFields               | <code>Array</code>                             | Key for the search                                                                                      |
| queryParam                 | <code>String</code>                            | Key for the query parameter for server                                                                  |
| items                      | <code>Array</code> \| <code>Object</code>      | An array of label/value objects or an object with key/values                                            |
| source                     | <code>function</code>                          | A function that provides the list of items                                                              |
| hiddenInput                | <code>Boolean</code>                           | Create an hidden input which stores the valueField                                                      |
| hiddenValue                | <code>String</code>                            | Populate the initial hidden value. Mostly useful with liveServer.                                       |
| clearControl               | <code>String</code>                            | Selector that will clear the input on click.                                                            |
| datalist                   | <code>String</code>                            | The id of the source datalist                                                                           |
| server                     | <code>String</code>                            | Endpoint for data provider                                                                              |
| serverMethod               | <code>String</code>                            | HTTP request method for data provider, default is GET                                                   |
| serverParams               | <code>String</code> \| <code>Object</code>     | Parameters to pass along to the server. You can specify a "related" key with the id of a related field. |
| serverDataKey              | <code>String</code>                            | By default: data                                                                                        |
| fetchOptions               | <code>Object</code>                            | Any other fetch options (https://developer.mozilla.org/en-US/docs/Web/API/fetch#syntax)                 |
| liveServer                 | <code>Boolean</code>                           | Should the endpoint be called each time on input                                                        |
| noCache                    | <code>Boolean</code>                           | Prevent caching by appending a timestamp                                                                |
| debounceTime               | <code>Number</code>                            | Debounce time for live server                                                                           |
| notFoundMessage            | <code>String</code>                            | Display a no suggestions found message. Leave empty to disable                                          |
| onRenderItem               | [<code>RenderCallback</code>](#RenderCallback) | Callback function that returns the label                                                                |
| onSelectItem               | [<code>ItemCallback</code>](#ItemCallback)     | Callback function to call on selection                                                                  |
| onServerResponse           | [<code>ServerCallback</code>](#ServerCallback) | Callback function to process server response. Must return a Promise                                     |
| onServerError              | [<code>ErrorCallback</code>](#ErrorCallback)   | Callback function to process server errors.                                                             |
| onChange                   | [<code>ItemCallback</code>](#ItemCallback)     | Callback function to call on change-event. Returns currently selected item if any                       |
| onBeforeFetch              | [<code>FetchCallback</code>](#FetchCallback)   | Callback function before fetch                                                                          |
| onAfterFetch               | [<code>FetchCallback</code>](#FetchCallback)   | Callback function after fetch                                                                           |

## Callbacks

### RenderCallback ⇒ <code>string</code>

| Param | Type                                       |
| ----- | ------------------------------------------ |
| item  | <code>Object</code>                        |
| label | <code>String</code>                        |
| inst  | [<code>Autocomplete</code>](#Autocomplete) |

<a name="ItemCallback"></a>

### ItemCallback ⇒ <code>void</code>

| Param | Type                                       |
| ----- | ------------------------------------------ |
| item  | <code>Object</code>                        |
| inst  | [<code>Autocomplete</code>](#Autocomplete) |

<a name="ServerCallback"></a>

### ServerCallback ⇒ <code>Promise</code>

| Param    | Type                                       |
| -------- | ------------------------------------------ |
| response | <code>Response</code>                      |
| inst     | [<code>Autocomplete</code>](#Autocomplete) |

<a name="ErrorCallback"></a>

## ErrorCallback ⇒ <code>void</code>

| Param  | Type                                       |
| ------ | ------------------------------------------ |
| e      | <code>Error</code>                         |
| signal | <code>AbortSignal</code>                   |
| inst   | [<code>Autocomplete</code>](#Autocomplete) |

## Tips

- Use arrow down to show dropdown (and arrow up to hide it)
- If you have a really long list of options, a scrollbar will be used
- Access instance on a given element with Autocomplete.getInstance(myEl)
- Use type="search" for your inputs to get a clear icon

## Groups

You can have your items grouped by using the following syntax:

```js
const src = [
  {
    group: "My Group Name",
    items: [
      {
        value: "...",
        label: "...",
      },
    ],
  },
];
```

## Not using Bootstrap ?

This class does NOT depends on Bootstrap JS. If you are not using Bootstrap, you can simply implement the css
the way you like it :-)

## Demo

https://codepen.io/lekoalabe/pen/MWXydNQ or see demo.html

## Custom element

You can now use this as a custom element as part of my [Formidable Elements](https://github.com/lekoala/formidable-elements) collection.

## Browser supports

Modern browsers (edge, chrome, firefox, safari... not IE11). [Add a warning if necessary](https://github.com/lekoala/nomodule-browser-warning.js/).

## Also check out

- [Bootstrap 5 Tags](https://github.com/lekoala/bootstrap5-tags): tags input for bootstrap
- [BS Companion](https://github.com/lekoala/bs-companion): the perfect bootstrap companion
- [Admini](https://github.com/lekoala/admini): the minimalistic bootstrap 5 admin panel
