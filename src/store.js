var Rx = require('rx');

class Store extends Rx.Subject {
    constructor() {
	super();
    }

    observe(action, observer) {
	var self = this;
	
	// TODO: Save description to dispose
	return action.subscribe((data) => {
	    observer.call(self, data);
	    this.onNext();
	});
    }
}

module.exports = Store;
