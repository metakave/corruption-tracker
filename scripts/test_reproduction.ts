import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { analyzeWithAI } from '../lib/ai-analysis';

async function test() {
    console.log("Environment loaded. API Key present:", !!process.env.GEMINI_API_KEY_1);

    const title = "বিপিএলের আজকের দুই ম্যাচ কখন, নতুন টিকিট কি লাগবে";
    const url = "https://www.prothomalo.com/sports/cricket/bpl-2025-ticket-update";
    const publishedAt = "2025-12-31";

    const content = `
    আজ ৩১শে ডিসেম্বর, ২০২৫ তারিখে বাংলাদেশ প্রিমিয়ার লিগের (বিপিএল) কোনো ম্যাচ অনুষ্ঠিত হচ্ছে না।
    গত ৩০শে ডিসেম্বর, দুটি ম্যাচ স্থগিত করা হয়েছিল সাবেক প্রধানমন্ত্রী খালেদা জিয়ার মৃত্যুতে রাষ্ট্রীয় শোকের কারণে।
    সিলেট আন্তর্জাতিক ক্রিকেট স্টেডিয়ামে দর্শকদের ভিড় সামলাতে পুলিশ মোতায়েন করা হয়েছে।
    দর্শকেরা টিকেটের জন্য হাহাকার করছেন। টিকিট কালোবাজারি ঠেকাতে আইন শৃঙ্খলা বাহিনী তৎপর।
    বিপিএলের আজকের দুই ম্যাচ কখন, নতুন টিকিট কি লাগবে - এ নিয়ে দর্শকদের মধ্যে উত্তেজনা বিরাজ করছে।
    `;

    console.log("Testing AI Analysis for False Positive: BPL Match...\n");
    const result = await analyzeWithAI(content, title, url, publishedAt);

    console.log("\n--- Result ---");
    console.log(JSON.stringify(result, null, 2));
}

test();
