<script lang="ts">
	import { formData } from '../stores.js';

	// Initial values
	let btcStart = 3;
	let retirementDate = '2029-01-01';
	let incomeAfterTaxes = 40000;
	let monthlyExpenses: any;

	// Reactive statement for monthly expenses calculation
	$: monthlyExpenses = incomeAfterTaxes / 12;

	// Reactive statements to update the store when values change
	$: formData.set({
		btcStart,
		retirementDate,
		incomeAfterTaxes,
		monthlyExpenses
	});
</script>

<div class="max-w-md mx-auto mt-10">
	<form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
		<div class="mb-4">
			<label for="btc-start" class="block text-gray-700 text-sm font-bold mb-2">BTC Start:</label>
			<input
				type="number"
				id="btc-start"
				min="0"
				bind:value={btcStart}
				class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			/>
		</div>

		<div class="mb-4">
			<label for="retirement-date" class="block text-gray-700 text-sm font-bold mb-2"
				>Retirement Date:</label
			>
			<input
				type="date"
				id="retirement-date"
				bind:value={retirementDate}
				class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			/>
		</div>

		<div class="mb-4">
			<label for="income-after-taxes" class="block text-gray-700 text-sm font-bold mb-2"
				>Income After Taxes(At retirement date) in USD:</label
			>
			<input
				type="number"
				id="income-after-taxes"
				min="0"
				bind:value={incomeAfterTaxes}
				class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
			/>
		</div>

		<div class="mb-6">
			<label for="monthly-expenses" class="block text-gray-700 text-sm font-bold mb-2">
				Monthly Expenses:</label
			>
			<input
				type="number"
				id="monthly-expenses"
				readonly
				value={monthlyExpenses.toFixed(2)}
				class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
			/>
		</div>
	</form>
</div>
