async function testJugantorAPI() {
    console.log('Testing Jugantor API...');

    // Test a few offsets
    for (let offset of [0, 10, 20]) {
        const url = `https://www.jugantor.com/ajax/load/latestnews/10/${offset}/0`;
        console.log(`Fetching ${url}...`);
        try {
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            const text = await res.text();
            console.log(`Length: ${text.length}`);
            console.log(`Preview: ${text.substring(0, 100)}...`);

            // Check if it contains article data
            try {
                const json = JSON.parse(text);
                console.log('JSON Response!');
                // Log structure if JSON
                console.log(JSON.stringify(json).substring(0, 200));
            } catch (e) {
                console.log('Response is HTML/Text');
            }
        } catch (e) {
            console.log('Error:', e);
        }
        console.log('---');
    }
}

testJugantorAPI();
