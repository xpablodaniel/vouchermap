import csv
from datetime import datetime

CSV_PATH = 'pruebas_regimen.csv'


def format_date(date_str):
    if not date_str:
        return ''
    parts = date_str.split('/')
    if len(parts) < 3:
        return date_str
    return f"{parts[2]}/{parts[1]}/{parts[0]}"


def calculate_stay_duration(din_raw, dout_raw):
    try:
        din_date = datetime.strptime(format_date(din_raw), '%Y/%m/%d')
        dout_date = datetime.strptime(format_date(dout_raw), '%Y/%m/%d')
        duration = round((dout_date - din_date).days)
        return duration
    except Exception:
        return 0


def process_data_from_text(text):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    relevant = []

    for i, line in enumerate(lines[1:], start=1):  # skip header
        fields = list(csv.reader([line]))[0]

        # Normalize passengerName to uppercase at assignment (mimic the JS change)
        # Combine name + surname if surname cell looks like a surname (avoid email)
        name_part = (fields[13] if len(fields) > 13 else '').strip()
        surname_part = (fields[14] if len(fields) > 14 else '').strip()
        include_surname = surname_part != '' and '@' not in surname_part and not any(ch.isdigit() for ch in surname_part)
        passenger_name = (name_part + ' ' + surname_part if include_surname else name_part).upper()

        services = (fields[16] if len(fields) > 16 else '')
        dni = fields[12] if len(fields) > 12 else ''
        hotel = fields[1] if len(fields) > 1 else ''
        din_raw = fields[8] if len(fields) > 8 else ''
        dout_raw = fields[9] if len(fields) > 9 else ''
        room = fields[2] if len(fields) > 2 else ''
        cantp = fields[5] if len(fields) > 5 else '0'
        stay_duration = calculate_stay_duration(din_raw, dout_raw)
        voucher = fields[6] if len(fields) > 6 else ''

        # Skip those with only DESAYUNO and not MEDIA PENSION
        if 'DESAYUNO' in services.upper() and 'MEDIA PENSION' not in services.upper():
            continue

        # Check accompaniment similar to JS function
        accompanied = any((r['roomNumber'] == room and r['voucher'] == voucher) for r in relevant)
        if accompanied:
            continue

        relevant.append({
            'passengerName': passenger_name,
            'dni': dni,
            'hotel': hotel,
            'dinRaw': din_raw,
            'doutRaw': dout_raw,
            'roomNumber': room,
            'cantp': cantp,
            'stayDuration': stay_duration,
            'voucher': voucher,
            'cenaCount': int(cantp) * stay_duration if cantp.isdigit() else 0
        })

    return relevant


if __name__ == '__main__':
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        txt = f.read()

    out = process_data_from_text(txt)
    print('Processed entries:', len(out))
    print('First 10 processed items:')
    for i, item in enumerate(out[:10]):
        print(i + 1, item)
