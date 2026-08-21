import csv
import json
import os
from datetime import datetime
import difflib

# Configuration
INPUT_FILE = '/Users/musfiqurtuhin/Documents/WorkSpace/political_violence_tracker/political_violence_analysis_VERIFIED.csv'
OUTPUT_DIR = '/Users/musfiqurtuhin/Documents/WorkSpace/political_violence_tracker/reports'
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'bnp_news.md')

# Helper for Bengali Digits and Months
def to_bengali_num(n):
    bn_digits = str(n).maketrans('0123456789', '০১২৩৪৫৬৭৮৯')
    return str(n).translate(bn_digits)

MONTH_MAP = {
    1: 'জানুয়ারি', 2: 'ফেব্রুয়ারি', 3: 'মার্চ', 4: 'এপ্রিল', 5: 'মে', 6: 'জুন',
    7: 'জুলাই', 8: 'আগস্ট', 9: 'সেপ্টেম্বর', 10: 'অক্টোবর', 11: 'নভেম্বর', 12: 'ডিসেম্বর'
}

def format_date_bn(date_str):
    try:
        dt = datetime.strptime(date_str, '%Y-%m-%d')
        day = to_bengali_num(dt.day)
        month = MONTH_MAP[dt.month]
        year = to_bengali_num(dt.year)
        return f"🟩 {day} {month} {year}"
    except ValueError:
        return f"🟩 {date_str}" # Fallback

def is_bnp_related(row):
    keywords = [
        "Bangladesh Nationalist Party", "BNP", "JCD", "Chhatra Dal", "Jatiyatabadi Chhatra Dal", "Juba Dal", 
        "Swechasebak Dal", "Sramik Dal", "Mohila Dal", "Krishak Dal",
        "বিএনপি", "ছাত্রদল", "জাতীয়তাবাদী ছাত্রদল", "যুবদল", "স্বেচ্ছাসেবক দল", "শ্রমিক দল", "মহিলা দল", "কৃষক দল"
    ]
    
    fields_to_check = ['Political Parties', 'Victim Parties', 'Perpetrator Parties']
    
    for field in fields_to_check:
        val = row.get(field, '')
        if not val:
            continue
        
        # Simple check for keyword existence in the string representation
        for kw in keywords:
            if kw.lower() in val.lower():
                return True
            
    return False

