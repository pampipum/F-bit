<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import { calculationResults, formData } from '../stores.js';

	let chart;
	let retirementDate;

	// Subscribe to formData to get the retirement date
	const unsubscribeFormData = formData.subscribe((values) => {
		retirementDate = values.retirementDate;
	});

	onMount(() => {
		const ctx = document.getElementById('btcStackChart').getContext('2d');

		const gradient = ctx.createLinearGradient(0, 0, 0, 400);
		gradient.addColorStop(0, 'rgba(255, 159, 64, 0.2)');
		gradient.addColorStop(1, 'rgba(255, 99, 132, 0.2)');

		chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'BTC Stack',
						data: [],
						backgroundColor: gradient,
						borderColor: 'rgba(255, 159, 64, 1)',
						borderWidth: 3,
						pointRadius: 2,
						pointHitRadius: 10,
						tension: 0.4 // Smooths the line
					}
				]
			},
			options: {
				responsive: true,

				plugins: {
					legend: {
						display: true, // Toggle to hide/show the legend
						position: 'top' // Position of the legend
					},
					tooltip: {
						enabled: true // Enable/disable tooltips
					}
				},
				scales: {
					'y-axis-stack': {
						type: 'linear',
						position: 'left',
						title: {
							display: true,
							text: 'BTC Stack'
						},
						grid: {
							drawOnChartArea: true
						}
					}
				}
			}
		});

		// Now also subscribe to calculationResults to update chart data
		const unsubscribeCalculationResults = calculationResults.subscribe((results) => {
			if (results.length > 0 && retirementDate) {
				// Filter results to start from the selected retirement date onwards
				const filteredResults = results.filter((d) => d.monthStart >= retirementDate);
				chart.data.labels = filteredResults.map((d) => d.monthStart.split('T')[0]); // Assuming ISO date format, keep only the date part
				chart.data.datasets[0].data = filteredResults.map((d) => d.btcAtMonthEnd);
				chart.update();
			}
		});

		return () => {
			unsubscribeFormData();
			unsubscribeCalculationResults();
			if (chart) chart.destroy();
		};
	});
</script>

<canvas id="btcStackChart"></canvas>
