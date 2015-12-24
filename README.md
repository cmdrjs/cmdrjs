cmdrjs
======
A JavaScript based command line interface for web pages.

[![Build status](https://travis-ci.org/cmdrjs/cmdrjs.png)](https://travis-ci.org/cmdrjs/cmdrjs)
[![Bower version](https://badge.fury.io/bo/cmdrjs.svg)](http://badge.fury.io/bo/cmdrjs)

## Install

```
bower install cmdrjs
```

## Basic usage

There are two primary classes for creating consoles with cmdrjs, `Console` and `OverlayConsole`. The `Console` class creates a console interface inside a provided DOM element. The `OverlayConsole` creates a console interface that is global to the page, overlays the entire page and can be opened and closed.

#### Creating a console

```javascript
var containerElement = document.getElementById('container');
var console = new cmdr.Console(containerElement);
```

#### Creating an overlay console

```javascript
var console = new cmdr.OverlayConsole();
```

NOTE: The `OverlayConsole` is a singleton (sort of). Upon construction, if another intance exists, that instance is disposed before the new instance is initialized.

#### Setting options

```javascript
var containerElement = document.getElementById('container');
var options = { 
    echo: false
};
var console = new cmdr.Console(containerElement, options);
```

See the available options below.

## Options

#### Console

The `Console` class has the following options.

|Option|Description|Default|
|---|---|---|
|autoInit|Specifies whether to initialize the console at construction.|true|
|echo|Specifies whether to capture executed commands in the console output.|true|
|predefinedCommands|Specifies whether to initialize the console with basic predefined commands (e.g. `help`, `cls`, `echo`).|true|
|abbreviatedCommands|Specifies whether to allow for abbreviated command names.|true|
|promptPrefix|The prompt prefix.|'> '|
|template|The console HTML template. If you choose to modify the template, ensure that you have accounted for the proper elements and CSS classes such that the code can still find the proper element.|*see source code*|

#### OverlayConsole

The `OverlayConsole` class has all of the options of the `Console` class as well as the following options.

|Option|Description|Default|
|---|---|---|
|autoOpen|Specifies whether to open the console overlay at initialization.|false|
|openKey|The key code to open the console overlay.|192 (~)|
|closeKey|The key code to close the console overlay.|27 (Esc)|

## Properties

#### Console

The `Console` class has the following properties.

|Property|Description|
|---|---|
|initialized|Gets a value indicating whether the console is initialized.|
|options|Gets the console options.|
|definitions|Gets the map of command definitions for the console.|
|historyProvider|Gets or sets the history provider.|

#### OverlayConsole

The `OverlayConsole` class has all of the properties of the `Console` class as well as the following properties.

|Property|Description|
|---|---|
|isOpen|Gets a value indicating whether the overlay console is open.|

## Methods

#### Console

The `Console` class has the following methods.

|Method|Description|Arguments|
|---|---|---|
|init|Initalizes the console.||
|dispose|Disposes the console.||
|reset|Disposes and reinitializes the console.||
|read|Used to collect user input on keypress and optionally capture it such that it does not write to the prompt. Only usable during command execution.|*callback*: A function that is called when a character is input and is passed the character. Return `true` to continue reading characters.<br>*capture*: A value specifying whether to capture the input without writing it to the prompt.|
|readLine|Used to collect user input on enter keypress. Only usable during command execution.|*callback*: A function that is called when the enter key is pressed and is passed the line of input.|
|write|Writes a value to the console output.|*value*: The string value to write.<br>*cssClass*: Optional. The CSS class to apply to the value (e.g. `error`, `warning`, `success`). |
|writeLine|Writes a value to the console output and starts a new line.|*value*: The string value to write.<br>*cssClass*: Optional. The CSS class to apply to the value (e.g. `error`, `warning`, `success`). |
|writePad|Writes a value to the console output with padding.|*value*: The string value to write.<br>*padding*: The string to use as padding.<br>*length*: The number of times to apply the padding string. Negative values will pad from the left.<br>*cssClass*: Optional. The CSS class to apply to the value (e.g. `error`, `warning`, `success`). |
|clear|Clears the console output.||
|focus|Places user focus in the prompt.||
|blur|Removes user focus from the prompt.||
|execute|Executes a command.|*command*: The string command to execute.|
|define|Defines commands.|*name(s)*: The string name or array of string names of the command.<br>*callback*: The function that is called when the command is executed and is passed the command arguments.<br>*options*: Optional. Command options.|
|predefine|Predefines a set of basic commands.| |

#### OverlayConsole

The `OverlayConsole` class has all of the methods of the `Console` class as well as the following methods.

|Method|Description|Arguments|
|---|---|---|
|open|Opens the overlay console.||
|close|Closes the overlay console.||

## Loading the module

The `cmdr` module is bundled using the standalone option in [browserify](http://browserify.org/) which uses the [umd](https://github.com/forbeslindesay/umd) library. This allows the module to be loaded in various ways.

#### CommonJS

```javascript
var cmdr = require('cmdr.js');
var console = new cmdr.Console(...);
```

#### RequireJS

```javascript
require('cmdr.js', function(cmdr) {
    var console = new cmdr.Console(...);
});
```

#### Global/Window

```html
<script src="cmdr.js"></script>
<script>
    var console = new cmdr.Console(...);
</script>
```

## Dependencies

The `cmdr` module is bundled with its dependencies and therefore has no external dependencies.

__Bundled dependencies__
* [es6-promise](https://github.com/jakearchibald/es6-promise)

See [package.json](https://github.com/cmdrjs/cmdrjs/blob/master/package.json) from accurate versions.