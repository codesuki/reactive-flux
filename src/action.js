var Rx = require('rx');

// mixin version:
// we can call the action itself like actionName()
var Action = function () {
    var begin = new Rx.Subject();
    var end = new Rx.Subject();
    
    var action = function (data) {
        action.onNext(data);
    };

    for (var key in Rx.Subject.prototype) {
	action[key] = Rx.Subject.prototype[key];
    }

    Rx.Subject.call(action);

    action._onNext = action.onNext;

    action.onNext = function(data) {
	begin.onNext(data);
	action._onNext(data);
	end.onNext();
    };

    action.waitFor = function (observers) {
	observers = Array.prototype.slice.call(arguments);
	
	return begin.flatMap(function (value) {
	    return Rx.Observable.combineLatest(
		observers.map(function (observable) {
		    observable = observable.takeUntil(end);
		    return observable;
		}),
		function(values) {
		    return value;
		}
	    );
	});
    };
    
    return action;
};

module.exports = {make: Action};

/*
// class version:
// we need to call onNext() or a wrapper like doAction() to propagate the action
class Action extends Rx.Subject {
    constructor() {
	super();
    }

    doAction() {
	onNext();
    }
}
*/
