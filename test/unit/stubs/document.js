var HTMLElement;

HTMLElement = require('./HTMLElement');

document = {
	createElement : function () {
		return new HTMLElement();
	}
};

module.exports = document;