<script lang="ts">
	import { onMount } from 'svelte';
	import { formData, calculationResults, retirementMessageStore } from '../stores.js';
	import { btcData } from '../data/BTC-USD_converted.js'; // Ensure this path is correct
	import { DateTime } from 'luxon';

	let data: any[];
	let retirementSufficiencyMessage = ''; // To store the retirement evaluation message

	// Subscription to formData store
	const unsubscribe = formData.subscribe((values) => {
		// Perform calculations with the updated values
		data = generateData(values);

		// Evaluate retirement sufficiency and generate message
		retirementSufficiencyMessage = evaluateRetirementSufficiency(
			data,
			values.retirementDate,
			values.monthlyExpenses
		);
		retirementMessageStore.set(retirementSufficiencyMessage);

		// Update the calculationResults store with the new data
		calculationResults.set(data);
	});

	function generateData({
		btcStart,
		retirementDate,
		incomeAfterTaxes,
		monthlyExpenses,
		inflationRate
	}) {
		const POWER_LAW_CONSTANT = 10 ** -17;
		const POWER_LAW_EXPONENT = 5.8;
		// Convert annual inflation rate to a monthly multiplier
		const inflationMonthlyMultiplier = Math.pow(1 + inflationRate / 100, 1 / 12);

		// System's current date as the starting point for inflation calculations
		const currentDate = DateTime.now();
		const retirement = DateTime.fromISO(retirementDate);

		// Ensure the path to btcData is correct and accessible here
		const startDate = DateTime.fromISO(btcData[0].monthStart);
		const endDate = currentDate.plus({ years: 60 }); // Assuming a 60-year span from today for BTC data generation
		let currentMonthlyExpenses = incomeAfterTaxes / 12; // Initial monthly expenses based on today's input

		let results = [];
		let currentBtcStack = btcStart;
		let isRetired = false;

		// Determine the number of months from current date to retirement for inflation adjustment
		const monthsUntilRetirement = currentDate.until(retirement).length('months');

		// Adjust initial monthly expenses to the month of retirement using the inflation rate
		let adjustedMonthlyExpenses =
			currentMonthlyExpenses * Math.pow(inflationMonthlyMultiplier, monthsUntilRetirement);

		for (
			let monthDate = startDate;
			monthDate <= endDate;
			monthDate = monthDate.plus({ months: 1 })
		) {
			let formattedMonthStart = monthDate.toFormat('yyyy-MM-dd');
			let historicalData = btcData.find((d) => d.monthStart === formattedMonthStart);
			let usdBtc;

			if (historicalData) {
				usdBtc = historicalData.usdBtc;
			} else {
				// Assuming the POWER_LAW_CONSTANT and POWER_LAW_EXPONENT are defined for predictive BTC pricing
				let xDays = monthDate.diff(DateTime.fromISO('2009-01-03'), 'days').days;
				usdBtc = POWER_LAW_CONSTANT * Math.pow(xDays, POWER_LAW_EXPONENT);
			}

			if (monthDate >= retirement) {
				isRetired = true;
				// Adjust monthly expenses for each month after retirement
				adjustedMonthlyExpenses *= inflationMonthlyMultiplier;
			}

			let btcExpenses = isRetired ? adjustedMonthlyExpenses / usdBtc : 0;
			if (currentBtcStack > btcExpenses && isRetired) {
				currentBtcStack -= btcExpenses;
			} else if (isRetired) {
				btcExpenses = currentBtcStack;
				currentBtcStack = 0;
			}

			results.push({
				monthStart: monthDate.toISODate(),
				usdBtc,
				medianHouseholdMonthlyExpense: isRetired ? adjustedMonthlyExpenses : null,
				usdExpensesFinancedByBtcStack: isRetired ? btcExpenses : null,
				btcAtMonthEnd: currentBtcStack
			});
		}

		return results;
	}

	function evaluateRetirementSufficiency(data, retirementDate, initialMonthlyExpenses) {
		const retirement = DateTime.fromISO(retirementDate);
		let totalMonthsCovered = 0;
		let wasRetired = false;
		for (let entry of data) {
			let monthDate = DateTime.fromISO(entry.monthStart);
			if (monthDate >= retirement) {
				wasRetired = true;
				if (entry.btcAtMonthEnd > 0) {
					totalMonthsCovered++;
				} else {
					break; // Stop counting once the BTC stack is depleted
				}
			}
		}

		const totalYearsCovered = totalMonthsCovered / 12;
		if (!wasRetired || totalYearsCovered >= 30) {
			return 'The BTC stack is enough to retire on the chosen date.';
		} else {
			let shortfall = 30 - totalYearsCovered;
			return `The BTC stack is not enough to retire on the chosen date (short by approximately ${shortfall.toFixed(2)} years).`;
		}
	}

	onMount(() => {
		return () => {
			unsubscribe();
		};
	});
</script>
