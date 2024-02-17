import { onMount } from 'svelte';
import { formData, calculationResults } from '../stores.js';
import { DateTime } from 'luxon'; // Make sure to install the 'luxon' package

let data: any[];

// Subscription to formData store
const unsubscribe = formData.subscribe((values) => {
	// Perform calculations with the updated values
	data = generateData(values);

	// Update the calculationResults store with the new data
	calculationResults.set(data);
});

function generateData({
	btcStart,
	retirementDate,
	medianHouseholdIncome,
	incomeAfterTaxes,
	monthlyExpenses
}) {
	const genesis = DateTime.fromISO('2009-03-01');
	const retirement = DateTime.fromISO(retirementDate);
	const b = -33;
	const a = 5;
	const B = 1.29;
	const fiatPriceInflation = 0.06;
	const inflationMonthlyMultiplier = Math.pow(1 + fiatPriceInflation, 1 / 12);

	let results = [];
	let currentBtcStack = btcStart;
	let currentMonthlyExpenses = monthlyExpenses;

	for (let month = 0; month < 30 * 12; month++) {
		let monthDate = retirement.plus({ months: month });
		let xDays = monthDate.diff(genesis, 'days').days;
		let usdBtc = B * Math.pow(xDays, a) * Math.exp(b);
		currentMonthlyExpenses *= inflationMonthlyMultiplier;

		let btcExpenses = currentMonthlyExpenses / usdBtc;
		if (currentBtcStack > btcExpenses) {
			currentBtcStack -= btcExpenses;
		} else {
			currentBtcStack = 0;
		}

		results.push({
			monthStart: monthDate.toISODate(),
			xDays,
			usdBtc,
			medianHouseholdMonthlyExpense: currentMonthlyExpenses,
			usdExpensesFinancedByBtcStack: btcExpenses,
			btcAtMonthEnd: currentBtcStack
		});
	}

	console.log(results);
	return results;
}

onMount(() => {
	// Cleanup function to unsubscribe when component is destroyed
	return () => {
		console.log('Unsubscribing from formData');
		unsubscribe();
	};
});
