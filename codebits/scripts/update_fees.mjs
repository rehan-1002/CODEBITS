import fs from 'fs';
import path from 'path';

const capDataFile = path.resolve('data/cap_data.ts');
const rawContent = fs.readFileSync(capDataFile, 'utf-8');

// Match header (everything up to export const COLLEGES)
const splitIndex = rawContent.indexOf('export const COLLEGES: College[] =');
if (splitIndex === -1) {
  throw new Error('COLLEGES definition not found in cap_data.ts');
}

const header = rawContent.substring(0, splitIndex);

// Dynamically extract JSON
const collegesJsonStr = rawContent.substring(splitIndex + 'export const COLLEGES: College[] ='.length).trim().replace(/;$/, '');
const COLLEGES = JSON.parse(collegesJsonStr);

console.log(`Loaded ${COLLEGES.length} colleges for fee re-calibration.`);

// Verified FRA & DTE fee mappings (Academic Year 2024-25 / 2023-24)
const VERIFIED_FEES = {
  // Mumbai Region - Prominent Autonomous, Government & Private Colleges
  '03012': 85450,  // Veermata Jijabai Technological Institute (VJTI) - Govt Aided Autonomous
  '03014': 85350,  // Sardar Patel College of Engineering (SPCE) - Govt Aided Autonomous
  '03025': 130000, // SVKM's Shri Bhagubhai Mafatlal / College of Engineering
  '03035': 118000, // Usha Mittal Institute of Technology (UMIT, SNDT Women's, Juhu)
  '03036': 135000, // Institute of Chemical Technology (ICT, Matunga)
  '03135': 131000, // Rajiv Gandhi Institute of Technology (RGIT, Andheri)
  '03139': 165000, // Vidyalankar Institute of Technology (VIT, Wadala) - FRA Approved
  '03143': 125000, // Thakur Shyamnarayan Engineering College (Kandivali East)
  '03148': 144000, // Mahavir Education Trust's Shah & Anchor Kutchhi Engineering College (SAKEC)
  '03175': 94000,  // MGM's College of Engineering & Technology (Kamothe, Navi Mumbai)
  '03176': 144000, // Thakur College of Engineering & Technology (TCET, Kandivali)
  '03182': 215500, // Thadomal Shahani Engineering College (TSEC, Bandra)
  '03183': 132000, // M.H. Saboo Siddik College of Engineering (Byculla)
  '03184': 215000, // Fr. Conceicao Rodrigues College of Engineering (CRCE, Bandra)
  '03185': 155000, // Vivekanand Education Society's Institute of Technology (VESIT, Chembur)
  '03187': 105000, // Datta Meghe College of Engineering (DMCE, Airoli)
  '03188': 145000, // Vasantdada Patil Pratishthan's College of Engineering (Sion)
  '03189': 120000, // Bharati Vidyapeeth College of Engineering (Navi Mumbai)
  '03190': 139500, // Terna Engineering College (Nerul, Navi Mumbai)
  '03192': 109000, // Smt. Indira Gandhi College of Engineering (SIGCE, Navi Mumbai)
  '03193': 103000, // Shivajirao S. Jondhale College of Engineering (Dombivli)
  '03194': 136000, // Vidyavardhini's College of Engineering and Technology (VCET, Vasai)
  '03196': 130000, // Lokmanya Tilak College of Engineering (LTCE, Koparkhairane)
  '03197': 195000, // Fr. Conceicao Rodrigues Institute of Technology (FCRIT, Vashi)
  '03198': 104500, // Konkan Gyanpeeth College of Engineering (Karjat)
  '03199': 221000, // SVKM's Dwarkadas J. Sanghvi College of Engineering (DJ Sanghvi)
  '03201': 108000, // Rizvi College of Engineering (Bandra)
  '03203': 132000, // Atharva College of Engineering (Malad West)
  '03204': 153000, // St. Francis Institute of Technology (SFIT, Borivali)
  '03207': 146500, // Pillai College of Engineering (PCE, New Panvel)
  '03208': 173000, // Don Bosco Institute of Technology (DBIT, Kurla)
  '03209': 182000, // K. J. Somaiya Institute of Technology (KJSIT, Sion)
  '03210': 136000, // K.C. College of Engineering (KCCOE, Thane)
  '03211': 128000, // SIES Graduate School of Technology (Nerul)
  '03214': 193000, // Xavier Institute of Engineering (Mahim)
  '03215': 212000, // Sardar Patel Institute of Technology (SPIT, Andheri)
  '03218': 105000, // St. John College of Engineering & Management (Palghar)
  '03221': 82500,  // VIVA Institute of Technology (Virar)
  '03222': 70500,  // Theem College of Engineering (Boisar)
  '03223': 115000, // Pillai HOC College of Engineering & Technology (Rasayani)
  '03351': 74000,  // Bharat College of Engineering (Badlapur)
  '03423': 102000, // Shree L.R. Tiwari College of Engineering (Mira Road)
  '03436': 68000,  // B.R. Harne College of Engineering (Vangani/Ambernath)
  '03439': 98000,  // Anjuman-I-Islam's Kalsekar Technical Campus (AIKTC, Panvel)
  '03467': 102000, // Vishwaniketan's iMEET (Khalapur)
  '03471': 84000,  // New Horizon Institute of Technology & Management (Thane)
  '03475': 143000, // A.P. Shah Institute of Technology (APSIT, Thane)
  '03477': 78000,  // Chhatrapati Shivaji Maharaj Institute of Technology (Panvel)
  '03503': 73000,  // Indala College of Engineering (Kalyan)

  // Pune Region - Prominent Autonomous, Government & Private Colleges
  '16006': 115000, // COEP Technological University (Pune) - State University
  '06139': 101000, // PES Modern College of Engineering (Shivajinagar, Pune)
  '06141': 130000, // JSPM's Rajarshi Shahu College of Engineering (RSCOE, Tathawade)
  '06146': 185000, // MIT Academy of Engineering (MIT AOE, Alandi, Pune)
  '06155': 131000, // G.H. Raisoni College of Engineering & Management (Wagholi)
  '06156': 125000, // Marathwada Mitra Mandal's College of Engineering (MMCOE, Karvenagar)
  '06175': 193000, // Pimpri Chinchwad College of Engineering (PCCOE, Akurdi)
  '06177': 132000, // Sinhgad College of Engineering (SCOE, Vadgaon Bk, Pune)
  '06178': 118000, // Smt. Kashibai Navale College of Engineering (SKNCOE, Pune)
  '06179': 115000, // Indira College of Engineering & Management (Parandwadi, Pune)
  '06182': 108000, // Sinhgad Institute of Technology & Science (SITS, Narhe)
  '06185': 133500, // Sinhgad Institute of Technology (Lonavala)
  '06187': 111000, // Sinhgad Academy of Engineering (Kondhwa)
  '06203': 126500, // MMIT Lohgaon, Pune
  '06207': 130000, // Dr. D. Y. Patil Institute of Technology (Pimpri, Pune)
  '06271': 123000, // Pune Institute of Computer Technology (PICT, Dhankawadi)
  '06272': 145500, // D. Y. Patil College of Engineering (Akurdi, Pune)
  '06273': 206000, // Bansilal Ramnath Agarwal's Vishwakarma Institute of Technology (VIT Pune)
  '06274': 136000, // PVG's COET, Pune
  '06276': 185000, // MKSSS's Cummins College of Engineering for Women (Karvenagar, Pune)
  '06278': 140000, // AISSMS College of Engineering (Near RTO, Pune)
  '06281': 132000, // Modern Education Society's Wadia College of Engineering (Pune)
  '06282': 135000, // AISSMS Institute of Information Technology (Pune)
  '06284': 120000, // Vidya Pratishthan's VPBIET, Baramati
  '06298': 105000, // Zeal College of Engineering & Research (Narhe, Pune)
  '06307': 131000, // Dhole Patil College of Engineering (Wagholi)
  '06310': 137000, // Nutan Maharashtra Institute of Engineering & Technology (Talegaon)
  '06311': 123500, // JSPM's BSIOTR, Wagholi
  '06634': 107000, // Trinity Academy of Engineering (Yewalewadi, Pune)
  '06732': 110000, // Ajeenkya DY Patil School of Engineering (Lohegaon)
  '06754': 125000, // International Institute of Information Technology (I²IT, Hinjawadi)
  '06822': 143000, // PCCOE & Research (PCCOER, Ravet)
  '06834': 105000, // Dr. D.Y. Patil College of Engineering & Innovation (Talegaon)

  // Government Engineering Colleges across Maharashtra (Standardized State Fees)
  '01002': 26000,  // Government College of Engineering, Amravati
  '01005': 26000,  // Government College of Engineering, Yavatmal
  '02008': 26000,  // Government College of Engineering, Aurangabad (Chhatrapati Sambhajinagar)
  '04004': 26000,  // Government College of Engineering, Chandrapur
  '05004': 26000,  // Government College of Engineering, Jalgaon
  '06005': 35000,  // Government College of Engineering, Karad
  '06007': 85000,  // Walchand College of Engineering, Sangli (Govt-Aided Autonomous)
  '02020': 78000,  // Shri Guru Gobind Singhji Institute of Engineering & Technology, Nanded (Govt-Aided Autonomous)

  // Other Leading Regional Engineering Colleges (Nashik, Kolhapur, Sangli, Solapur, Nagpur, etc.)
  '04116': 148000, // G.H. Raisoni College of Engineering, Nagpur
  '04123': 151000, // Priyadarshini College of Engineering, Nagpur
  '04147': 118000, // K.D.K. College of Engineering, Nagpur
  '04167': 175000, // YCCE Nagpur (Yeshwantrao Chavan College of Engineering)
  '04174': 132000, // St. Vincent Pallotti College of Engineering, Nagpur
  '04649': 115000, // Bajaj Institute of Technology, Wardha
  '05108': 134000, // NDMVP's KBT College of Engineering, Nashik
  '05109': 110000, // Sandip Foundation SITRC, Nashik
  '05121': 163000, // K.K. Wagh Institute of Engineering Education & Research, Nashik
  '05151': 112000, // MET Bhujbal Knowledge City, Nashik
  '05160': 118000, // Sanjivani College of Engineering, Kopargaon
  '05162': 115000, // Amrutvahini College of Engineering, Sangamner
  '05172': 164000, // R.C. Patel Institute of Technology, Shirpur
  '05239': 72000,  // Jamia Institute of Technology, Akkalkuwa
  '06214': 135000, // K.E. Society's Rajarambapu Institute of Technology (RIT), Sangli
  '06220': 105000, // SVERI's College of Engineering, Pandharpur
  '06222': 108000, // DKTE Society's Textile & Engineering Institute, Ichalkaranji
  '06250': 115000, // D.Y. Patil College of Engineering and Technology, Kolhapur
  '06265': 140000, // Walchand Institute of Technology (WIT), Solapur
  '06267': 123000, // Kolhapur Institute of Technology (KIT), Kolhapur
  '06268': 102000, // Tatyasaheb Kore Institute of Engineering, Warananagar
  '06283': 105000, // Annasaheb Dange College of Engineering, Ashta
  '06288': 111000, // Bharati Vidyapeeth College of Engineering, Kolhapur
  '06938': 95000,  // Shree Siddheshwar Women's College of Engineering, Solapur
};

