# reactive-flux

> Fluxish model implemented with RxJS

I was trying to use React + Flux to build a Dashboard but while reading Flux tutorials I already started to dislike the switch statements and constants that are all over the place.

React and the Flux architecture seem to fit well with RxJS, so this is my take on it.

This is my first JavaScript code so feel free to send pull requests and let me know of any bugs or improvements you can think of. It's inspired by several libraries that try to combine React with Rx but they didn't seem to do exactly what I had in mind.

## Installation
```
npm install reactive-flux
```

## Description
The dispatcher is completely gone. Instead we are using Rx.Subjects as Actions and Stores.

* An Action can have many Stores subscribed to it
* A Store can subscribe to many Actions, each with its own handler
* Additionally it can request to be notified after other stores in case there are any dependencies (Dispatcher.waitFor())
* React components can subscribe to many Stores as they are subclasses of Rx.Subject

## Changelog

* 0.1.2: Custom function argument for Action. Fixed problem that the library could not be required correctly.

## Example
```javascript
let ReactiveFlux = require('reactive-flux'),
	request = require('superagent'),
	React = require('react'),
	Action = ReactiveFlux.Action,
	Store = ReactiveFlux.Store;

let LoginSucceededAction = Action.make();
let LoginFailedAction = Action.make();

let LoginAction = Action.make((username, password) => {
	request
		.post('/login')
		.send({ username: username, password: password })
		.end(function(err, res){
			if (res.status == 200) {
				LoginSucceededAction(res.body.token);
			} else {
				LoginFailedAction();
			}
		});
});

let LOGIN_TOKEN_KEY = 'token';

class LoginStore extends Store {
	constructor() {
		super();

		// yes, I agree this is superfluous and needs to be changed :)
		this.init();
	}

	init() {
		this.observe(LoginSucceededAction, this.onLoginSucceeded);
		this.observe(LoginFailedAction, this.onLoginFailed);
	}

	onLoginSucceeded(token) {
		window.localStorage.setItem(LOGIN_TOKEN_KEY, token);
	}

	onLoginFailed() {
		window.localStorage.removeItem(LOGIN_TOKEN_KEY);
	}

	getToken() {
		return window.localStorage.getItem(LOGIN_TOKEN_KEY);
	}

	isLoggedIn() {
		return !!this.getToken();
	}
}

var LoginComponent = React.createClass({
	getInitialState() {
		return { isLoggedIn: LoginStore.isLoggedIn() };
	},

	_subscription: {},

	componentDidMount() {
		self = this;
		this._subscription = LoginStore.subscribe(function () {
			if (LoginStore.isLoggedIn()) {
			   // do something useful
			}
		});
	},

	componentWillUnmount() {
		this._subscription.dispose();
	},

	render() {
		return (
			// something
		);
	},

	handleSubmit(e) {
		e.preventDefault();

		let username = this.refs.username.getValue().trim();
		let password = this.refs.password.getValue().trim();

		if (!username || !password) {
			return;
		}

		// call our action
		LoginAction(username, password);
	}
});

// Actions are subjects so we can subscribe to an API or similar
var source = Rx.Observable.fromEvent(document, 'mousemove');
source.subscribe(SomeAction); // All mousemove events will be send to subscribing stores of SomeAction
```

Alternatively, you can use the store mixin for the component

```javascript
var LoginComponent = React.createClass({
	mixins: [LoginStore.mixin]
	getInitialState() {
		return { isLoggedIn: LoginStore.isLoggedIn() };
	},

	onSubscribe() {
		// This function defaults to a noop, and you can override it if that makes sense
	},

	render() {
		return (
			// something
		);
	},

	handleSubmit(e) {
		e.preventDefault();

		let username = this.refs.username.getValue().trim();
		let password = this.refs.password.getValue().trim();

		if (!username || !password) {
			return;
		}

		// call our action
		LoginAction(username, password);
	}
});
```
