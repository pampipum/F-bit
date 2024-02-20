<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { calculationResults } from '../stores.js';

	let chart;

	onMount(() => {
		const ctx = document.getElementById('btcChart').getContext('2d');

		// Initialize chart with empty data structure
		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'USD/BTC',
						data: [],
						borderColor: 'white',
						yAxisID: 'y-axis-usd',
						borderWidth: 3, // Example: setting line thickness
						pointRadius: 1, // Removes the point marker
						pointHitRadius: 1 // Adjust if you want the points to be interactable
					},
					{
						label: 'BTC Stack',
						data: [],
						borderColor: 'yellow',
						borderWidth: 3, // Example: setting line thickness
						pointRadius: 1, // Removes the point marker
						pointHitRadius: 1, // Adjust if you want the points to be interactable
						yAxisID: 'y-axis-stack'
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					'y-axis-usd': {
						type: 'logarithmic',
						position: 'left',
						title: {
							display: true,
							text: 'USD/BTC'
						}
					},
					'y-axis-stack': {
						type: 'linear',
						position: 'right',
						title: {
							display: true,
							text: 'BTC Stack'
						},
						grid: {
							drawOnChartArea: false
						}
					}
				}
			}
		});

		// Subscribe to calculationResults and update chart data dynamically
		const unsubscribe = calculationResults.subscribe((results) => {
			if (results.length > 0) {
				chart.data.labels = results.map((d) => d.monthStart);
				chart.data.datasets[0].data = results.map((d) => d.usdBtc);
				chart.data.datasets[1].data = results.map((d) => d.btcAtMonthEnd);
				chart.update();
			}
		});

		return () => {
			if (chart) chart.destroy();
			unsubscribe();
		};
	});
</script>

<div class="w-full max-w-full h-auto">
	<canvas id="btcChart"></canvas>
</div>
