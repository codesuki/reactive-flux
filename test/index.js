require("6to5/register");

var expect = require('chai').expect,
    library = require('../src/index'),
    Action = library.Action,
    Store = library.Store;

describe('#Action', function() {
    describe('#Action basic notification', function() {
	var TestAction = Action.make();
	
	it("should notify listeners when called", function(done) {
	    TestAction.subscribe(function (data) {
		expect(data).to.equal('Test');
		done();
	    });
	    TestAction("Test");
	});
    });
	     
    describe('#Action waitFor ordering', function() {
	var TestAction = Action.make();

	var calledA = false;
	var calledB = false;

	var storeA = new Store();
	var storeB = new Store();

	it("should notify listeners A,B before C", function(done) {
	    storeA.observe(TestAction, function(data) {
		calledA = true;
	    });
	    
	    TestAction.waitFor(storeA, storeB).subscribe(function (data) {
		expect(data).to.equal('Test');
		if (calledA && calledB) {
		    done();
		}
	    });

	    storeB.observe(TestAction, function(data) {
		calledB = true;
	    });
	    
	    TestAction("Test");
	});
    });
});

describe('#Store', function() {
    var TestStore = new Store();
    var TestActionA = Action.make();
    var TestActionB = Action.make();

    describe('#Store subscription', function() {
	var calledA = false;
	var calledB = false;
	
	var subA = TestStore.observe(TestActionA, function (data) { /* store callback */});
	var subB = TestStore.observe(TestActionB, function (data) { /* store callback */});
	
	it("should notify listeners when any subscribed action happens", function(done) {
	    TestStore.subscribe(function (data) {
		calledB = true;

	    });
	    TestStore.subscribe(function (data) {
		calledA = true;
	    });
	    
	    TestActionA("TestA");
	    TestActionB("TestB");

	    subA.dispose();
	    subB.dispose();

	    if (calledA && calledB) {
		done();
	    }
	});
    });

    describe('#Store unsubscription', function() {
	var calledA = false;
	var calledB = false;

	var subA = TestStore.observe(TestActionA, function (data) { /* store callback */});
	var subB = TestStore.observe(TestActionB, function (data) { /* store callback */});

	subB.dispose();
	subA.dispose();
	
	it("should not notify unsubscribed subscribers", function(done) {
	    TestStore.subscribe(function (data) {
		console.log("A");
		calledB = true;
	    });
	    TestStore.subscribe(function (data) {
		console.log("B");
		calledA = true;
	    });

	    TestActionA("TestA");
	    TestActionB("TestB");
	    
	    if (!calledA && !calledB) {
		done();
	    }
	});
    });	     
});




