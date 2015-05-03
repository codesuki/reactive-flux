var Rx = require('rx');

class Store extends Rx.Subject {
    constructor() {
	super();

	var self = this;
	this.mixin = {
		onSubscribe() {}, // Override me
	    componentDidMount() {
	       this._subscription = self.subscribe(this.onSubscribe)
	    },
	    componentWillUnmount() {
	       this._subscription = self.dispose()
	    }
	};
    }

    observe(action, observer) {
	var self = this;

	return action.subscribe((data) => {
	    observer.call(self, data);
	    this.onNext();
	});
    }
}

module.exports = Store;