def translate_district(district):
    # Map common districts to Bengali if needed, or just leave as is if the CSV has english names
    # The user example has "কুড়িগ্রাম", "পঞ্চগড়". The CSV has "Meherpur", "Comilla".
    # I should try to map them or generic transliterate. 
    # For now, I will use a small mapping for common ones found in the file, or leave as English if unknown.
    # Actually, the CSV might have mixed Bengali/English in `District`? 
    # Let's check the CSV content again. Line 2: "Meherpur", Line 3: "নোয়াখালী", Line 4: "ঢাকা".
    # It is mixed. I will use the value as is, maybe simple mapping for known English ones.
    
    mapping = {
        "Meherpur": "মেহেরপুর",
        "Comilla": "কুমিল্লা",
        "Dhaka": "ঢাকা",
        "Gazipur": "গাজীপুর",
        "Chittagong": "চট্টগ্রাম",
        "Noakhali": "নোয়াখালী",
        "Jhalokati": "ঝালকাঠি",
        "Jessore": "যশোর",
        "Bogra": "বগুড়া",
        "Naogaon": "নওগাঁ",
        "Natore": "নাটোর",
        "Pabna": "পাবনা",
        "Sirajganj": "সিরাজগঞ্জ",
        "Chapainawabganj": "চাঁপাইনবাবগঞ্জ",
        "Joypurhat": "জয়পুরহাট",
        "Rajshahi": "রাজশাহী",
        "Dinajpur": "দিনাজপুর",
        "Gaibandha": "গাইবান্ধা",
        "Kurigram": "কুড়িগ্রাম",
        "Lalmonirhat": "লালমনিরহাট",
        "Nilphamari": "নীলফামারী",
        "Panchagarh": "পঞ্চগড়",
        "Rangpur": "রংপুর",
        "Thakurgaon": "ঠাকুরগাঁও",
        "Brahmanbaria": "ব্রাহ্মণবাড়িয়া",
        "Chandpur": "চাঁদপুর",
        "Feni": "ফেনী",
        "Khagrachhari": "খাগড়াছড়ি",
        "Lakshmipur": "লক্ষ্মীপুর",
        "Bandarban": "বান্দরবান",
        "Cox's Bazar": "কক্সবাজার",
        "Rangamati": "রাঙ্গামাটি",
        "Habiganj": "হবিগঞ্জ",
        "Moulvibazar": "মৌলভীবাজার",
        "Sunamganj": "সুনামগঞ্জ",
        "Sylhet": "সিলেট",
        "Bagerhat": "বাগেরহাট",
        "Chuadanga": "চুয়াডাঙ্গা",
        "Jhenaidah": "ঝিনাইদহ",
        "Khulna": "খুলনা",
        "Kushtia": "কুষ্টিয়া",
        "Magura": "মাগুরা",
        "Narail": "নড়াইল",
        "Satkhira": "সাতক্ষীরা",
        "Faridpur": "ফরিদ্পুর",
        "Gopalganj": "গোপালগঞ্জ",
        "Kishoreganj": "কিশোরগঞ্জ",
        "Madaripur": "মাদারীপুর",
        "Manikganj": "মানিকগঞ্জ",
        "Munshiganj": "মুন্সীগঞ্জ",
        "Narayanganj": "নারায়ণগঞ্জ",
        "Narsingdi": "নরসিংদী",
        "Rajbari": "রাজবাড়ী",
        "Shariatpur": "শরীয়তপুর",
        "Tangail": "টাঙ্গাইল",
        "Barisal": "বরিশাল",
        "Barishal": "বরিশাল",
        "Bhola": "ভোলা",
        "Borguna": "বরগুনা",
        "Barguna": "বরগুনা",
        "Pirojpur": "পিরোজপুর",
        "Patuakhali": "পটুয়াখালী",
        "Jhalokathi": "ঝালকাঠি",
        "Jamalpur": "জামালপুর",
        "Mymensingh": "ময়মনসিংহ",
        "Netrekona": "নেত্রকোণা",
        "Sherpur": "শেরপুর",
        "Unknown": "অজানা"
    }
    
    return mapping.get(district, district)

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: Input file not found at {INPUT_FILE}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    rows = []
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            date_str = row.get('Date of Incident', '')
            # Filter for date range: 2026-01-01 to 2026-01-31
            if not date_str or not (date_str >= '2026-01-01' and date_str <= '2026-01-31'):
                continue

            if is_bnp_related(row):
                rows.append(row)
    
    # Sort by date descending
    rows.sort(key=lambda x: x.get('Date of Incident', ''), reverse=True)
    
    # Group by date
    grouped = {}
    for row in rows:
        date = row.get('Date of Incident')
        if not date: continue
        if date not in grouped:
            grouped[date] = []
        grouped[date].append(row)
    
    # Generate Markdown
    lines = []
    
    # Sort dates descending
    sorted_dates = sorted(grouped.keys(), reverse=True)
    
    # Sort dates descending
    sorted_dates = sorted(grouped.keys(), reverse=True)
    
    global_counter = 1
    
    for date in sorted_dates:
        bn_date_str = format_date_bn(date)
        lines.append(f"{bn_date_str}\n")
        
        daily_incidents = grouped[date]
        
        # Deduplication Logic
        # 1. Sort by title length descending (to keep detailed ones)
        daily_incidents.sort(key=lambda x: len(x.get('Title', '')), reverse=True)
        
        unique_incidents = []
        for incident in daily_incidents:
            is_dup = False
            title = incident.get('Title', '')
            killed = incident.get('Killed', '0')
            
            for kept in unique_incidents:
                kept_title = kept.get('Title', '')
                kept_killed = kept.get('Killed', '0')
                
                # Check 1: Killed count must be same (strict)
                if killed != kept_killed:
                    continue
                
                # Check 2: Title similarity
                ratio = difflib.SequenceMatcher(None, title, kept_title).ratio()
                if ratio > 0.5: # Threshold based on analysis
                    is_dup = True
                    break
            
            if not is_dup:
                unique_incidents.append(incident)
        
        # Sort back by original order? Or just keep sorted by length? 
        # User didn't specify order within date. Length sort is fine. 
        # Actually maybe sort by district? But list provided was by ID?
        # Let's just process the unique ones.
        
        for item in unique_incidents:
            bn_idx = to_bengali_num(global_counter)
            global_counter += 1
            
            raw_district = item.get('District')
            
            raw_district = item.get('District')
            if not raw_district:
                raw_district = "Unknown"
            
            district = translate_district(raw_district)
            title = item.get('Title', '')
            killed = to_bengali_num(item.get('Killed', '0'))
            injured = to_bengali_num(item.get('Injured', '0'))
            
            # Remove trailing periods from title to avoid double punctuation
            if title.endswith('।') or title.endswith('.'):
                title = title[:-1]
                
            line = f"{bn_idx}) {district}: {title}। [নিহত: {killed}, আহত: {injured}]"
            lines.append(line)
        
        lines.append("") # Empty line between dates

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    
    print(f"Report generated at {OUTPUT_FILE}")
    print(f"Total incidents found: {len(rows)}")

if __name__ == "__main__":
    main()