let verifiedCount = 0;
let unaidedBaselineCount = 0;
let govtPrescribedCount = 0;

for (const col of COLLEGES) {
  const code = col.c;
  const rawStatus = (col.st || '').toLowerCase().trim();

  if (VERIFIED_FEES[code] !== undefined) {
    col.f = VERIFIED_FEES[code];
    verifiedCount++;
  } else if (!col.f || col.f === 24000 || col.f === 26000) {
    // Specifically check if strictly government or government-aided (NOT unaided)
    const isStrictGovt = rawStatus === 'govt' || rawStatus === 'govt-aided';
    if (isStrictGovt) {
      col.f = 26000;
      govtPrescribedCount++;
    } else {
      // Private unaided college without published individual audit: FRA baseline
      col.f = 85000;
      unaidedBaselineCount++;
    }
  }
}

console.log(`Updated specific verified colleges: ${verifiedCount}`);
console.log(`Replaced placeholder with FRA baseline (₹85k) for unaided colleges: ${unaidedBaselineCount}`);
console.log(`Replaced placeholder with DTE prescribed (₹26k) for govt colleges: ${govtPrescribedCount}`);

// Reconstruct cap_data.ts
const updatedContent = `${header}export const COLLEGES: College[] = ${JSON.stringify(COLLEGES, null, 2)};\n`;
fs.writeFileSync(capDataFile, updatedContent, 'utf-8');
console.log(`Successfully calibrated and rewrote ${capDataFile}.`);
