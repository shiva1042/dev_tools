import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Copy,
  Check,
  MapPin,
  ArrowUpDown,
  Globe,
  Navigation,
  Crosshair,
  Grid3x3,
  Repeat,
  LocateFixed,
  Clipboard,
} from 'lucide-react';

/* ================================================================
   WGS84 Ellipsoid Constants
   ================================================================ */
const WGS84_A = 6378137.0; // semi-major axis (meters)
const WGS84_F = 1.0 / 298.257223563; // flattening
const WGS84_B = WGS84_A * (1 - WGS84_F); // semi-minor axis
const WGS84_E = Math.sqrt(1 - (WGS84_B * WGS84_B) / (WGS84_A * WGS84_A)); // eccentricity
const WGS84_E2 = WGS84_E * WGS84_E;
const WGS84_EP2 = WGS84_E2 / (1 - WGS84_E2); // second eccentricity squared
const K0 = 0.9996; // UTM scale factor

/* ================================================================
   Conversion Math
   ================================================================ */

/* --- DD <-> DMS --- */
function ddToDMS(dd: number): { degrees: number; minutes: number; seconds: number } {
  const abs = Math.abs(dd);
  const degrees = Math.floor(abs);
  const minFull = (abs - degrees) * 60;
  const minutes = Math.floor(minFull);
  const seconds = (minFull - minutes) * 60;
  return { degrees, minutes, seconds };
}

function dmsToDd(degrees: number, minutes: number, seconds: number, negative: boolean): number {
  const dd = Math.abs(degrees) + minutes / 60 + seconds / 3600;
  return negative ? -dd : dd;
}

/* --- DD <-> DDM --- */
function ddToDDM(dd: number): { degrees: number; decimalMinutes: number } {
  const abs = Math.abs(dd);
  const degrees = Math.floor(abs);
  const decimalMinutes = (abs - degrees) * 60;
  return { degrees, decimalMinutes };
}

function ddmToDd(degrees: number, decimalMinutes: number, negative: boolean): number {
  const dd = Math.abs(degrees) + decimalMinutes / 60;
  return negative ? -dd : dd;
}

/* --- DD <-> Web Mercator (EPSG:3857) --- */
function ddToWebMercator(lat: number, lng: number): { x: number; y: number } {
  const x = (lng * 20037508.34) / 180;
  const latRad = (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180));
  const y = (latRad * 20037508.34) / 180;
  return { x, y };
}

function webMercatorToDD(x: number, y: number): { lat: number; lng: number } {
  const lng = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return { lat, lng };
}

/* --- DD <-> UTM (WGS84) --- */
function ddToUTM(lat: number, lng: number): { zone: number; letter: string; easting: number; northing: number } {
  // Determine UTM zone
  let zone = Math.floor((lng + 180) / 6) + 1;

  // Special zones for Norway/Svalbard
  if (lat >= 56 && lat < 64 && lng >= 3 && lng < 12) zone = 32;
  if (lat >= 72 && lat < 84) {
    if (lng >= 0 && lng < 9) zone = 31;
    else if (lng >= 9 && lng < 21) zone = 33;
    else if (lng >= 21 && lng < 33) zone = 35;
    else if (lng >= 33 && lng < 42) zone = 37;
  }

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const centralMeridian = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = WGS84_EP2 * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lngRad - centralMeridian);

  // Meridional arc
  const M = WGS84_A * (
    (1 - WGS84_E2 / 4 - 3 * WGS84_E2 * WGS84_E2 / 64 - 5 * Math.pow(WGS84_E2, 3) / 256) * latRad
    - (3 * WGS84_E2 / 8 + 3 * WGS84_E2 * WGS84_E2 / 32 + 45 * Math.pow(WGS84_E2, 3) / 1024) * Math.sin(2 * latRad)
    + (15 * WGS84_E2 * WGS84_E2 / 256 + 45 * Math.pow(WGS84_E2, 3) / 1024) * Math.sin(4 * latRad)
    - (35 * Math.pow(WGS84_E2, 3) / 3072) * Math.sin(6 * latRad)
  );

  let easting = K0 * N * (
    A
    + (1 - T + C) * Math.pow(A, 3) / 6
    + (5 - 18 * T + T * T + 72 * C - 58 * WGS84_EP2) * Math.pow(A, 5) / 120
  ) + 500000;

  let northing = K0 * (
    M
    + N * Math.tan(latRad) * (
      A * A / 2
      + (5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4) / 24
      + (61 - 58 * T + T * T + 600 * C - 330 * WGS84_EP2) * Math.pow(A, 6) / 720
    )
  );

  if (lat < 0) northing += 10000000;

  // UTM zone letter
  const letters = 'CDEFGHJKLMNPQRSTUVWX';
  let letterIdx = Math.floor((lat + 80) / 8);
  if (letterIdx < 0) letterIdx = 0;
  if (letterIdx > 19) letterIdx = 19;
  const letter = letters[letterIdx];

  return { zone, letter, easting, northing };
}

