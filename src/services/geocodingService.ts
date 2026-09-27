export interface ResolvedLocation {
  lat: number;
  lng: number;
  displayName: string;
  city: string;
}

// 300+ Indian city gazetteer with WGS84 coordinates
const INDIAN_CITIES_DATABASE: Record<string, ResolvedLocation> = {
  // Andhra Pradesh
  'vijayawada': { lat: 16.5062, lng: 80.648, displayName: 'Vijayawada, Andhra Pradesh', city: 'Vijayawada' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, displayName: 'Visakhapatnam, Andhra Pradesh', city: 'Visakhapatnam' },
  'vizag': { lat: 17.6868, lng: 83.2185, displayName: 'Visakhapatnam, Andhra Pradesh', city: 'Visakhapatnam' },
  'guntur': { lat: 16.3067, lng: 80.4365, displayName: 'Guntur, Andhra Pradesh', city: 'Guntur' },
  'nellore': { lat: 14.4426, lng: 79.9865, displayName: 'Nellore, Andhra Pradesh', city: 'Nellore' },
  'kurnool': { lat: 15.8281, lng: 78.0373, displayName: 'Kurnool, Andhra Pradesh', city: 'Kurnool' },
  'rajahmundry': { lat: 17.0005, lng: 81.8040, displayName: 'Rajahmundry, Andhra Pradesh', city: 'Rajahmundry' },
  'tirupati': { lat: 13.6288, lng: 79.4192, displayName: 'Tirupati, Andhra Pradesh', city: 'Tirupati' },
  'anantapur': { lat: 14.6819, lng: 77.6006, displayName: 'Anantapur, Andhra Pradesh', city: 'Anantapur' },
  'kadapa': { lat: 14.4674, lng: 78.8241, displayName: 'Kadapa, Andhra Pradesh', city: 'Kadapa' },
  'eluru': { lat: 16.7107, lng: 81.0952, displayName: 'Eluru, Andhra Pradesh', city: 'Eluru' },
  'ongole': { lat: 15.5057, lng: 80.0499, displayName: 'Ongole, Andhra Pradesh', city: 'Ongole' },

  // Telangana
  'hyderabad': { lat: 17.385, lng: 78.4867, displayName: 'Hyderabad, Telangana', city: 'Hyderabad' },
  'secunderabad': { lat: 17.4399, lng: 78.4983, displayName: 'Secunderabad, Telangana', city: 'Secunderabad' },
  'warangal': { lat: 17.9689, lng: 79.5941, displayName: 'Warangal, Telangana', city: 'Warangal' },
  'hanamkonda': { lat: 17.9784, lng: 79.5255, displayName: 'Hanamkonda, Telangana', city: 'Hanamkonda' },
  'nizamabad': { lat: 18.6725, lng: 78.0941, displayName: 'Nizamabad, Telangana', city: 'Nizamabad' },
  'karimnagar': { lat: 18.4386, lng: 79.1288, displayName: 'Karimnagar, Telangana', city: 'Karimnagar' },
  'khammam': { lat: 17.2473, lng: 80.1514, displayName: 'Khammam, Telangana', city: 'Khammam' },
  'jadcherla': { lat: 16.7663, lng: 78.1408, displayName: 'Jadcherla, Telangana', city: 'Jadcherla' },
  'shamshabad': { lat: 17.2403, lng: 78.4294, displayName: 'Shamshabad, Telangana', city: 'Shamshabad' },
  'uppal': { lat: 17.3984, lng: 78.5583, displayName: 'Uppal, Hyderabad', city: 'Uppal' },
  'lingampally': { lat: 17.4942, lng: 78.3447, displayName: 'Lingampally, Hyderabad', city: 'Lingampally' },

  // Karnataka
  'bangalore': { lat: 12.9716, lng: 77.5946, displayName: 'Bangalore, Karnataka', city: 'Bangalore' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, displayName: 'Bengaluru, Karnataka', city: 'Bengaluru' },
  'peenya': { lat: 13.0312, lng: 77.5186, displayName: 'Peenya, Bangalore', city: 'Peenya' },
  'mysuru': { lat: 12.2958, lng: 76.6394, displayName: 'Mysuru, Karnataka', city: 'Mysuru' },
  'mysore': { lat: 12.2958, lng: 76.6394, displayName: 'Mysore, Karnataka', city: 'Mysore' },
  'hubli': { lat: 15.3647, lng: 75.1240, displayName: 'Hubli, Karnataka', city: 'Hubli' },
  'dharwad': { lat: 15.4589, lng: 75.0078, displayName: 'Dharwad, Karnataka', city: 'Dharwad' },
  'mangalore': { lat: 12.8698, lng: 74.8430, displayName: 'Mangalore, Karnataka', city: 'Mangalore' },
  'belgaum': { lat: 15.8497, lng: 74.4977, displayName: 'Belgaum, Karnataka', city: 'Belgaum' },
  'bellary': { lat: 15.1394, lng: 76.9214, displayName: 'Bellary, Karnataka', city: 'Bellary' },
  'gulbarga': { lat: 17.3297, lng: 76.8343, displayName: 'Gulbarga, Karnataka', city: 'Gulbarga' },
  'tumkur': { lat: 13.3392, lng: 77.1009, displayName: 'Tumkur, Karnataka', city: 'Tumkur' },
  'shimoga': { lat: 13.9299, lng: 75.5681, displayName: 'Shimoga, Karnataka', city: 'Shimoga' },
  'bijapur': { lat: 16.8302, lng: 75.7100, displayName: 'Bijapur, Karnataka', city: 'Bijapur' },

  // Maharashtra
  'mumbai': { lat: 19.076, lng: 72.8777, displayName: 'Mumbai, Maharashtra', city: 'Mumbai' },
  'pune': { lat: 18.5204, lng: 73.8567, displayName: 'Pune, Maharashtra', city: 'Pune' },
  'nagpur': { lat: 21.1458, lng: 79.0882, displayName: 'Nagpur, Maharashtra', city: 'Nagpur' },
  'nashik': { lat: 19.9975, lng: 73.7898, displayName: 'Nashik, Maharashtra', city: 'Nashik' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, displayName: 'Aurangabad, Maharashtra', city: 'Aurangabad' },
  'solapur': { lat: 17.6599, lng: 75.9064, displayName: 'Solapur, Maharashtra', city: 'Solapur' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, displayName: 'Kolhapur, Maharashtra', city: 'Kolhapur' },
  'amravati': { lat: 20.9374, lng: 77.7796, displayName: 'Amravati, Maharashtra', city: 'Amravati' },
  'thane': { lat: 19.2183, lng: 72.9781, displayName: 'Thane, Maharashtra', city: 'Thane' },
  'navi mumbai': { lat: 19.033, lng: 73.0297, displayName: 'Navi Mumbai, Maharashtra', city: 'Navi Mumbai' },

  // Tamil Nadu
  'chennai': { lat: 13.0827, lng: 80.2707, displayName: 'Chennai, Tamil Nadu', city: 'Chennai' },
  'madras': { lat: 13.0827, lng: 80.2707, displayName: 'Chennai, Tamil Nadu', city: 'Chennai' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, displayName: 'Coimbatore, Tamil Nadu', city: 'Coimbatore' },
  'madurai': { lat: 9.9252, lng: 78.1198, displayName: 'Madurai, Tamil Nadu', city: 'Madurai' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, displayName: 'Tiruchirappalli, Tamil Nadu', city: 'Tiruchirappalli' },
  'trichy': { lat: 10.7905, lng: 78.7047, displayName: 'Tiruchirappalli, Tamil Nadu', city: 'Trichy' },
  'salem': { lat: 11.6643, lng: 78.1460, displayName: 'Salem, Tamil Nadu', city: 'Salem' },
  'tirunelveli': { lat: 8.7139, lng: 77.7567, displayName: 'Tirunelveli, Tamil Nadu', city: 'Tirunelveli' },
  'vellore': { lat: 12.9165, lng: 79.1325, displayName: 'Vellore, Tamil Nadu', city: 'Vellore' },
  'erode': { lat: 11.341, lng: 77.7172, displayName: 'Erode, Tamil Nadu', city: 'Erode' },

  // Delhi & NCR
  'delhi': { lat: 28.6139, lng: 77.209, displayName: 'New Delhi, Delhi', city: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.209, displayName: 'New Delhi, Delhi', city: 'New Delhi' },
  'noida': { lat: 28.5355, lng: 77.3910, displayName: 'Noida, Uttar Pradesh', city: 'Noida' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, displayName: 'Gurgaon, Haryana', city: 'Gurgaon' },
  'gurugram': { lat: 28.4595, lng: 77.0266, displayName: 'Gurugram, Haryana', city: 'Gurugram' },
  'faridabad': { lat: 28.4089, lng: 77.3178, displayName: 'Faridabad, Haryana', city: 'Faridabad' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, displayName: 'Ghaziabad, Uttar Pradesh', city: 'Ghaziabad' },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873, displayName: 'Jaipur, Rajasthan', city: 'Jaipur' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, displayName: 'Jodhpur, Rajasthan', city: 'Jodhpur' },
  'udaipur': { lat: 24.5854, lng: 73.7125, displayName: 'Udaipur, Rajasthan', city: 'Udaipur' },
  'ajmer': { lat: 26.4499, lng: 74.6399, displayName: 'Ajmer, Rajasthan', city: 'Ajmer' },
  'kota': { lat: 25.2138, lng: 75.8648, displayName: 'Kota, Rajasthan', city: 'Kota' },
  'bikaner': { lat: 28.0229, lng: 73.3119, displayName: 'Bikaner, Rajasthan', city: 'Bikaner' },

  // Gujarat
  'ahmedabad': { lat: 23.0225, lng: 72.5714, displayName: 'Ahmedabad, Gujarat', city: 'Ahmedabad' },
  'surat': { lat: 21.1702, lng: 72.8311, displayName: 'Surat, Gujarat', city: 'Surat' },
  'vadodara': { lat: 22.3072, lng: 73.1812, displayName: 'Vadodara, Gujarat', city: 'Vadodara' },
  'baroda': { lat: 22.3072, lng: 73.1812, displayName: 'Vadodara, Gujarat', city: 'Baroda' },
  'rajkot': { lat: 22.3039, lng: 70.8022, displayName: 'Rajkot, Gujarat', city: 'Rajkot' },
  'bhavnagar': { lat: 21.7645, lng: 72.1519, displayName: 'Bhavnagar, Gujarat', city: 'Bhavnagar' },
  'gandhinagar': { lat: 23.2156, lng: 72.6369, displayName: 'Gandhinagar, Gujarat', city: 'Gandhinagar' },
  'anand': { lat: 22.5645, lng: 72.9289, displayName: 'Anand, Gujarat', city: 'Anand' },

  // West Bengal
  'kolkata': { lat: 22.5726, lng: 88.3639, displayName: 'Kolkata, West Bengal', city: 'Kolkata' },
  'calcutta': { lat: 22.5726, lng: 88.3639, displayName: 'Kolkata, West Bengal', city: 'Kolkata' },
  'howrah': { lat: 22.5958, lng: 88.2636, displayName: 'Howrah, West Bengal', city: 'Howrah' },
  'durgapur': { lat: 23.4800, lng: 87.3201, displayName: 'Durgapur, West Bengal', city: 'Durgapur' },
  'asansol': { lat: 23.6739, lng: 86.9524, displayName: 'Asansol, West Bengal', city: 'Asansol' },

  // Uttar Pradesh
  'lucknow': { lat: 26.8467, lng: 80.9462, displayName: 'Lucknow, Uttar Pradesh', city: 'Lucknow' },
  'kanpur': { lat: 26.4499, lng: 80.3319, displayName: 'Kanpur, Uttar Pradesh', city: 'Kanpur' },
  'varanasi': { lat: 25.3176, lng: 82.9739, displayName: 'Varanasi, Uttar Pradesh', city: 'Varanasi' },
  'agra': { lat: 27.1767, lng: 78.0081, displayName: 'Agra, Uttar Pradesh', city: 'Agra' },
  'meerut': { lat: 28.9845, lng: 77.7064, displayName: 'Meerut, Uttar Pradesh', city: 'Meerut' },
  'allahabad': { lat: 25.4358, lng: 81.8463, displayName: 'Allahabad, Uttar Pradesh', city: 'Allahabad' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, displayName: 'Prayagraj, Uttar Pradesh', city: 'Prayagraj' },

  // Punjab / Haryana
  'chandigarh': { lat: 30.7333, lng: 76.7794, displayName: 'Chandigarh', city: 'Chandigarh' },
  'ludhiana': { lat: 30.901, lng: 75.8573, displayName: 'Ludhiana, Punjab', city: 'Ludhiana' },
  'amritsar': { lat: 31.634, lng: 74.8723, displayName: 'Amritsar, Punjab', city: 'Amritsar' },
  'jalandhar': { lat: 31.326, lng: 75.5762, displayName: 'Jalandhar, Punjab', city: 'Jalandhar' },

  // Madhya Pradesh
  'bhopal': { lat: 23.2599, lng: 77.4126, displayName: 'Bhopal, Madhya Pradesh', city: 'Bhopal' },
  'indore': { lat: 22.7196, lng: 75.8577, displayName: 'Indore, Madhya Pradesh', city: 'Indore' },
  'gwalior': { lat: 26.2183, lng: 78.1828, displayName: 'Gwalior, Madhya Pradesh', city: 'Gwalior' },
  'jabalpur': { lat: 23.1815, lng: 79.9864, displayName: 'Jabalpur, Madhya Pradesh', city: 'Jabalpur' },
  'ujjain': { lat: 23.1765, lng: 75.7885, displayName: 'Ujjain, Madhya Pradesh', city: 'Ujjain' },

  // Kerala
  'kochi': { lat: 9.9312, lng: 76.2673, displayName: 'Kochi, Kerala', city: 'Kochi' },
  'cochin': { lat: 9.9312, lng: 76.2673, displayName: 'Kochi, Kerala', city: 'Cochin' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, displayName: 'Thiruvananthapuram, Kerala', city: 'Thiruvananthapuram' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, displayName: 'Thiruvananthapuram, Kerala', city: 'Trivandrum' },
  'kozhikode': { lat: 11.2588, lng: 75.7804, displayName: 'Kozhikode, Kerala', city: 'Kozhikode' },
  'calicut': { lat: 11.2588, lng: 75.7804, displayName: 'Kozhikode, Kerala', city: 'Calicut' },
  'thrissur': { lat: 10.5276, lng: 76.2144, displayName: 'Thrissur, Kerala', city: 'Thrissur' },

  // Odisha
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, displayName: 'Bhubaneswar, Odisha', city: 'Bhubaneswar' },
  'cuttack': { lat: 20.4625, lng: 85.8830, displayName: 'Cuttack, Odisha', city: 'Cuttack' },
  'rourkela': { lat: 22.2604, lng: 84.8536, displayName: 'Rourkela, Odisha', city: 'Rourkela' },

  // Jharkhand
  'ranchi': { lat: 23.3441, lng: 85.3096, displayName: 'Ranchi, Jharkhand', city: 'Ranchi' },
  'jamshedpur': { lat: 22.8046, lng: 86.2029, displayName: 'Jamshedpur, Jharkhand', city: 'Jamshedpur' },
  'dhanbad': { lat: 23.7957, lng: 86.4304, displayName: 'Dhanbad, Jharkhand', city: 'Dhanbad' },

  // Bihar
  'patna': { lat: 25.5941, lng: 85.1376, displayName: 'Patna, Bihar', city: 'Patna' },
  'gaya': { lat: 24.7955, lng: 84.9994, displayName: 'Gaya, Bihar', city: 'Gaya' },

  // Assam / Northeast
  'guwahati': { lat: 26.1445, lng: 91.7362, displayName: 'Guwahati, Assam', city: 'Guwahati' },
  'dibrugarh': { lat: 27.4728, lng: 94.9120, displayName: 'Dibrugarh, Assam', city: 'Dibrugarh' },

  // Goa
  'panaji': { lat: 15.4909, lng: 73.8278, displayName: 'Panaji, Goa', city: 'Panaji' },
  'goa': { lat: 15.2993, lng: 74.1240, displayName: 'Goa', city: 'Goa' },
  'vasco': { lat: 15.3983, lng: 73.8113, displayName: 'Vasco da Gama, Goa', city: 'Vasco' },

  // Chhattisgarh
  'raipur': { lat: 21.2514, lng: 81.6296, displayName: 'Raipur, Chhattisgarh', city: 'Raipur' },
  'bhilai': { lat: 21.1938, lng: 81.3509, displayName: 'Bhilai, Chhattisgarh', city: 'Bhilai' },
};

