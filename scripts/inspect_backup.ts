import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('recovered_dev.db');

try {
    const count = db.prepare('SELECT count(*) as count FROM RawNewsArticle').get() as { count: number };
    console.log(`Found ${count.count} articles in backup.`);

    if (count.count > 0) {
        const rows = db.prepare('SELECT * FROM RawNewsArticle').all();
        fs.writeFileSync('restored_data.json', JSON.stringify(rows, null, 2));
        console.log(`Exported ${rows.length} rows to restored_data.json`);
    } else {
        console.log("Backup is empty.");
    }
} catch (e) {
    console.error("Error reading DB:", e);
}
