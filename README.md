# reactive-flux

> Fluxish model implemented with RxJS

I was trying to use React + Flux to build a Dashboard but while reading Flux tutorials I already started to dislike the switch statements and constants that are all over the place.

React and the Flux architecture seem to fit well with RxJS, so this is my take on it.

This is my first JavaScript code so feel free to send pull requests and let me know of any bugs or improvements you can think of. It's inspired by several libraries that try to combine React with Rx but they didn't seem to do exactly what I had in mind.

Installation
============
```
npm install reactive-flux
```

Description
===========
The dispatcher is completely gone. Instead we are using Rx.Subjects as Actions and Stores. 

* An Action can have many Stores subscribed to it
* A Store can subscribe to many Actions, each with its own handler
* Additionally it can request to be notified after other stores in case there are any dependencies (Dispatcher.waitFor())
* React components can subscribe to many Stores as they are subclasses of Rx.Subject

Example
=======
```javascript
var ReactiveFlux = require('reactive-flux'),
    Action = ReactiveFlux.Action,
    Store = ReactiveFlux.Store;
    
SomeAction = Action.create();

class SomeStore extends Store {
    constructor() {
        super();

	this._someMember = {};
	
	this.init();
    }
    
    init() {
        this.observe(SomeAction, this.onSomeAction);
    }

    onSomeAction(data) {
        this._someMember = data;
    }
    
    getSomeMember() {
        return this._someMember;
    }
}

var SomeComponent = React.createClass({
    getInitialState: function(){
        return SomeStore.getSomeMember();
    },

    _subscription: {},
    
    componentDidMount: function() {
        self = this;
        this._subscription = SomeStore.subscribe(function () {
            self.setState(SomeStore.getSomeMember());
        });
    },

    componentWillUnmount: function() {
        this._subscription.dispose();
    },
    
    render: function(){
        return (
            // something
        );
    }
});
```