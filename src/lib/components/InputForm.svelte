<script lang="ts">
	import { formData } from '../stores.js';
	import { Badge } from '$lib/components/ui/badge';
	import { retirementMessageStore } from '$lib/stores.js';
	import * as Alert from '$lib/components/ui/alert';
	import * as Accordion from '$lib/components/ui/accordion';

	let btcStart = 3;
	let retirementDate = '2029-01-01';
	let incomeAfterTaxes = 40000;
	let inflationRate = 6; // Initial inflation rate value
	let monthlyExpenses: any;

	$: monthlyExpenses = incomeAfterTaxes / 12;

	// Reactive statement to update the store when values change
	$: formData.set({
		btcStart,
		retirementDate,
		incomeAfterTaxes,
		monthlyExpenses,
		inflationRate // Add the inflation rate to the formData store
	});
</script>

<div class="max-w-md mx-auto mt-10">
	<form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
		<div class="mb-4">
			<label for="btc-start" class="block text-gray-700 text-sm font-bold mb-2"
				>BTC Stack at the beggining of retirement:</label
			>
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
				>Present Yearly Spending After Taxes- (USD):</label
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
				Monthly Expenses (calculated):</label
			>
			<input
				type="number"
				id="monthly-expenses"
				readonly
				value={monthlyExpenses.toFixed(2)}
				class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
			/>
			<Accordion.Root class="w-full sm:max-w-[70%]">
				<Accordion.Item value="item-1">
					<Accordion.Trigger class="text-black">Change yearly inflation!</Accordion.Trigger>
					<Accordion.Content>
						<div class="mt-4">
							<label for="inflation-rate" class="block text-gray-700 text-sm font-bold mb-2">
								Annual Inflation Rate (%):
							</label>
							<input
								type="number"
								id="inflation-rate"
								min="0"
								step="0.1"
								bind:value={inflationRate}
								class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
							/>
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>
			<Alert.Root>
				<Alert.Title>Info!</Alert.Title>
				<Alert.Description>{$retirementMessageStore}</Alert.Description>
			</Alert.Root>
		</div>
	</form>
</div>
