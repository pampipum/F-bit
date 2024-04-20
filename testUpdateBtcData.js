import axios from 'axios';

async function testUpdateBtcData() {
	try {
		const response = await axios.post('http://localhost:5173/api/updateBtcData');
		console.log(response.data);
	} catch (error) {
		console.error('Error testing updateBtcData:', error.response.data);
	}
}

testUpdateBtcData();
