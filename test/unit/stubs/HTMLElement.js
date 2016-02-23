DOMTokenList = require('./DOMTokenList');
EventTarget = require('./EventTarget');

HTMLElement = function HTMLElement() {
	EventTarget.apply(this, arguments);
	this.style = {};
	this.classList = new DOMTokenList();
	this.appendChild = function () {
	};
};
HTMLElement.prototype = Object.create(EventTarget.prototype);

module.exports = HTMLElement;