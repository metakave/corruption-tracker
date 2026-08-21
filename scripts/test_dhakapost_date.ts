
const bnToEnDigits = (str: string) => str.replace(/[০-৯]/g, (d) => '0123456789'['০১২৩৪৫৬৭৮৯'.indexOf(d)]);

const monthMap: { [key: string]: string } = {
    'জানুয়ারি': 'January',
    'জানুয়ারি': 'January', // Variant
    'ফেব্রুয়ারি': 'February',
    'ফেব্রুয়ারি': 'February', // Variant
    'মার্চ': 'March', 'এপ্রিল': 'April',
    'মে': 'May', 'জুন': 'June', 'জুলাই': 'July', 'আগস্ট': 'August',
    'সেপ্টেম্বর': 'September', 'অক্টোবর': 'October', 'নভেম্বর': 'November', 'ডিসেম্বর': 'December'
};

const input = '২ জানুয়ারি ২০২৬, ১৯:৫৬'; // Copied from log

function testParse(rawTime: string) {
    console.log(`Testing: '${rawTime}'`);
    let cleanTime = rawTime.trim();

    // 1. Convert Digits
    cleanTime = bnToEnDigits(cleanTime);

    // 2. Month Names
    for (const [bn, en] of Object.entries(monthMap)) {
        cleanTime = cleanTime.replace(bn, en);
    }

    // 3. Remove commas
    cleanTime = cleanTime.replace(/,/g, '');
    console.log(`Final string: '${cleanTime}'`);

    const parsed = new Date(cleanTime);
    console.log(`Parsed Date: ${parsed}`);
    console.log(`Is Valid: ${!isNaN(parsed.getTime())}`);
}

testParse(input);
