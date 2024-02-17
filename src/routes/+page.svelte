<script lang="ts">
	import InputForm from '$lib/components/InputForm.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import Calculate from '$lib/components/Calculate.svelte';
	import BTCChart from '$lib/components/BTCChart.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<!-- Hero section -->
<div class="container mx-auto">
	<Hero />
</div>

<!-- Main content container -->
<div class="container mx-auto flex flex-col md:flex-row justify-center items-center mt-8">
	<div class="md:w-1/3 w-full">
		<div class="space-y-5">
			<div class="flex justify-center">
				<InputForm />
			</div>
		</div>
	</div>
	<div class="md:w-2/3 w-full">
		<div class="flex justify-center md:flex-row flex-col">
			<BTCChart />
			<Calculate />
		</div>
	</div>
</div>
<div class="mb-10"></div>
<Footer />
