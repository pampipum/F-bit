<script lang="ts">
	import InputForm from '$lib/components/InputForm.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import Calculate from '$lib/components/Calculate.svelte';
	import BTCChart from '$lib/components/BTCChart.svelte';
	import BTCstack from '$lib/components/BTCstack.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Button } from '$lib/components/ui/button';
</script>

<!-- Hero and BTC Home Calculator Info sections -->
<div class="container mx-auto px-4 mt-8">
  <div class="flex flex-col lg:flex-row gap-8">
    <!-- Hero section -->
    <div class="lg:w-2/3">
      <Hero />
    </div>

    <!-- New BTC Home Calculator Info Section -->
    <div class="lg:w-1/3">
      <div class="bg-gray-910 rounded-lg p-6 text-white">
        <h2 class="text-2xl font-bold mb-4">New: BTC Home Calculator</h2>
        <p class="mb-4">
          Compare the long-term financial outcomes of HODLing Bitcoin while renting versus selling Bitcoin to buy a house. Our new calculator helps you make informed decisions about your Bitcoin and real estate investments.
        </p>
        <Button href="/btchouse" class="bg-yellow-400 text-black hover:bg-yellow-500">
          Try BTC Home Calculator
        </Button>
      </div>
    </div>
  </div>
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
