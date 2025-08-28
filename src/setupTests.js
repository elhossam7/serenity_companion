import '@testing-library/jest-dom'

// jsdom doesn't implement scrollIntoView; provide a harmless shim
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = function scrollIntoView() {};
}
