<script lang="ts">
	import InputForm from '$lib/components/InputForm.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import Calculate from '$lib/components/Calculate.svelte';
	import BTCChart from '$lib/components/BTCChart.svelte';
	import BTCstack from '$lib/components/BTCstack.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
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
<div class=" mb-10 px-4">
	<BTCstack />
	<Accordion.Root class="w-full sm:max-w-[70%]">
		<Accordion.Item value="item-1">
			<Accordion.Trigger>Table with data!</Accordion.Trigger>
			<Accordion.Content>
				<ResultsTable />
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</div>
<Footer />
