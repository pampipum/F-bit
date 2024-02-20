// src/lib/stores.js
import { writable } from 'svelte/store';

function createFormData() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,
		set: (value) => {
			set(value);
		},
		update
	};
}

function createCalculationResults() {
	const { subscribe, set, update } = writable([]);
	return {
		subscribe,
		set: (value) => {
			set(value);
		},
		update
	};
}
function createretirementMessageStore() {
	const { subscribe, set, update } = writable([]);
	return {
		subscribe,
		set: (value) => {
			set(value);
		},
		update
	};
}

export const formData = createFormData();
export const calculationResults = createCalculationResults();
export const retirementMessageStore = createretirementMessageStore();