function utmToDD(zone: number, letter: string, easting: number, northing: number): { lat: number; lng: number } {
  const isNorthern = letter.charCodeAt(0) >= 'N'.charCodeAt(0);
  const adjustedNorthing = isNorthern ? northing : northing - 10000000;

  const M = adjustedNorthing / K0;
  const mu = M / (WGS84_A * (1 - WGS84_E2 / 4 - 3 * WGS84_E2 * WGS84_E2 / 64 - 5 * Math.pow(WGS84_E2, 3) / 256));

  const e1 = (1 - Math.sqrt(1 - WGS84_E2)) / (1 + Math.sqrt(1 - WGS84_E2));

  const phi1 = mu
    + (3 * e1 / 2 - 27 * Math.pow(e1, 3) / 32) * Math.sin(2 * mu)
    + (21 * e1 * e1 / 16 - 55 * Math.pow(e1, 4) / 32) * Math.sin(4 * mu)
    + (151 * Math.pow(e1, 3) / 96) * Math.sin(6 * mu)
    + (1097 * Math.pow(e1, 4) / 512) * Math.sin(8 * mu);

  const N1 = WGS84_A / Math.sqrt(1 - WGS84_E2 * Math.sin(phi1) * Math.sin(phi1));
  const T1 = Math.tan(phi1) * Math.tan(phi1);
  const C1 = WGS84_EP2 * Math.cos(phi1) * Math.cos(phi1);
  const R1 = WGS84_A * (1 - WGS84_E2) / Math.pow(1 - WGS84_E2 * Math.sin(phi1) * Math.sin(phi1), 1.5);
  const D = (easting - 500000) / (N1 * K0);

  const lat = phi1
    - (N1 * Math.tan(phi1) / R1) * (
      D * D / 2
      - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * WGS84_EP2) * Math.pow(D, 4) / 24
      + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * WGS84_EP2 - 3 * C1 * C1) * Math.pow(D, 6) / 720
    );

  const lng = (
    D
    - (1 + 2 * T1 + C1) * Math.pow(D, 3) / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * WGS84_EP2 + 24 * T1 * T1) * Math.pow(D, 5) / 120
  ) / Math.cos(phi1);

  const centralMeridian = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

  return {
    lat: (lat * 180) / Math.PI,
    lng: (lng + centralMeridian) * 180 / Math.PI,
  };
}

/* --- DD <-> MGRS (simplified via UTM) --- */
const MGRS_SET_1 = 'ABCDEFGH';
const MGRS_SET_2 = 'ABCDEFGHJKLMNPQRSTUV';

function utmToMGRS(zone: number, letter: string, easting: number, northing: number, precision: number = 5): string {
  const setNumber = ((zone - 1) % 6);
  const col100k = Math.floor(easting / 100000);
  const row100k = Math.floor(northing / 100000) % 20;

  // Column letter (set-dependent)
  const colLetters = [
    'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ',
    'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ',
  ];
  const colLetter = colLetters[setNumber][col100k - 1] || 'A';

  // Row letter (set-dependent)
  const rowLetters = [
    'ABCDEFGHJKLMNPQRSTUV',
    'FGHJKLMNPQRSTUVABCDE',
  ];
  const rowLetter = rowLetters[setNumber % 2][row100k] || 'A';

  const e = Math.round(easting % 100000);
  const n = Math.round(northing % 100000);

  const div = Math.pow(10, 5 - precision);
  const eStr = String(Math.floor(e / div)).padStart(precision, '0');
  const nStr = String(Math.floor(n / div)).padStart(precision, '0');

  return `${zone}${letter}${colLetter}${rowLetter}${eStr}${nStr}`;
}

