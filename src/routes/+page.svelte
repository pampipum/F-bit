<script lang="ts">
	import InputForm from '$lib/components/InputForm.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import Calculate from '$lib/components/Calculate.svelte';
	import BTCChart from '$lib/components/BTCChart.svelte';
</script>

<div class="container mx-auto flex flex-col md:flex-row justify-center items-center">
	<div class="md:w-1/3 w-full">
		<div class="space-y-5">
			<h1 class="text-xl font-bold">Let's get cracking bones!</h1>
			<div class="flex justify-center">
				<InputForm />
			</div>
		</div>
	</div>
	<div class="md:w-2/3 w-full">
		<div class="flex justify-center">
			<BTCChart />
		</div>
	</div>
</div>
