import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers (e.g., toBeInTheDocument)
expect.extend(matchers);

// jsdom doesn't implement scrollIntoView; provide a harmless shim
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = function scrollIntoView() {};
}

// Ensure a basic localStorage exists in non-browser test runs
if (typeof globalThis !== 'undefined' && typeof globalThis.localStorage === 'undefined') {
	const store = new Map();
	const mockStorage = {
		getItem: (key) => (store.has(key) ? store.get(key) : null),
		setItem: (key, value) => { store.set(String(key), String(value)); },
		removeItem: (key) => { store.delete(String(key)); },
		clear: () => { store.clear(); },
		key: (i) => Array.from(store.keys())[i] ?? null,
		get length() { return store.size; },
	};
	Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, configurable: true });
	if (typeof window !== 'undefined') {
		Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true });
	}
}
