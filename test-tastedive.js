const axios = require('axios');

async function testTasteDiveAPI() {
  try {
    const TASTEDIVE_API_KEY = '1053032-library-1E6A48BC';
    const TASTEDIVE_BASE_URL = 'https://tastedive.com/api/similar';
    
    // Test with a popular book
    const params = new URLSearchParams({
      q: 'The Hobbit by J.R.R. Tolkien',
      type: 'books',
      limit: '5',
      k: TASTEDIVE_API_KEY
    });

    console.log('Testing TasteDive API...');
    console.log('URL:', `${TASTEDIVE_BASE_URL}?${params.toString()}`);

    const response = await axios.get(`${TASTEDIVE_BASE_URL}?${params.toString()}`);
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.Similar && response.data.Similar.Results) {
      console.log('\n✅ TasteDive API is working!');
      console.log(`Found ${response.data.Similar.Results.length} recommendations`);
      
      response.data.Similar.Results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.Name} (${result.Type})`);
      });
    } else {
      console.log('❌ No recommendations found in response');
    }
    
  } catch (error) {
    console.error('❌ Error testing TasteDive API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTasteDiveAPI(); 