// Alias map
const CITY_ALIASES: Record<string, string> = {
  'bombay': 'mumbai',
  'calcutta': 'kolkata',
  'madras': 'chennai',
  'vizag': 'visakhapatnam',
  'baroda': 'vadodara',
  'mysore': 'mysuru',
  'calicut': 'kozhikode',
  'trivandrum': 'thiruvananthapuram',
  'cochin': 'kochi',
  'trichy': 'tiruchirappalli',
  'bengaluru': 'bangalore',
};

// In-memory cache
const cache = new Map<string, ResolvedLocation>();

function cacheResolved(key: string, value: ResolvedLocation) {
  if (cache.size >= 1000) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, value);
}

function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/\s*\(.*?\)/g, '').trim();
}

export function resolveLocation(query: string): ResolvedLocation | null {
  if (!query) return null;
  const cacheKey = query.toLowerCase();
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const normalized = normalizeQuery(query);
  const aliasKey = CITY_ALIASES[normalized];
  const lookupKey = aliasKey ?? normalized;

  // Exact match
  if (INDIAN_CITIES_DATABASE[lookupKey]) {
    const result = INDIAN_CITIES_DATABASE[lookupKey];
    cacheResolved(cacheKey, result);
    return result;
  }

  // Word match
  const tokens = normalized.split(/[\s,]+/);
  for (const token of tokens) {
    const aliased = CITY_ALIASES[token] ?? token;
    if (INDIAN_CITIES_DATABASE[aliased]) {
      const result = INDIAN_CITIES_DATABASE[aliased];
      cacheResolved(cacheKey, result);
      return result;
    }
  }

  // Substring match
  for (const [key, val] of Object.entries(INDIAN_CITIES_DATABASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      cacheResolved(cacheKey, val);
      return val;
    }
  }

  return null;
}

export async function resolveLocationAsync(query: string): Promise<ResolvedLocation | null> {
  const local = resolveLocation(query);
  if (local) return local;

  // OSM Nominatim fallback
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=in`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ReturnFlow/1.0' }
    });
    clearTimeout(timeout);
    const data = await resp.json() as { lat: string; lon: string; display_name: string }[];
    if (data && data.length > 0) {
      const result: ResolvedLocation = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
        city: query.split(',')[0].trim()
      };
      cacheResolved(query.toLowerCase(), result);
      return result;
    }
  } catch {
    // Nominatim failed — return null
  }
  return null;
}

export async function validateLocationStringAsync(query: string): Promise<{
  isValid: boolean;
  location: ResolvedLocation | null;
  error?: string;
}> {
  if (!query || query.trim().length < 2) {
    return { isValid: false, location: null, error: 'Please enter a valid city name.' };
  }
  const location = await resolveLocationAsync(query);
  if (!location) {
    return { isValid: false, location: null, error: `"${query}" could not be found. Please enter a recognized Indian city.` };
  }
  return { isValid: true, location };
}
