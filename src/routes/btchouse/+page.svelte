<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Button } from '$lib/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '$lib/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '$lib/components/ui/alert-dialog';
import { Scale } from 'lucide-svelte';
import { DateTime } from 'luxon';
import { Line } from 'svelte-chartjs';
import 'chartjs-adapter-date-fns';
import {
    Chart,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    LogarithmicScale,
    PointElement,
    CategoryScale,
    TimeScale
} from 'chart.js';

Chart.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    LogarithmicScale,
    PointElement,
    CategoryScale,
    TimeScale
);

// Default values and constants
const DEFAULT_VALUES = {
    mortgageRate: 3.5,
    rentCost: 2000,
    housePrice: 1000000,
    timeHorizon: 10,
    btcToSell: 5,
    houseAppreciationRate: 7,
    propertyTaxRate: 1.2,
};

const PERCENTAGES = {
    yearlyMaintenanceCost: 1, // 1% of house value per year
    yearlyInsuranceCost: 0.5, // 0.5% of house value per year

};

let mortgageRate = DEFAULT_VALUES.mortgageRate;
let rentCost = DEFAULT_VALUES.rentCost;
let housePrice = DEFAULT_VALUES.housePrice;
let timeHorizon = DEFAULT_VALUES.timeHorizon;
let btcToSell = DEFAULT_VALUES.btcToSell;
let houseAppreciationRate = DEFAULT_VALUES.houseAppreciationRate;
let propertyTaxRate = DEFAULT_VALUES.propertyTaxRate;

let showInstructions = false;

$: yearlyMaintenanceCost = (PERCENTAGES.yearlyMaintenanceCost / 100) * housePrice;
$: yearlyInsuranceCost = (PERCENTAGES.yearlyInsuranceCost / 100) * housePrice;
$: closingCosts = (PERCENTAGES.closingCosts / 100) * housePrice;
$: sellingCosts = (PERCENTAGES.sellingCosts / 100) * housePrice;

$: hodlResult = 0;
$: buyResult = 0;
$: breakEvenBtcGrowthRate = 0;
$: mortgageAmount = housePrice - (btcToSell * currentBtcPrice);
$: isMortgageNeeded = mortgageAmount > 0;
$: mortgagePayment = isMortgageNeeded
    ? (mortgageAmount * (mortgageRate / 100 / 12)) /
      (1 - Math.pow(1 + mortgageRate / 100 / 12, -timeHorizon * 12))
    : 0;

const POWER_LAW_CONSTANT = 10 ** -17;
const POWER_LAW_EXPONENT = 5.8;

$: btcPriceData = {};
$: comparisonData = {};
let errorMessage = '';
$: currentBtcPrice = 0;

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'year',
                displayFormats: {
                    year: 'yyyy'
                }
            },
            ticks: {
                maxRotation: 45,
                minRotation: 45,
                color: 'rgba(255, 255, 255, 0.8)'
            }
        },
        y: {
            type: 'logarithmic',
            ticks: {
                color: 'rgba(255, 255, 255, 0.8)'
            }
        }
    },
    plugins: {
        legend: {
            labels: {
                color: 'rgba(255, 255, 255, 0.8)'
            }
        }
    }
};

onMount(async () => {
    await generateBtcPriceData();
});

