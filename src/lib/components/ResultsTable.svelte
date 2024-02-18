<script>
	import { calculationResults } from '../stores.js'; // Assuming your data store's import path

	let data = [];
	calculationResults.subscribe((value) => {
		data = value;
	});
</script>

<div class="overflow-x-auto mt-6">
	<table class="min-w-full leading-normal">
		<thead>
			<tr>
				<th
					class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
				>
					Month Start
				</th>
				<th
					class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
				>
					USDBTC
				</th>
				<th
					class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
				>
					Median Household Monthly Expense
				</th>
				<th
					class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
				>
					USD Expenses (financed by BTC stack)
				</th>
				<th
					class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
				>
					BTC at Month End
				</th>
			</tr>
		</thead>
		<tbody>
			{#each data as row (row.monthStart)}
				<tr>
					<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
						<div class="flex items-center">
							<div class="ml-3">
								<p class="text-gray-900 whitespace-no-wrap">
									{row.monthStart}
								</p>
							</div>
						</div>
					</td>
					<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
						<p class="text-gray-900 whitespace-no-wrap">
							{row.usdBtc.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
						</p>
					</td>
					<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
						{#if row.medianHouseholdMonthlyExpense != null}
							<p class="text-gray-900 whitespace-no-wrap">
								{row.medianHouseholdMonthlyExpense.toLocaleString('en-US', {
									style: 'currency',
									currency: 'USD'
								})}
							</p>
						{:else}
							<p class="text-gray-900 whitespace-no-wrap">N/A</p>
						{/if}
					</td>
					<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
						{#if row.usdExpensesFinancedByBtcStack != null}
							<p class="text-gray-900 whitespace-no-wrap">
								{(row.usdExpensesFinancedByBtcStack * 100000000).toLocaleString()} satoshis
							</p>
						{:else}
							<p class="text-gray-900 whitespace-no-wrap">N/A</p>
						{/if}
					</td>
					<td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
						<p class="text-gray-900 whitespace-no-wrap">
							{row.btcAtMonthEnd.toFixed(2)}
						</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