function mgrsToDD(mgrs: string): { lat: number; lng: number } | null {
  // Parse MGRS string
  const match = mgrs.replace(/\s/g, '').match(/^(\d{1,2})([C-X])([A-Z])([A-Z])(\d+)$/i);
  if (!match) return null;

  const zone = parseInt(match[1]);
  const bandLetter = match[2].toUpperCase();
  const colLetter = match[3].toUpperCase();
  const rowLetter = match[4].toUpperCase();
  const digits = match[5];

  if (digits.length % 2 !== 0) return null;
  const precision = digits.length / 2;
  const eDigits = digits.substring(0, precision);
  const nDigits = digits.substring(precision);

  const multiplier = Math.pow(10, 5 - precision);
  let easting = parseInt(eDigits) * multiplier;
  let northing = parseInt(nDigits) * multiplier;

  // Compute 100km column
  const setNumber = ((zone - 1) % 6);
  const colLetters = [
    'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ',
    'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ',
  ];
  const col100k = colLetters[setNumber].indexOf(colLetter) + 1;
  if (col100k <= 0) return null;

  easting += col100k * 100000;

  // Compute 100km row
  const rowLetters = [
    'ABCDEFGHJKLMNPQRSTUV',
    'FGHJKLMNPQRSTUVABCDE',
  ];
  const row100k = rowLetters[setNumber % 2].indexOf(rowLetter);
  if (row100k < 0) return null;

  // Determine minimum northing for band
  const bandLetters = 'CDEFGHJKLMNPQRSTUVWX';
  const bandIdx = bandLetters.indexOf(bandLetter);
  const bandMinLat = -80 + bandIdx * 8;

  // Get approximate northing from band
  const approxUtm = ddToUTM(bandMinLat + 4, ((zone - 1) * 6 - 180 + 3));
  const baseNorthing = Math.floor(approxUtm.northing / 2000000) * 2000000;

  northing += row100k * 100000 + baseNorthing;

  // Adjust if northing is too far from band center
  const expectedNorthing = ddToUTM(bandMinLat + 4, ((zone - 1) * 6 - 180 + 3)).northing;
  while (northing < expectedNorthing - 1000000) northing += 2000000;
  while (northing > expectedNorthing + 1000000) northing -= 2000000;

  return utmToDD(zone, bandLetter, easting, northing);
}

/* ================================================================
   Types
   ================================================================ */
type InputFormat = 'DD' | 'DMS' | 'DDM' | 'UTM' | 'MGRS' | 'WebMercator';

interface Coordinate {
  lat: number;
  lng: number;
}

interface ConvertedFormats {
  dd: { lat: string; lng: string } | null;
  dms: { lat: string; lng: string } | null;
  ddm: { lat: string; lng: string } | null;
  utm: string | null;
  mgrs: string | null;
  webMercator: { x: string; y: string } | null;
}