async function generateBtcPriceData() {
    const historicalData = await fetchBitcoinData();
    if (historicalData.length > 0) {
        currentBtcPrice = historicalData[historicalData.length - 1].y;
    } else {
        currentBtcPrice = 50000;
        errorMessage = 'Using default Bitcoin price due to data fetch error';
    }

    const lastHistoricalDate =
        historicalData.length > 0
            ? DateTime.fromJSDate(historicalData[historicalData.length - 1].x)
            : DateTime.now();

    const futureDates = Array.from({ length: 60 }, (_, i) =>
        lastHistoricalDate.plus({ months: i + 1 }).toJSDate()
    );

    const futureData = futureDates.map((date) => ({
        x: date,
        y: predictBtcPrice(DateTime.fromJSDate(date).diff(DateTime.now(), 'years').years)
    }));

    btcPriceData = {
        datasets: [
            {
                label: 'Historical BTC Price',
                data: historicalData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Predicted BTC Price',
                data: futureData,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    updateComparisonChart();
}

async function fetchBitcoinData() {
    try {
        const response = await fetch('https://api.coincap.io/v2/assets/bitcoin/history?interval=d1');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || !data.data || !Array.isArray(data.data)) {
            throw new Error('Unexpected API response format');
        }
        return data.data.map((item: any) => ({
            x: DateTime.fromMillis(item.time).toJSDate(),
            y: parseFloat(item.priceUsd)
        }));
    } catch (error) {
        console.error('Error fetching Bitcoin data:', error);
        errorMessage = `Failed to fetch Bitcoin data: ${error.message}`;
        return [];
    }
}

function openInstructions() {
    showInstructions = true;
}

function closeInstructions() {
    showInstructions = false;
}

$: {
    const totalMortgagePayments = mortgagePayment * 12 * timeHorizon;
    const totalMaintenanceCosts = yearlyMaintenanceCost * timeHorizon;
    const totalPropertyTaxes = (propertyTaxRate / 100) * housePrice * timeHorizon;
    const totalInsuranceCosts = yearlyInsuranceCost * timeHorizon;
    const appreciatedHouseValue = housePrice * Math.pow(1 + houseAppreciationRate / 100, timeHorizon);

    buyResult =
        appreciatedHouseValue -
        totalMortgagePayments -
        totalMaintenanceCosts -
        totalPropertyTaxes -
        totalInsuranceCosts;

    const futureHodlValue = btcToSell * predictBtcPrice(timeHorizon);
    hodlResult = futureHodlValue - rentCost * 12 * timeHorizon;

    const totalRentCost = rentCost * 12 * timeHorizon;
    const requiredFutureBtcValue = totalRentCost + buyResult;
    breakEvenBtcGrowthRate =
        Math.pow(requiredFutureBtcValue / (btcToSell * currentBtcPrice), 1 / timeHorizon) - 1;
}

function predictBtcPrice(yearsInFuture: number) {
    const startDate = DateTime.fromISO('2009-01-03');
    const futureDate = DateTime.now().plus({ years: yearsInFuture });
    const daysDiff = futureDate.diff(startDate, 'days').days;
    return POWER_LAW_CONSTANT * Math.pow(daysDiff, POWER_LAW_EXPONENT);
}

function updateComparisonChart() {
    const labels = Array.from({ length: timeHorizon }, (_, i) =>
        DateTime.now().plus({ years: i + 1 }).toJSDate()
    );
    
    const hodlData = labels.map((date, i) => ({
        x: date,
        y: btcToSell * predictBtcPrice(i + 1) - rentCost * 12 * (i + 1)
    }));
    
    const buyData = labels.map((date, i) => {
        const appreciatedHouseValue = housePrice * Math.pow(1 + houseAppreciationRate / 100, i + 1);
        const totalMortgagePayments = mortgagePayment * 12 * (i + 1);
        const totalMaintenanceCosts = yearlyMaintenanceCost * (i + 1);
        const totalPropertyTaxes = (propertyTaxRate / 100) * appreciatedHouseValue * (i + 1);
        const totalInsuranceCosts = yearlyInsuranceCost * (i + 1);
        
        return {
            x: date,
            y: appreciatedHouseValue - totalMortgagePayments - totalMaintenanceCosts - 
               totalPropertyTaxes - totalInsuranceCosts
        };
    });

    comparisonData = {
        datasets: [
            {
                label: 'HODL BTC + Rent',
                data: hodlData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Sell BTC + Buy House',
                data: buyData,
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };
}

$: {
    mortgageRate;
    rentCost;
    housePrice;
    timeHorizon;
    yearlyMaintenanceCost;
    houseAppreciationRate;
    propertyTaxRate;
    yearlyInsuranceCost;
    btcToSell;
    generateBtcPriceData();
}

function goToHomePage() {
    goto('/');
}

</script>

<svelte:head>
	<title>Bitcoin HODL vs Buy House Calculator | Powered by Power Law</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta property="og:title" content="Bitcoin HODL vs Buy House Calculator" />
	<meta
		property="og:description"
		content="Compare Bitcoin HODL returns with real estate investment. Price prediction uses Power Law: price = 10^-17 * days^5.8."
	/>
	<meta name="twitter:title" content="Bitcoin HODL vs Buy House Calculator" />
	<meta
		name="twitter:description"
		content="Compare Bitcoin HODL returns with real estate investment. Featuring Power Law price prediction."
	/>
</svelte:head>

<div class="bg-black text-white min-h-screen flex justify-center items-center">
    <div class="container mx-auto px-4 py-8">
        <Button on:click={goToHomePage} class="mb-4 bg-yellow-400 text-black hover:bg-yellow-500">
            Back to Home
        </Button>

        <Card class="w-full bg-black text-white">
            <CardHeader>
                <CardTitle class="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                    <Scale class="h-6 w-6 text-yellow-400" />
                    BTC HODL + Rent vs Sell BTC + Buy Calculator
                </CardTitle>
                <CardDescription class="text-white text-sm sm:text-base">
                    Compare holding Bitcoin and renting vs selling Bitcoin to buy a house. Powered by the Power
                    Law: Based on @Giovann35084111's power law equation: price = 10^-17 * days^5.8.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {#if currentBtcPrice}
                    <p class="mb-4 text-sm sm:text-base">
                        Current Bitcoin Price: ${currentBtcPrice.toLocaleString('en-US', {
                            maximumFractionDigits: 2
                        })}
                    </p>
                {/if}

                <div class="mb-8 space-y-8">
                    <div class="sm:grid sm:grid-cols-2 sm:gap-8">
                        <!-- Renting Inputs -->
                        <div class="rounded-lg border border-white p-4">
                            <h3 class="mb-4 text-lg sm:text-xl font-semibold text-yellow-400">Renting Inputs</h3>
                            <div class="space-y-4">
                                <div>
                                    <Label for="rentCost" class="text-white text-sm sm:text-base">Monthly Rent Cost ($)</Label>
                                    <Input
                                        type="number"
                                        id="rentCost"
                                        bind:value={rentCost}
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Buying House Inputs -->
                        <div class="rounded-lg border border-white p-4">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg sm:text-xl font-semibold text-yellow-400">Buying House Inputs</h3>
                                <Button on:click={openInstructions} variant="ghost" class="text-white hover:text-yellow-400">
                                    Instructions
                                </Button>
                            </div>
                            <div class="space-y-4">
                                <div>
                                    <Label for="housePrice" class="text-white text-sm sm:text-base">House Price ($)</Label>
                                    <Input
                                        type="number"
                                        id="housePrice"
                                        bind:value={housePrice}
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                                <div>
                                    <Label for="btcToSell" class="text-white text-sm sm:text-base">BTC to Sell</Label>
                                    <Input
                                        type="number"
                                        id="btcToSell"
                                        bind:value={btcToSell}
                                        step="0.01"
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                                {#if isMortgageNeeded}
                                    <div>
                                        <p class="text-yellow-400 mb-2 text-sm sm:text-base">
                                            A mortgage of ${mortgageAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })} is needed.
                                        </p>
                                        <Label for="mortgageRate" class="text-white text-sm sm:text-base">Mortgage Rate (%)</Label>
                                        <Input
                                            type="number"
                                            id="mortgageRate"
                                            bind:value={mortgageRate}
                                            step="0.1"
                                            class="border-white bg-black text-white w-full"
                                        />
                                    </div>
                                {/if}
                                <div>
                                    <Label for="yearlyMaintenanceCost" class="text-white text-sm sm:text-base">
                                        Yearly Maintenance Cost ($) (Default: 1% of house value)
                                    </Label>
                                    <Input
                                        type="number"
                                        id="yearlyMaintenanceCost"
                                        bind:value={yearlyMaintenanceCost}
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                                <div>
                                    <Label for="houseAppreciationRate" class="text-white text-sm sm:text-base">House Appreciation Rate (%)</Label>
                                    <Input
                                        type="number"
                                        id="houseAppreciationRate"
                                        bind:value={houseAppreciationRate}
                                        step="0.1"
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                                <div>
                                    <Label for="propertyTaxRate" class="text-white text-sm sm:text-base">Property Tax Rate (%)</Label>
                                    <Input
                                        type="number"
                                        id="propertyTaxRate"
                                        bind:value={propertyTaxRate}
                                        step="0.1"
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                                <div>
                                    <Label for="yearlyInsuranceCost" class="text-white text-sm sm:text-base">
                                        Yearly Insurance Cost ($) (Default: 0.5% of house value)
                                    </Label>
                                    <Input
                                        type="number"
                                        id="yearlyInsuranceCost"
                                        bind:value={yearlyInsuranceCost}
                                        class="border-white bg-black text-white w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Time Horizon Input -->
                    <div class="rounded-lg border border-white p-4">
                        <h3 class="mb-4 text-lg sm:text-xl font-semibold text-yellow-400">Common Inputs</h3>
                        <div>
                            <Label for="timeHorizon" class="text-white text-sm sm:text-base">Time Horizon (Years)</Label>
                            <Input
                                type="number"
                                id="timeHorizon"
                                bind:value={timeHorizon}
                                class="border-white bg-black text-white w-full"
                            />
                        </div>
                    </div>
                </div>

                {#if errorMessage}
                    <div class="mb-4 text-yellow-400 text-sm sm:text-base">{errorMessage}</div>
                {/if}

                <!-- Results Section -->
                <div class="mb-8 rounded-lg border border-white p-6">
                    <h3 class="mb-4 text-center text-xl sm:text-2xl font-semibold text-yellow-400">
                        Results (after {timeHorizon} years)
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                        <div class="text-center">
                            <p class="mb-2 text-base sm:text-lg font-medium">HODL BTC + Rent</p>
                            <p class="text-2xl sm:text-3xl font-bold text-white">
                                ${hodlResult.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div class="text-center">
                            <p class="mb-2 text-base sm:text-lg font-medium">Sell BTC + Buy House</p>
                            <p class="text-2xl sm:text-3xl font-bold text-white">
                                ${buyResult.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    <p class="mt-4 text-sm text-gray-300">
                        Note: Calculations do not include closing costs for buying (2% of house value) or selling costs (6% of house value, e.g., realtor fees). Consider these additional expenses when making your decision.
                    </p>
                </div>

                <!-- Break-even Analysis -->
                <div class="mb-8 rounded-lg border border-white p-6">
                    <h3 class="mb-4 text-center text-xl sm:text-2xl font-semibold text-yellow-400">Break-even Analysis</h3>
                    <p class="text-center text-sm sm:text-base">
                        HODL + Rent becomes more profitable if Bitcoin price increases by more than
                        <span class="font-bold text-yellow-400">{(breakEvenBtcGrowthRate * 100).toFixed(2)}%</span>
                        per year on average.
                    </p>
                </div>

                <!-- Investment Strategy Comparison -->
                <div class="mb-8">
                    <h3 class="mb-4 text-lg sm:text-xl font-semibold text-yellow-400">Investment Strategy Comparison</h3>
                    <div class="rounded-lg border border-white p-4" style="height: 400px;">
                        <Line data={comparisonData} options={chartOptions} />
                    </div>
                </div>

                <!-- Bitcoin Price History and Prediction -->
                <div class="mb-4">
                    <h3 class="mb-4 text-lg sm:text-xl font-semibold text-yellow-400">
                        Bitcoin Price History and Prediction
                    </h3>
                    <div class="rounded-lg border border-white p-4" style="height: 400px;">
                        <Line data={btcPriceData} options={chartOptions} />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
</div>

<AlertDialog open={showInstructions}>
	<AlertDialogContent class="bg-black text-white border border-white max-w-full sm:max-w-lg mx-4 sm:mx-auto">
		<AlertDialogHeader>
			<AlertDialogTitle class="text-yellow-400 text-lg sm:text-xl">How to Use This Calculator</AlertDialogTitle>
			<AlertDialogDescription class="text-sm sm:text-base">
				<p class="mb-4">This calculator compares two scenarios: HODLing Bitcoin while renting, and selling Bitcoin to buy a house.</p>
				
				<h4 class="text-yellow-400 font-semibold mb-2">Renting Inputs:</h4>
				<ul class="list-disc list-inside mb-4">
					<li>Enter your monthly rent cost.</li>
				</ul>

				<h4 class="text-yellow-400 font-semibold mb-2">Buying House Inputs:</h4>
				<ul class="list-disc list-inside mb-4">
					<li>Enter the house price you're considering.</li>
					<li>Enter the amount of BTC you're willing to sell for the house purchase.</li>
					<li>The mortgage amount is automatically calculated as the house price minus the BTC sold.</li>
					<li>Enter the current mortgage rate, yearly maintenance cost, house appreciation rate, property tax rate, and yearly insurance cost.</li>
				</ul>

				<h4 class="text-yellow-400 font-semibold mb-2">Common Inputs:</h4>
				<ul class="list-disc list-inside mb-4">
					<li>Set the time horizon (in years) for your comparison.</li>
				</ul>

				<p>The calculator will then show you the long-term financial outcomes of each decision, including a break-even analysis for Bitcoin price growth.</p>
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogAction on:click={closeInstructions}>Close</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>