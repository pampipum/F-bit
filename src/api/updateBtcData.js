import axios from 'axios';
import fs from 'fs';
import cors from 'cors';

const API_KEY = '5a0547dd-225f-4f7b-94a9-0481ee591862';
const BITCOIN_ID = 1; // Bitcoin's ID on CoinMarketCap

async function fetchBitcoinPrice() {
	try {
		const response = await axios.get(
			`https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${BITCOIN_ID}`,
			{
				headers: {
					'X-CMC_PRO_API_KEY': API_KEY
				}
			}
		);

		const bitcoinData = response.data.data[BITCOIN_ID];
		const usdBtc = bitcoinData.quote.USD.price;

		return usdBtc;
	} catch (error) {
		console.error('Error fetching Bitcoin price:', error);
		return null;
	}
}

const corsMiddleware = cors({
	methods: ['POST']
});

function runMiddleware(req, res, fn) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result) => {
			if (result instanceof Error) {
				return reject(result);
			}
			return resolve(result);
		});
	});
}

export default async function handler(req, res) {
	await runMiddleware(req, res, corsMiddleware);

	if (req.method === 'POST') {
		const currentDate = new Date();
		const monthStart = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-01`;

		const usdBtc = await fetchBitcoinPrice();

		if (usdBtc !== null) {
			const newData = { monthStart, usdBtc };

			// Read the existing btcData from the file
			const fileContent = fs.readFileSync('src/lib/data/BTC-USD_converted.js', 'utf8');

			// Extract the btcData array from the file content
			const btcDataMatch = fileContent.match(/export\s+const\s+btcData\s*=\s*(\[[\s\S]*?\]);/);
			const btcDataString = btcDataMatch ? btcDataMatch[1] : null;

			if (btcDataString) {
				const btcData = JSON.parse(btcDataString);

				// Add the new data to the array
				btcData.push(newData);

				// Update the btcData array in the file content
				const updatedFileContent = fileContent.replace(
					/export\s+const\s+btcData\s*=\s*(\[[\s\S]*?\]);/,
					`export const btcData = ${JSON.stringify(btcData, null, 2)};`
				);

				// Write the updated content back to the file
				fs.writeFileSync('src/lib/data/BTC-USD_converted.js', updatedFileContent, 'utf8');

				res.status(200).json({ message: 'Bitcoin price data updated successfully.' });
			} else {
				res.status(500).json({ error: 'btcData array not found in the file.' });
			}
		} else {
			res.status(500).json({ error: 'Failed to fetch Bitcoin price.' });
		}
	} else {
		res.status(405).json({ error: 'Method not allowed.' });
	}
}
