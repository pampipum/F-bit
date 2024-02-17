<script lang="ts">
	import { onMount } from 'svelte';
	import { formData, calculationResults, retirementMessageStore } from '../stores.js';
	import { btcData } from '../data/BTC-USD_converted.js'; // Ensure this path is correct
	import { DateTime } from 'luxon';

	let data: any[];
	let retirementSufficiencyMessage = ''; // To store the retirement evaluation message

	// Subscription to formData store
	const unsubscribe = formData.subscribe((values) => {
		console.log('formData updated:', values);

		// Perform calculations with the updated values
		data = generateData(values);
		console.log('Generated data:', data);

		// Evaluate retirement sufficiency and generate message
		retirementSufficiencyMessage = evaluateRetirementSufficiency(
			data,
			values.retirementDate,
			values.monthlyExpenses
		);
		retirementMessageStore.set(retirementSufficiencyMessage);
		console.log(retirementSufficiencyMessage);

		// Update the calculationResults store with the new data
		calculationResults.set(data);
		console.log('calculationResults updated');
	});

	function generateData({ btcStart, retirementDate, incomeAfterTaxes, monthlyExpenses }) {
		const POWER_LAW_CONSTANT = 10 ** -17;
		const POWER_LAW_EXPONENT = 5.8;
		const genesisDate = DateTime.fromISO('2009-01-03'); // The genesis date of Bitcoin
		const startDate = DateTime.fromISO(btcData[0].monthStart); // Start from the first historical data entry
		const retirement = DateTime.fromISO(retirementDate);
		const endDate = genesisDate.plus({ years: 60 }); // 60 years after Bitcoin's genesis
		const fiatPriceInflation = 0.06;
		const inflationMonthlyMultiplier = Math.pow(1 + fiatPriceInflation, 1 / 12);

		let results = [];
		let currentBtcStack = btcStart;
		let currentMonthlyExpenses = monthlyExpenses;
		let isRetired = false; // To determine if retirement age has been reached

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
				let xDays = monthDate.diff(genesisDate, 'days').days;
				usdBtc = POWER_LAW_CONSTANT * Math.pow(xDays, POWER_LAW_EXPONENT);
			}

			if (monthDate >= retirement) {
				isRetired = true;
			}

			currentMonthlyExpenses *= inflationMonthlyMultiplier;

			let btcExpenses = isRetired ? currentMonthlyExpenses / usdBtc : 0;
			if (currentBtcStack > btcExpenses && isRetired) {
				currentBtcStack -= btcExpenses;
			} else if (isRetired) {
				btcExpenses = currentBtcStack;
				currentBtcStack = 0;
			}

			results.push({
				monthStart: monthDate.toISODate(),
				usdBtc,
				medianHouseholdMonthlyExpense: isRetired ? currentMonthlyExpenses : null,
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
