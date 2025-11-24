const fs = require('fs');

// Copy of the relevant logic from map_scripts_new.js adapted for Node testing
function formatDate(dateString) {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length < 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function calculateStayDuration(dinRaw, doutRaw) {
    const dinDate = new Date(formatDate(dinRaw));
    const doutDate = new Date(formatDate(doutRaw));
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const duration = Math.round((doutDate - dinDate) / millisecondsPerDay);
    return duration;
}

function isPassengerAccompanied(relevantData, roomNumber, voucher) {
    for (let i = 0; i < relevantData.length; i++) {
        const item = relevantData[i];
        if (item.roomNumber === roomNumber && item.voucher === voucher) {
            return true;
        }
    }
    return false;
}

function processData(fileContents) {
    const lines = fileContents.split('\n');
    const relevantData = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === '') continue;
        const fields = line.split(',');

        // Apply same normalization for passengerName as in map_scripts_new.js
        const namePart = (fields[13] || '').trim();
        const surnamePart = (fields[14] || '').trim();
        const includeSurname = surnamePart !== '' && !surnamePart.includes('@') && !/\d/.test(surnamePart);
        const passengerName = (includeSurname ? (namePart + ' ' + surnamePart) : namePart).toUpperCase();
        const services = (fields[16] || '');
        const dni = fields[12];
        const hotel = fields[1];
        const dinRaw = fields[8];
        const doutRaw = fields[9];
        const din = formatDate(dinRaw);
        const dout = formatDate(doutRaw);
        const roomNumber = fields[2];
        const cantp = fields[5];
        const stayDuration = calculateStayDuration(dinRaw, doutRaw);
        const voucher = fields[6];

        // Skip those with only DESAYUNO and not MEDIA PENSION
        if (services.toUpperCase().includes('DESAYUNO') && !services.toUpperCase().includes('MEDIA PENSION')) {
            continue;
        }

        const isAccompanied = isPassengerAccompanied(relevantData, roomNumber, voucher);
        if (!isAccompanied) {
            const relevantFields = {
                passengerName,
                dni,
                hotel,
                din,
                dout,
                dinRaw,
                doutRaw,
                roomNumber,
                cantp,
                stayDuration,
                voucher,
                cenaCount: parseInt(cantp) * stayDuration
            };
            relevantData.push(relevantFields);
        }
    }

    return relevantData;
}

// Read the CSV and run processData
const csvPath = './pruebas_regimen.csv';
const contents = fs.readFileSync(csvPath, 'utf8');
const out = processData(contents);

console.log('Processed entries:', out.length);
console.log('First 5 processed items (passengerName should be uppercase):');
console.log(out.slice(0, 5));
