# history-state-manager

Efficient management of state history with structure sharing, providing a non-intrusive approach to tracking state changes in web and software applications.This solution aims to minimize data duplication by sharing common parts between successive state thereby improving performance and reducing memory consumption


## Installation

Install via NPM : 
```javascript
    npm i history-state-manager
```
### Basic usage:
```javascript
import { History } from 'history-state-manager'

const state = { a: 1, b: 2 }

const history = new History()
history.pushSync(state) // the terser `history.push` API is async

state.a = 2 // mutation!
history.pushSync(state)

history.get() // { a: 2, b: 2 }
history.undo().get() // { a: 1, b: 2 }
history.redo().get() // { a: 2, b: 2 }
```