const presets: { name: string; lat: number; lng: number }[] = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'London', lat: 51.5074, lng: -0.1278 },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
  { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { name: 'Paris', lat: 48.8566, lng: 2.3522 },
  { name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
  { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
  { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

/* ================================================================
   Helpers
   ================================================================ */
const inputSx = {
  bgcolor: '#1a1a1a',
  color: 'grey.300',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#60a5fa' },
  '& .MuiInputBase-input': { color: '#e0e0e0' },
  '& .MuiInputLabel-root': { color: '#888' },
};

function convertFromDD(lat: number, lng: number, precision: number, dmsFormat: 'symbols' | 'letters'): ConvertedFormats {
  if (isNaN(lat) || isNaN(lng)) return { dd: null, dms: null, ddm: null, utm: null, mgrs: null, webMercator: null };

  // DD
  const dd = {
    lat: lat.toFixed(precision),
    lng: lng.toFixed(precision),
  };

  // DMS
  const latDMS = ddToDMS(lat);
  const lngDMS = ddToDMS(lng);
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const dms = dmsFormat === 'symbols'
    ? {
        lat: `${latDMS.degrees}\u00B0 ${latDMS.minutes}\u2032 ${latDMS.seconds.toFixed(precision)}\u2033 ${latDir}`,
        lng: `${lngDMS.degrees}\u00B0 ${lngDMS.minutes}\u2032 ${lngDMS.seconds.toFixed(precision)}\u2033 ${lngDir}`,
      }
    : {
        lat: `${latDMS.degrees}d ${latDMS.minutes}m ${latDMS.seconds.toFixed(precision)}s ${latDir}`,
        lng: `${lngDMS.degrees}d ${lngDMS.minutes}m ${lngDMS.seconds.toFixed(precision)}s ${lngDir}`,
      };

  // DDM
  const latDDM = ddToDDM(lat);
  const lngDDM = ddToDDM(lng);
  const ddm = {
    lat: `${latDDM.degrees}\u00B0 ${latDDM.decimalMinutes.toFixed(precision)}\u2032 ${latDir}`,
    lng: `${lngDDM.degrees}\u00B0 ${lngDDM.decimalMinutes.toFixed(precision)}\u2032 ${lngDir}`,
  };

  // UTM
  let utm: string | null = null;
  let utmData: { zone: number; letter: string; easting: number; northing: number } | null = null;
  if (lat >= -80 && lat <= 84) {
    utmData = ddToUTM(lat, lng);
    utm = `${utmData.zone}${utmData.letter} ${utmData.easting.toFixed(2)}m E ${utmData.northing.toFixed(2)}m N`;
  }

  // MGRS
  let mgrs: string | null = null;
  if (utmData) {
    const mgrsPrec = Math.min(precision, 5);
    mgrs = utmToMGRS(utmData.zone, utmData.letter, utmData.easting, utmData.northing, mgrsPrec);
  }

  // Web Mercator
  const wm = ddToWebMercator(lat, lng);
  const webMercator = {
    x: wm.x.toFixed(2),
    y: wm.y.toFixed(2),
  };

  return { dd, dms, ddm, utm, mgrs, webMercator };
}

/* ================================================================
   Main Component
   ================================================================ */
export default function CoordinateConverter() {
  const [inputFormat, setInputFormat] = useState<InputFormat>('DD');
  const [precision, setPrecision] = useState(6);
  const [dmsFormat, setDmsFormat] = useState<'symbols' | 'letters'>('symbols');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0); // 0=single, 1=batch

  // DD inputs
  const [ddLat, setDdLat] = useState('40.7128');
  const [ddLng, setDdLng] = useState('-74.0060');

  // DMS inputs
  const [dmsLatD, setDmsLatD] = useState('40');
  const [dmsLatM, setDmsLatM] = useState('42');
  const [dmsLatS, setDmsLatS] = useState('46.08');
  const [dmsLatDir, setDmsLatDir] = useState<'N' | 'S'>('N');
  const [dmsLngD, setDmsLngD] = useState('74');
  const [dmsLngM, setDmsLngM] = useState('0');
  const [dmsLngS, setDmsLngS] = useState('21.6');
  const [dmsLngDir, setDmsLngDir] = useState<'E' | 'W'>('W');

  // DDM inputs
  const [ddmLatD, setDdmLatD] = useState('40');
  const [ddmLatM, setDdmLatM] = useState('42.768');
  const [ddmLatDir, setDdmLatDir] = useState<'N' | 'S'>('N');
  const [ddmLngD, setDdmLngD] = useState('74');
  const [ddmLngM, setDdmLngM] = useState('0.360');
  const [ddmLngDir, setDdmLngDir] = useState<'E' | 'W'>('W');

  // UTM inputs
  const [utmZone, setUtmZone] = useState('18');
  const [utmLetter, setUtmLetter] = useState('T');
  const [utmEasting, setUtmEasting] = useState('583960.00');
  const [utmNorthing, setUtmNorthing] = useState('4507523.00');

  // MGRS input
  const [mgrsInput, setMgrsInput] = useState('18TWL8396007523');

  // Web Mercator inputs
  const [wmX, setWmX] = useState('-8238310.24');
  const [wmY, setWmY] = useState('4970071.58');

  // Batch inputs
  const [batchInput, setBatchInput] = useState('40.7128, -74.0060\n51.5074, -0.1278\n35.6762, 139.6503\n-33.8688, 151.2093');
  const [batchFromFormat, setBatchFromFormat] = useState<'DD' | 'DMS'>('DD');
  const [batchToFormat, setBatchToFormat] = useState<'DD' | 'DMS' | 'DDM' | 'UTM' | 'MGRS' | 'WebMercator'>('DMS');
  const [batchOutput, setBatchOutput] = useState('');

  /* --- Compute current coordinate in DD --- */
  const currentDD: Coordinate | null = useMemo(() => {
    try {
      switch (inputFormat) {
        case 'DD': {
          const lat = parseFloat(ddLat);
          const lng = parseFloat(ddLng);
          if (isNaN(lat) || isNaN(lng)) return null;
          return { lat, lng };
        }
        case 'DMS': {
          const lat = dmsToDd(parseInt(dmsLatD) || 0, parseInt(dmsLatM) || 0, parseFloat(dmsLatS) || 0, dmsLatDir === 'S');
          const lng = dmsToDd(parseInt(dmsLngD) || 0, parseInt(dmsLngM) || 0, parseFloat(dmsLngS) || 0, dmsLngDir === 'W');
          return { lat, lng };
        }
        case 'DDM': {
          const lat = ddmToDd(parseInt(ddmLatD) || 0, parseFloat(ddmLatM) || 0, ddmLatDir === 'S');
          const lng = ddmToDd(parseInt(ddmLngD) || 0, parseFloat(ddmLngM) || 0, ddmLngDir === 'W');
          return { lat, lng };
        }
        case 'UTM': {
          const result = utmToDD(parseInt(utmZone) || 1, utmLetter || 'N', parseFloat(utmEasting) || 0, parseFloat(utmNorthing) || 0);
          return result;
        }
        case 'MGRS': {
          const result = mgrsToDD(mgrsInput);
          return result;
        }
        case 'WebMercator': {
          const result = webMercatorToDD(parseFloat(wmX) || 0, parseFloat(wmY) || 0);
          return result;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }, [inputFormat, ddLat, ddLng, dmsLatD, dmsLatM, dmsLatS, dmsLatDir, dmsLngD, dmsLngM, dmsLngS, dmsLngDir, ddmLatD, ddmLatM, ddmLatDir, ddmLngD, ddmLngM, ddmLngDir, utmZone, utmLetter, utmEasting, utmNorthing, mgrsInput, wmX, wmY]);

  const converted = useMemo(() => {
    if (!currentDD) return null;
    return convertFromDD(currentDD.lat, currentDD.lng, precision, dmsFormat);
  }, [currentDD, precision, dmsFormat]);

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleSwap = useCallback(() => {
    if (inputFormat === 'DD') {
      const temp = ddLat;
      setDdLat(ddLng);
      setDdLng(temp);
    }
  }, [inputFormat, ddLat, ddLng]);

  const handlePreset = useCallback((lat: number, lng: number) => {
    setInputFormat('DD');
    setDdLat(lat.toFixed(precision));
    setDdLng(lng.toFixed(precision));
  }, [precision]);

  const handleBatchConvert = useCallback(() => {
    const lines = batchInput.split('\n').filter(l => l.trim());
    const results: string[] = [];

    for (const line of lines) {
      try {
        let lat: number, lng: number;

        if (batchFromFormat === 'DD') {
          const parts = line.split(/[,\s\t]+/).map(p => p.trim()).filter(Boolean);
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        } else {
          // DMS: try parsing "40d 42m 46.08s N 74d 0m 21.6s W" or similar
          const parts = line.match(/(\d+)[d\u00B0]\s*(\d+)[m\u2032']\s*([\d.]+)[s\u2033"]\s*([NSns])\s*(\d+)[d\u00B0]\s*(\d+)[m\u2032']\s*([\d.]+)[s\u2033"]\s*([EWew])/);
          if (parts) {
            lat = dmsToDd(parseInt(parts[1]), parseInt(parts[2]), parseFloat(parts[3]), parts[4].toUpperCase() === 'S');
            lng = dmsToDd(parseInt(parts[5]), parseInt(parts[6]), parseFloat(parts[7]), parts[8].toUpperCase() === 'W');
          } else {
            results.push(`Error: Cannot parse "${line}"`);
            continue;
          }
        }

        if (isNaN(lat) || isNaN(lng)) {
          results.push(`Error: Invalid coordinates in "${line}"`);
          continue;
        }

        const conv = convertFromDD(lat, lng, precision, dmsFormat);

        switch (batchToFormat) {
          case 'DD':
            results.push(`${conv.dd?.lat}, ${conv.dd?.lng}`);
            break;
          case 'DMS':
            results.push(`${conv.dms?.lat}  ${conv.dms?.lng}`);
            break;
          case 'DDM':
            results.push(`${conv.ddm?.lat}  ${conv.ddm?.lng}`);
            break;
          case 'UTM':
            results.push(conv.utm || 'Out of UTM range');
            break;
          case 'MGRS':
            results.push(conv.mgrs || 'Out of MGRS range');
            break;
          case 'WebMercator':
            results.push(`${conv.webMercator?.x}, ${conv.webMercator?.y}`);
            break;
        }
      } catch {
        results.push(`Error: Cannot parse "${line}"`);
      }
    }

    setBatchOutput(results.join('\n'));
  }, [batchInput, batchFromFormat, batchToFormat, precision, dmsFormat]);

  /* --- Output Card Component --- */
  const OutputCard = ({ title, value, icon, copyKey }: { title: string; value: string | null; icon: React.ReactNode; copyKey: string }) => (
    <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="body2" sx={{ color: '#888', fontWeight: 600, fontSize: 12 }}>{title}</Typography>
        </Box>
        {value && (
          <Tooltip title={copied === copyKey ? 'Copied!' : 'Copy'}>
            <IconButton size="small" onClick={() => handleCopy(value, copyKey)} sx={{ color: copied === copyKey ? '#22c55e' : '#666' }}>
              {copied === copyKey ? <Check size={14} /> : <Copy size={14} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography variant="body2" sx={{ color: value ? '#e0e0e0' : '#555', fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-all' }}>
        {value || 'N/A'}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ bgcolor: '#0a0a0a', minHeight: '100vh', color: 'grey.300' }}>
      <Link to="/" style={{ position: 'fixed', top: 12, left: 12, zIndex: 50, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: 'rgba(30,30,30,0.9)', color: '#ccc', borderRadius: 8, textDecoration: 'none', fontSize: 14, border: '1px solid #333' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>

      <Box sx={{ maxWidth: 1400, mx: 'auto', pt: 7, px: 2, pb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Globe size={28} color="#60a5fa" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#e0e0e0' }}>
            Coordinate Converter
          </Typography>
        </Box>

        {/* Tabs: Single / Batch */}
        <Paper sx={{ bgcolor: '#111', border: '1px solid #222', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': { color: '#777', textTransform: 'none', fontSize: 13 },
              '& .Mui-selected': { color: '#60a5fa !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#60a5fa' },
            }}
          >
            <Tab icon={<Crosshair size={14} />} iconPosition="start" label="Single Conversion" />
            <Tab icon={<Grid3x3 size={14} />} iconPosition="start" label="Batch Conversion" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Left: Input */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Settings */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: '#888' }}>Input Format</InputLabel>
                    <Select
                      value={inputFormat}
                      label="Input Format"
                      onChange={(e) => setInputFormat(e.target.value as InputFormat)}
                      sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}
                    >
                      <MenuItem value="DD">Decimal Degrees (DD)</MenuItem>
                      <MenuItem value="DMS">Degrees Minutes Seconds (DMS)</MenuItem>
                      <MenuItem value="DDM">Degrees Decimal Minutes (DDM)</MenuItem>
                      <MenuItem value="UTM">UTM</MenuItem>
                      <MenuItem value="MGRS">MGRS</MenuItem>
                      <MenuItem value="WebMercator">Web Mercator (EPSG:3857)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ color: '#888' }}>DMS Format</InputLabel>
                    <Select
                      value={dmsFormat}
                      label="DMS Format"
                      onChange={(e) => setDmsFormat(e.target.value as 'symbols' | 'letters')}
                      sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}
                    >
                      <MenuItem value="symbols">Symbols (° ' ")</MenuItem>
                      <MenuItem value="letters">Letters (d m s)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                    <Typography variant="caption" sx={{ color: '#888', whiteSpace: 'nowrap' }}>Precision:</Typography>
                    <Slider
                      value={precision}
                      onChange={(_, v) => setPrecision(v as number)}
                      min={2}
                      max={10}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                      sx={{
                        color: '#60a5fa',
                        '& .MuiSlider-markLabel': { color: '#666' },
                        '& .MuiSlider-thumb': { width: 16, height: 16 },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#60a5fa', minWidth: 20 }}>{precision}</Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Input Fields */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Navigation size={16} color="#60a5fa" />
                  <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Input Coordinates</Typography>
                </Box>

                {inputFormat === 'DD' && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      label="Latitude" size="small" type="number" fullWidth
                      value={ddLat} onChange={e => setDdLat(e.target.value)}
                      inputProps={{ step: 'any' }}
                      sx={inputSx}
                    />
                    <TextField
                      label="Longitude" size="small" type="number" fullWidth
                      value={ddLng} onChange={e => setDdLng(e.target.value)}
                      inputProps={{ step: 'any' }}
                      sx={inputSx}
                    />
                    <Tooltip title="Swap lat/lng">
                      <IconButton onClick={handleSwap} sx={{ color: '#888' }}>
                        <ArrowUpDown size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                {inputFormat === 'DMS' && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>Latitude</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                      <TextField label="Deg" size="small" type="number" value={dmsLatD} onChange={e => setDmsLatD(e.target.value)} sx={{ ...inputSx, width: 80 }} />
                      <TextField label="Min" size="small" type="number" value={dmsLatM} onChange={e => setDmsLatM(e.target.value)} sx={{ ...inputSx, width: 80 }} />
                      <TextField label="Sec" size="small" type="number" value={dmsLatS} onChange={e => setDmsLatS(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, width: 100 }} />
                      <FormControl size="small" sx={{ width: 70 }}>
                        <Select value={dmsLatDir} onChange={e => setDmsLatDir(e.target.value as 'N' | 'S')} sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                          <MenuItem value="N">N</MenuItem>
                          <MenuItem value="S">S</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>Longitude</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField label="Deg" size="small" type="number" value={dmsLngD} onChange={e => setDmsLngD(e.target.value)} sx={{ ...inputSx, width: 80 }} />
                      <TextField label="Min" size="small" type="number" value={dmsLngM} onChange={e => setDmsLngM(e.target.value)} sx={{ ...inputSx, width: 80 }} />
                      <TextField label="Sec" size="small" type="number" value={dmsLngS} onChange={e => setDmsLngS(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, width: 100 }} />
                      <FormControl size="small" sx={{ width: 70 }}>
                        <Select value={dmsLngDir} onChange={e => setDmsLngDir(e.target.value as 'E' | 'W')} sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                          <MenuItem value="E">E</MenuItem>
                          <MenuItem value="W">W</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                )}

                {inputFormat === 'DDM' && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>Latitude</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                      <TextField label="Degrees" size="small" type="number" value={ddmLatD} onChange={e => setDdmLatD(e.target.value)} sx={{ ...inputSx, width: 100 }} />
                      <TextField label="Decimal Minutes" size="small" type="number" value={ddmLatM} onChange={e => setDdmLatM(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, width: 140 }} />
                      <FormControl size="small" sx={{ width: 70 }}>
                        <Select value={ddmLatDir} onChange={e => setDdmLatDir(e.target.value as 'N' | 'S')} sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                          <MenuItem value="N">N</MenuItem>
                          <MenuItem value="S">S</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666', mb: 1, display: 'block' }}>Longitude</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TextField label="Degrees" size="small" type="number" value={ddmLngD} onChange={e => setDdmLngD(e.target.value)} sx={{ ...inputSx, width: 100 }} />
                      <TextField label="Decimal Minutes" size="small" type="number" value={ddmLngM} onChange={e => setDdmLngM(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, width: 140 }} />
                      <FormControl size="small" sx={{ width: 70 }}>
                        <Select value={ddmLngDir} onChange={e => setDdmLngDir(e.target.value as 'E' | 'W')} sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                          <MenuItem value="E">E</MenuItem>
                          <MenuItem value="W">W</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                )}

                {inputFormat === 'UTM' && (
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField label="Zone" size="small" type="number" value={utmZone} onChange={e => setUtmZone(e.target.value)} sx={{ ...inputSx, width: 80 }} />
                    <TextField label="Letter" size="small" value={utmLetter} onChange={e => setUtmLetter(e.target.value.toUpperCase())} inputProps={{ maxLength: 1 }} sx={{ ...inputSx, width: 70 }} />
                    <TextField label="Easting (m)" size="small" type="number" value={utmEasting} onChange={e => setUtmEasting(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, flex: 1 }} />
                    <TextField label="Northing (m)" size="small" type="number" value={utmNorthing} onChange={e => setUtmNorthing(e.target.value)} inputProps={{ step: 'any' }} sx={{ ...inputSx, flex: 1 }} />
                  </Box>
                )}

                {inputFormat === 'MGRS' && (
                  <TextField
                    label="MGRS Grid Reference" size="small" fullWidth
                    value={mgrsInput} onChange={e => setMgrsInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 18TWL8396007523"
                    sx={inputSx}
                  />
                )}

                {inputFormat === 'WebMercator' && (
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField label="X (meters)" size="small" type="number" fullWidth value={wmX} onChange={e => setWmX(e.target.value)} inputProps={{ step: 'any' }} sx={inputSx} />
                    <TextField label="Y (meters)" size="small" type="number" fullWidth value={wmY} onChange={e => setWmY(e.target.value)} inputProps={{ step: 'any' }} sx={inputSx} />
                  </Box>
                )}
              </Paper>

              {/* Presets */}
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <LocateFixed size={16} color="#eab308" />
                  <Typography variant="body2" sx={{ color: '#aaa', fontWeight: 600 }}>Common Locations</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {presets.map(p => (
                    <Chip
                      key={p.name}
                      label={p.name}
                      size="small"
                      onClick={() => handlePreset(p.lat, p.lng)}
                      sx={{ bgcolor: '#1a1a1a', color: '#999', border: '1px solid #333', fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa' } }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>

            {/* Right: Output */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <OutputCard
                title="Decimal Degrees (DD)"
                value={converted?.dd ? `${converted.dd.lat}, ${converted.dd.lng}` : null}
                icon={<MapPin size={16} color="#60a5fa" />}
                copyKey="dd"
              />
              <OutputCard
                title="Degrees Minutes Seconds (DMS)"
                value={converted?.dms ? `${converted.dms.lat}  ${converted.dms.lng}` : null}
                icon={<Navigation size={16} color="#22c55e" />}
                copyKey="dms"
              />
              <OutputCard
                title="Degrees Decimal Minutes (DDM)"
                value={converted?.ddm ? `${converted.ddm.lat}  ${converted.ddm.lng}` : null}
                icon={<Crosshair size={16} color="#a78bfa" />}
                copyKey="ddm"
              />
              <OutputCard
                title="UTM (Universal Transverse Mercator)"
                value={converted?.utm ?? null}
                icon={<Grid3x3 size={16} color="#f97316" />}
                copyKey="utm"
              />
              <OutputCard
                title="MGRS (Military Grid Reference System)"
                value={converted?.mgrs ?? null}
                icon={<Crosshair size={16} color="#ef4444" />}
                copyKey="mgrs"
              />
              <OutputCard
                title="Web Mercator (EPSG:3857)"
                value={converted?.webMercator ? `X: ${converted.webMercator.x}  Y: ${converted.webMercator.y}` : null}
                icon={<Globe size={16} color="#eab308" />}
                copyKey="wm"
              />
            </Box>
          </Box>
        )}

        {/* Batch Conversion Tab */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: '#888' }}>From Format</InputLabel>
                    <Select value={batchFromFormat} label="From Format" onChange={e => setBatchFromFormat(e.target.value as 'DD' | 'DMS')}
                      sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                      <MenuItem value="DD">Decimal Degrees</MenuItem>
                      <MenuItem value="DMS">DMS</MenuItem>
                    </Select>
                  </FormControl>

                  <Repeat size={18} color="#666" />

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: '#888' }}>To Format</InputLabel>
                    <Select value={batchToFormat} label="To Format" onChange={e => setBatchToFormat(e.target.value as typeof batchToFormat)}
                      sx={{ ...inputSx, '& .MuiSelect-select': { color: '#e0e0e0' } }}>
                      <MenuItem value="DD">Decimal Degrees</MenuItem>
                      <MenuItem value="DMS">DMS</MenuItem>
                      <MenuItem value="DDM">DDM</MenuItem>
                      <MenuItem value="UTM">UTM</MenuItem>
                      <MenuItem value="MGRS">MGRS</MenuItem>
                      <MenuItem value="WebMercator">Web Mercator</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Repeat size={14} />}
                    onClick={handleBatchConvert}
                    sx={{ bgcolor: '#60a5fa', color: '#000', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#3b82f6' } }}
                  >
                    Convert All
                  </Button>
                </Box>

                <Typography variant="body2" sx={{ color: '#888', mb: 1, fontSize: 12 }}>
                  Input (one coordinate per line, lat,lng for DD):
                </Typography>
                <textarea
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 200,
                    background: '#0f172a',
                    color: '#e0e0e0',
                    border: '1px solid #333',
                    borderRadius: 4,
                    outline: 'none',
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 13,
                    lineHeight: '22px',
                    padding: '12px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </Paper>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Paper sx={{ bgcolor: '#111', border: '1px solid #222', p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#888', fontSize: 12 }}>Output:</Typography>
                  {batchOutput && (
                    <Tooltip title="Copy output">
                      <IconButton size="small" onClick={() => handleCopy(batchOutput, 'batch')} sx={{ color: copied === 'batch' ? '#22c55e' : '#666' }}>
                        {copied === 'batch' ? <Check size={14} /> : <Clipboard size={14} />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <textarea
                  value={batchOutput}
                  readOnly
                  style={{
                    width: '100%',
                    minHeight: 200,
                    background: '#0a0e1a',
                    color: '#22c55e',
                    border: '1px solid #333',
                    borderRadius: 4,
                    outline: 'none',
                    fontFamily: '"Fira Code", monospace',
                    fontSize: 13,
                    lineHeight: '22px',
                    padding: '12px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
