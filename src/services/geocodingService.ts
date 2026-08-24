export interface ResolvedLocation {
  name: string;
  displayName: string;
  city: string;
  state?: string;
  lat: number;
  lng: number;
}

/**
 * Comprehensive gazetteer of Indian state capitals, major metros, transit junctions,
 * and industrial hubs with verified WGS84 coordinates from OpenStreetMap / public geographic datasets.
 */
export const INDIAN_CITIES_DATABASE: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  // Telangana & Andhra Pradesh
  'hyderabad': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
  'shamshabad': { lat: 17.2403, lng: 78.4294, city: 'Hyderabad (Shamshabad)', state: 'Telangana' },
  'uppal': { lat: 17.3984, lng: 78.5583, city: 'Hyderabad (Uppal)', state: 'Telangana' },
  'secunderabad': { lat: 17.4399, lng: 78.4983, city: 'Secunderabad', state: 'Telangana' },
  'lb nagar': { lat: 17.3512, lng: 78.5522, city: 'Hyderabad (L.B. Nagar)', state: 'Telangana' },
  'l.b. nagar': { lat: 17.3512, lng: 78.5522, city: 'Hyderabad (L.B. Nagar)', state: 'Telangana' },
  'medchal': { lat: 17.6297, lng: 78.4814, city: 'Hyderabad (Medchal)', state: 'Telangana' },
  'patancheru': { lat: 17.5284, lng: 78.2642, city: 'Hyderabad (Patancheru)', state: 'Telangana' },
  'warangal': { lat: 17.9689, lng: 79.5941, city: 'Warangal', state: 'Telangana' },
  'kazipet': { lat: 17.9784, lng: 79.5255, city: 'Kazipet', state: 'Telangana' },
  'hanamkonda': { lat: 18.0138, lng: 79.5519, city: 'Hanamkonda', state: 'Telangana' },
  'jangaon': { lat: 17.7277, lng: 79.1558, city: 'Jangaon', state: 'Telangana' },
  'bhongir': { lat: 17.5108, lng: 78.8891, city: 'Bhongir', state: 'Telangana' },
  'karimnagar': { lat: 18.4386, lng: 79.1288, city: 'Karimnagar', state: 'Telangana' },
  'nizamabad': { lat: 18.6725, lng: 78.0941, city: 'Nizamabad', state: 'Telangana' },
  'khammam': { lat: 17.2473, lng: 80.1514, city: 'Khammam', state: 'Telangana' },
  'suryapet': { lat: 17.1439, lng: 79.6239, city: 'Suryapet', state: 'Telangana' },
  'nalgonda': { lat: 17.0577, lng: 79.2684, city: 'Nalgonda', state: 'Telangana' },
  'jadcherla': { lat: 16.7663, lng: 78.1408, city: 'Jadcherla', state: 'Telangana' },
  'vijayawada': { lat: 16.5062, lng: 80.6480, city: 'Vijayawada', state: 'Andhra Pradesh' },
  'auto nagar': { lat: 16.5062, lng: 80.6480, city: 'Vijayawada (Auto Nagar)', state: 'Andhra Pradesh' },
  'guntur': { lat: 16.3067, lng: 80.4365, city: 'Guntur', state: 'Andhra Pradesh' },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185, city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  'vizag': { lat: 17.6868, lng: 83.2185, city: 'Visakhapatnam', state: 'Andhra Pradesh' },
  'kurnool': { lat: 15.8281, lng: 78.0373, city: 'Kurnool', state: 'Andhra Pradesh' },
  'anantapur': { lat: 14.6819, lng: 77.6006, city: 'Anantapur', state: 'Andhra Pradesh' },
  'tirupati': { lat: 13.6288, lng: 79.4192, city: 'Tirupati', state: 'Andhra Pradesh' },
  'nellore': { lat: 14.4426, lng: 79.9865, city: 'Nellore', state: 'Andhra Pradesh' },
  'kakinada': { lat: 16.9891, lng: 82.2475, city: 'Kakinada', state: 'Andhra Pradesh' },
  'rajahmundry': { lat: 17.0005, lng: 81.8040, city: 'Rajahmundry', state: 'Andhra Pradesh' },
  'kadapa': { lat: 14.4673, lng: 78.8242, city: 'Kadapa', state: 'Andhra Pradesh' },
  'nandigama': { lat: 16.7725, lng: 80.2925, city: 'Nandigama', state: 'Andhra Pradesh' },

  // Gujarat
  'ahmedabad': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad', state: 'Gujarat' },
  'naroda': { lat: 23.0697, lng: 72.6578, city: 'Ahmedabad (Naroda GIDC)', state: 'Gujarat' },
  'sanand': { lat: 22.9868, lng: 72.3814, city: 'Ahmedabad (Sanand Auto Hub)', state: 'Gujarat' },
  'surat': { lat: 21.1702, lng: 72.8311, city: 'Surat', state: 'Gujarat' },
  'vadodara': { lat: 22.3072, lng: 73.1812, city: 'Vadodara', state: 'Gujarat' },
  'baroda': { lat: 22.3072, lng: 73.1812, city: 'Vadodara', state: 'Gujarat' },
  'rajkot': { lat: 22.3039, lng: 70.8022, city: 'Rajkot', state: 'Gujarat' },
  'gandhinagar': { lat: 23.2156, lng: 72.6369, city: 'Gandhinagar', state: 'Gujarat' },
  'bhavnagar': { lat: 21.7645, lng: 72.1519, city: 'Bhavnagar', state: 'Gujarat' },
  'jamnagar': { lat: 22.4707, lng: 70.0577, city: 'Jamnagar', state: 'Gujarat' },
  'gandhidham': { lat: 23.0753, lng: 70.1337, city: 'Gandhidham', state: 'Gujarat' },
  'kandla': { lat: 23.0033, lng: 70.2189, city: 'Kandla Port', state: 'Gujarat' },
  'mundra': { lat: 22.8384, lng: 69.7231, city: 'Mundra Port', state: 'Gujarat' },
  'vapi': { lat: 20.3893, lng: 72.9106, city: 'Vapi Industrial Estate', state: 'Gujarat' },
  'ankleshwar': { lat: 21.6264, lng: 73.0152, city: 'Ankleshwar Hub', state: 'Gujarat' },
  'morbi': { lat: 22.8173, lng: 70.8370, city: 'Morbi Ceramic Hub', state: 'Gujarat' },

  // Maharashtra
  'mumbai': { lat: 18.9498, lng: 72.9515, city: 'Mumbai', state: 'Maharashtra' },
  'navi mumbai': { lat: 19.0330, lng: 73.0297, city: 'Navi Mumbai', state: 'Maharashtra' },
  'jnpt': { lat: 18.9498, lng: 72.9515, city: 'Mumbai (JNPT Port)', state: 'Maharashtra' },
  'panvel': { lat: 18.9894, lng: 73.1175, city: 'Panvel', state: 'Maharashtra' },
  'thane': { lat: 19.2183, lng: 72.9781, city: 'Thane', state: 'Maharashtra' },
  'bhiwandi': { lat: 19.2813, lng: 73.0483, city: 'Bhiwandi Logistics Hub', state: 'Maharashtra' },
  'pune': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
  'chakan': { lat: 18.7583, lng: 73.8567, city: 'Pune (Chakan Auto Cluster)', state: 'Maharashtra' },
  'lonavala': { lat: 18.7557, lng: 73.4091, city: 'Lonavala', state: 'Maharashtra' },
  'pimpri': { lat: 18.6298, lng: 73.7997, city: 'Pimpri-Chinchwad', state: 'Maharashtra' },
  'nagpur': { lat: 21.1458, lng: 79.0882, city: 'Nagpur', state: 'Maharashtra' },
  'nashik': { lat: 19.9975, lng: 73.7898, city: 'Nashik', state: 'Maharashtra' },
  'aurangabad': { lat: 19.8762, lng: 75.3433, city: 'Aurangabad (Chhatrapati Sambhajinagar)', state: 'Maharashtra' },
  'sambhajinagar': { lat: 19.8762, lng: 75.3433, city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  'kolhapur': { lat: 16.7050, lng: 74.2433, city: 'Kolhapur', state: 'Maharashtra' },
  'solapur': { lat: 17.6599, lng: 75.9064, city: 'Solapur', state: 'Maharashtra' },
  'amravati': { lat: 20.9320, lng: 77.7523, city: 'Amravati', state: 'Maharashtra' },

  // Karnataka
  'bangalore': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
  'bengaluru': { lat: 12.9716, lng: 77.5946, city: 'Bangalore', state: 'Karnataka' },
  'peenya': { lat: 13.0312, lng: 77.5186, city: 'Bangalore (Peenya)', state: 'Karnataka' },
  'electronic city': { lat: 12.8399, lng: 77.6770, city: 'Bangalore (Electronic City)', state: 'Karnataka' },
  'whitefield': { lat: 12.9698, lng: 77.7500, city: 'Bangalore (Whitefield)', state: 'Karnataka' },
  'chikkaballapur': { lat: 13.4325, lng: 77.7275, city: 'Chikkaballapur', state: 'Karnataka' },
  'mysore': { lat: 12.2958, lng: 76.6394, city: 'Mysore (Mysuru)', state: 'Karnataka' },
  'mysuru': { lat: 12.2958, lng: 76.6394, city: 'Mysuru', state: 'Karnataka' },
  'hubli': { lat: 15.3647, lng: 75.1240, city: 'Hubli-Dharwad', state: 'Karnataka' },
  'dharwad': { lat: 15.4589, lng: 75.0078, city: 'Dharwad', state: 'Karnataka' },
  'belgaum': { lat: 15.8497, lng: 74.4977, city: 'Belgaum (Belagavi)', state: 'Karnataka' },
  'belagavi': { lat: 15.8497, lng: 74.4977, city: 'Belagavi', state: 'Karnataka' },
  'mangalore': { lat: 12.9141, lng: 74.8560, city: 'Mangalore (Mangaluru)', state: 'Karnataka' },
  'mangaluru': { lat: 12.9141, lng: 74.8560, city: 'Mangaluru', state: 'Karnataka' },
  'tumkur': { lat: 13.3379, lng: 77.1173, city: 'Tumkur', state: 'Karnataka' },

  // Tamil Nadu & Kerala
  'chennai': { lat: 13.0827, lng: 80.2707, city: 'Chennai', state: 'Tamil Nadu' },
  'guindy': { lat: 13.0067, lng: 80.2025, city: 'Chennai (Guindy)', state: 'Tamil Nadu' },
  'sriperumbudur': { lat: 12.9691, lng: 79.9404, city: 'Sriperumbudur Hub', state: 'Tamil Nadu' },
  'ennore': { lat: 13.2000, lng: 80.3200, city: 'Ennore Port', state: 'Tamil Nadu' },
  'hosur': { lat: 12.7409, lng: 77.8253, city: 'Hosur', state: 'Tamil Nadu' },
  'coimbatore': { lat: 11.0168, lng: 76.9558, city: 'Coimbatore', state: 'Tamil Nadu' },
  'madurai': { lat: 9.9252, lng: 78.1198, city: 'Madurai', state: 'Tamil Nadu' },
  'salem': { lat: 11.6643, lng: 78.1460, city: 'Salem', state: 'Tamil Nadu' },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047, city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  'trichy': { lat: 10.7905, lng: 78.7047, city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  'tirupur': { lat: 11.1085, lng: 77.3411, city: 'Tirupur', state: 'Tamil Nadu' },
  'erode': { lat: 11.3410, lng: 77.7172, city: 'Erode', state: 'Tamil Nadu' },
  'tuticorin': { lat: 8.7642, lng: 78.1348, city: 'Thoothukudi (Tuticorin)', state: 'Tamil Nadu' },
  'kochi': { lat: 9.9312, lng: 76.2673, city: 'Kochi', state: 'Kerala' },
  'cochin': { lat: 9.9312, lng: 76.2673, city: 'Kochi', state: 'Kerala' },
  'thiruvananthapuram': { lat: 8.5241, lng: 76.9366, city: 'Thiruvananthapuram', state: 'Kerala' },
  'trivandrum': { lat: 8.5241, lng: 76.9366, city: 'Thiruvananthapuram', state: 'Kerala' },
  'kozhikode': { lat: 11.2588, lng: 75.7804, city: 'Kozhikode', state: 'Kerala' },
  'calicut': { lat: 11.2588, lng: 75.7804, city: 'Kozhikode', state: 'Kerala' },

  // Delhi NCR & North India
  'delhi': { lat: 28.7041, lng: 77.1025, city: 'Delhi', state: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi' },
  'kundli': { lat: 28.8741, lng: 77.1215, city: 'Delhi NCR (Kundli)', state: 'Haryana' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, city: 'Gurgaon', state: 'Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, city: 'Gurugram', state: 'Haryana' },
  'manesar': { lat: 28.3540, lng: 76.9365, city: 'Gurugram (Manesar)', state: 'Haryana' },
  'noida': { lat: 28.5355, lng: 77.3910, city: 'Noida', state: 'Uttar Pradesh' },
  'greater noida': { lat: 28.4744, lng: 77.5040, city: 'Greater Noida', state: 'Uttar Pradesh' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, city: 'Ghaziabad', state: 'Uttar Pradesh' },
  'faridabad': { lat: 28.4089, lng: 77.3178, city: 'Faridabad', state: 'Haryana' },
  'panipat': { lat: 29.3909, lng: 76.9635, city: 'Panipat', state: 'Haryana' },
  'karnal': { lat: 29.6857, lng: 76.9905, city: 'Karnal', state: 'Haryana' },
  'ambala': { lat: 30.3782, lng: 76.7767, city: 'Ambala', state: 'Haryana' },
  'chandigarh': { lat: 30.7333, lng: 76.7794, city: 'Chandigarh', state: 'Chandigarh' },
  'ludhiana': { lat: 30.9010, lng: 75.8573, city: 'Ludhiana', state: 'Punjab' },
  'amritsar': { lat: 31.6340, lng: 74.8723, city: 'Amritsar', state: 'Punjab' },
  'jalandhar': { lat: 31.3260, lng: 75.5762, city: 'Jalandhar', state: 'Punjab' },
  'baddi': { lat: 30.9578, lng: 76.7914, city: 'Baddi Pharma Cluster', state: 'Himachal Pradesh' },
  'shimla': { lat: 31.1048, lng: 77.1734, city: 'Shimla', state: 'Himachal Pradesh' },
  'haridwar': { lat: 29.9457, lng: 78.1642, city: 'Haridwar SIDCUL', state: 'Uttarakhand' },
  'dehradun': { lat: 30.3165, lng: 78.0322, city: 'Dehradun', state: 'Uttarakhand' },
  'pantnagar': { lat: 29.0208, lng: 79.4897, city: 'Pantnagar Industrial Hub', state: 'Uttarakhand' },

  // Rajasthan
  'jaipur': { lat: 26.9124, lng: 75.7873, city: 'Jaipur', state: 'Rajasthan' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, city: 'Jodhpur', state: 'Rajasthan' },
  'kota': { lat: 25.2138, lng: 75.8648, city: 'Kota', state: 'Rajasthan' },
  'udaipur': { lat: 24.5854, lng: 73.7125, city: 'Udaipur', state: 'Rajasthan' },
  'alwar': { lat: 27.5530, lng: 76.6346, city: 'Alwar', state: 'Rajasthan' },
  'bhiwadi': { lat: 28.2104, lng: 76.8606, city: 'Bhiwadi Hub', state: 'Rajasthan' },
  'neemrana': { lat: 27.9892, lng: 76.3882, city: 'Neemrana Japanese Zone', state: 'Rajasthan' },
  'ajmer': { lat: 26.4499, lng: 74.6399, city: 'Ajmer', state: 'Rajasthan' },
  'bhilwara': { lat: 25.3407, lng: 74.6313, city: 'Bhilwara Textile Hub', state: 'Rajasthan' },

  // Uttar Pradesh & Madhya Pradesh
  'lucknow': { lat: 26.8467, lng: 80.9462, city: 'Lucknow', state: 'Uttar Pradesh' },
  'kanpur': { lat: 26.4499, lng: 80.3319, city: 'Kanpur', state: 'Uttar Pradesh' },
  'agra': { lat: 27.1767, lng: 78.0081, city: 'Agra', state: 'Uttar Pradesh' },
  'varanasi': { lat: 25.3176, lng: 82.9739, city: 'Varanasi', state: 'Uttar Pradesh' },
  'allahabad': { lat: 25.4358, lng: 81.8463, city: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh' },
  'prayagraj': { lat: 25.4358, lng: 81.8463, city: 'Prayagraj', state: 'Uttar Pradesh' },
  'meerut': { lat: 28.9845, lng: 77.7064, city: 'Meerut', state: 'Uttar Pradesh' },
  'bareilly': { lat: 28.3670, lng: 79.4304, city: 'Bareilly', state: 'Uttar Pradesh' },
  'moradabad': { lat: 28.8386, lng: 78.7733, city: 'Moradabad', state: 'Uttar Pradesh' },
  'aligarh': { lat: 27.8974, lng: 78.0880, city: 'Aligarh', state: 'Uttar Pradesh' },
  'mathura': { lat: 27.4924, lng: 77.6737, city: 'Mathura', state: 'Uttar Pradesh' },
  'gorakhpur': { lat: 26.7606, lng: 83.3732, city: 'Gorakhpur', state: 'Uttar Pradesh' },
  'indore': { lat: 22.7196, lng: 75.8577, city: 'Indore', state: 'Madhya Pradesh' },
  'pithampur': { lat: 22.6146, lng: 75.6881, city: 'Indore (Pithampur Auto Hub)', state: 'Madhya Pradesh' },
  'bhopal': { lat: 23.2599, lng: 77.4126, city: 'Bhopal', state: 'Madhya Pradesh' },
  'gwalior': { lat: 26.2183, lng: 78.1828, city: 'Gwalior', state: 'Madhya Pradesh' },
  'jabalpur': { lat: 23.1815, lng: 79.9864, city: 'Jabalpur', state: 'Madhya Pradesh' },

  // East & Central India
  'kolkata': { lat: 22.5726, lng: 88.3639, city: 'Kolkata', state: 'West Bengal' },
  'howrah': { lat: 22.5958, lng: 88.2636, city: 'Howrah', state: 'West Bengal' },
  'dankuni': { lat: 22.6800, lng: 88.2900, city: 'Dankuni Logistics Park', state: 'West Bengal' },
  'durgapur': { lat: 23.5204, lng: 87.3119, city: 'Durgapur Steel Hub', state: 'West Bengal' },
  'asansol': { lat: 23.6739, lng: 86.9524, city: 'Asansol', state: 'West Bengal' },
  'siliguri': { lat: 26.7271, lng: 88.3953, city: 'Siliguri Corridor Hub', state: 'West Bengal' },
  'patna': { lat: 25.5941, lng: 85.1376, city: 'Patna', state: 'Bihar' },
  'gaya': { lat: 24.7914, lng: 85.0002, city: 'Gaya', state: 'Bihar' },
  'ranchi': { lat: 23.3441, lng: 85.3096, city: 'Ranchi', state: 'Jharkhand' },
  'jamshedpur': { lat: 22.8046, lng: 86.2029, city: 'Jamshedpur', state: 'Jharkhand' },
  'dhanbad': { lat: 23.7957, lng: 86.4304, city: 'Dhanbad', state: 'Jharkhand' },
  'bokaro': { lat: 23.6693, lng: 86.1511, city: 'Bokaro Steel City', state: 'Jharkhand' },
  'bhubaneswar': { lat: 20.2961, lng: 85.8245, city: 'Bhubaneswar', state: 'Odisha' },
  'cuttack': { lat: 20.4625, lng: 85.8828, city: 'Cuttack', state: 'Odisha' },
  'rourkela': { lat: 22.2604, lng: 84.8536, city: 'Rourkela', state: 'Odisha' },
  'paradip': { lat: 20.3164, lng: 86.6111, city: 'Paradip Port', state: 'Odisha' },
  'raipur': { lat: 21.2514, lng: 81.6296, city: 'Raipur', state: 'Chhattisgarh' },
  'bhilai': { lat: 21.1938, lng: 81.3509, city: 'Bhilai', state: 'Chhattisgarh' },
  'bilaspur': { lat: 22.0797, lng: 82.1409, city: 'Bilaspur', state: 'Chhattisgarh' },

  // Northeast & Goa
  'guwahati': { lat: 26.1445, lng: 91.7362, city: 'Guwahati', state: 'Assam' },
  'shillong': { lat: 25.5788, lng: 91.8933, city: 'Shillong', state: 'Meghalaya' },
  'agartala': { lat: 23.8315, lng: 91.2868, city: 'Agartala', state: 'Tripura' },
  'imphal': { lat: 24.8170, lng: 93.9368, city: 'Imphal', state: 'Manipur' },
  'aizawl': { lat: 23.7271, lng: 92.7176, city: 'Aizawl', state: 'Mizoram' },
  'kohima': { lat: 25.6751, lng: 94.1086, city: 'Kohima', state: 'Nagaland' },
  'itanagar': { lat: 27.0844, lng: 93.6053, city: 'Itanagar', state: 'Arunachal Pradesh' },
  'gangtok': { lat: 27.3389, lng: 88.6065, city: 'Gangtok', state: 'Sikkim' },
  'panaji': { lat: 15.4909, lng: 73.8278, city: 'Panaji (Goa)', state: 'Goa' },
  'goa': { lat: 15.4909, lng: 73.8278, city: 'Goa', state: 'Goa' },
  'mormugao': { lat: 15.4124, lng: 73.8052, city: 'Mormugao Port', state: 'Goa' }
};

// In-memory cache for resolved locations (bounded to avoid unbounded growth)
const RESOLVED_CACHE_MAX_SIZE = 1000;
const resolvedLocationCache = new Map<string, ResolvedLocation>();

function cacheResolved(key: string, value: ResolvedLocation) {
  if (!resolvedLocationCache.has(key) && resolvedLocationCache.size >= RESOLVED_CACHE_MAX_SIZE * 2) {
    // Evict oldest entries (Maps iterate in insertion order)
    const evictCount = resolvedLocationCache.size - RESOLVED_CACHE_MAX_SIZE;
    let evicted = 0;
    for (const k of resolvedLocationCache.keys()) {
      if (evicted++ >= evictCount) break;
      resolvedLocationCache.delete(k);
    }
  }
  resolvedLocationCache.set(key, value);
}

// Seed cache with known database entries
for (const [key, data] of Object.entries(INDIAN_CITIES_DATABASE)) {
  resolvedLocationCache.set(key, {
    name: data.city,
    displayName: `${data.city}, ${data.state}`,
    city: data.city,
    state: data.state,
    lat: data.lat,
    lng: data.lng
  });
}

/**
 * Normalizes an input query string into clean lowercase search tokens.
 */
export function normalizeQuery(query: string): string {
  if (!query) return '';
  return query
    .toLowerCase()
    .replace(/[,().\-_/\\[\]]/g, ' ')
    .replace(/\s+(city|town|district|dist|junction|hub|industrial\s+area|industrial\s+estate|industrial\s+zone|gidc|sidcul|midc|kiadb|sipcot|port|bypass|tollway|bypass\s+road)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Synchronously resolves a text query to real geographical coordinates using
 * the local comprehensive gazetteer.
 * Returns null if location is not recognized in the local gazetteer.
 */
export function resolveLocation(query: string): ResolvedLocation | null {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return null;
  }

  const rawClean = query.toLowerCase().trim();
  if (resolvedLocationCache.has(rawClean)) {
    return resolvedLocationCache.get(rawClean)!;
  }

  const clean = normalizeQuery(query);
  if (resolvedLocationCache.has(clean)) {
    return resolvedLocationCache.get(clean)!;
  }

  // 1. Direct exact match in gazetteer
  if (INDIAN_CITIES_DATABASE[clean]) {
    const data = INDIAN_CITIES_DATABASE[clean];
    const res: ResolvedLocation = {
      name: query.trim(),
      displayName: `${data.city}, ${data.state}`,
      city: data.city,
      state: data.state,
      lat: data.lat,
      lng: data.lng
    };
    cacheResolved(rawClean, res);
    cacheResolved(clean, res);
    return res;
  }

  // 2. Tokenized word matching (e.g. "Ahmedabad (Naroda Industrial Area)")
  const tokens = clean.split(' ').filter((t) => t.length >= 3);
  for (const token of tokens) {
    if (INDIAN_CITIES_DATABASE[token]) {
      const data = INDIAN_CITIES_DATABASE[token];
      const res: ResolvedLocation = {
        name: query.trim(),
        displayName: `${data.city}, ${data.state}`,
        city: data.city,
        state: data.state,
        lat: data.lat,
        lng: data.lng
      };
      cacheResolved(rawClean, res);
      cacheResolved(clean, res);
      return res;
    }
  }

  // 3. Substring key matching in gazetteer
  for (const [key, data] of Object.entries(INDIAN_CITIES_DATABASE)) {
    if (clean.includes(key) || (key.length >= 4 && clean.startsWith(key))) {
      const res: ResolvedLocation = {
        name: query.trim(),
        displayName: `${data.city}, ${data.state}`,
        city: data.city,
        state: data.state,
        lat: data.lat,
        lng: data.lng
      };
      cacheResolved(rawClean, res);
      cacheResolved(clean, res);
      return res;
    }
  }

  return null;
}

/**
 * Asynchronously resolves location with OpenStreetMap Nominatim live geocoder fallback.
 * Automatically caches results permanently so subsequent lookups are instant.
 */
export async function resolveLocationAsync(query: string): Promise<ResolvedLocation | null> {
  const syncRes = resolveLocation(query);
  if (syncRes) return syncRes;

  const rawClean = query.toLowerCase().trim();
  const clean = normalizeQuery(query);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1&email=returnflow-app%40example.com`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          const res: ResolvedLocation = {
            name: query.trim(),
            displayName: item.display_name?.split(',').slice(0, 3).join(',') || query.trim(),
            city: item.name || query.trim(),
            lat,
            lng
          };
          cacheResolved(rawClean, res);
          cacheResolved(clean, res);
          return res;
        }
      }
    }
  } catch (err) {
    console.warn('Live Nominatim geocoding lookup failed or timed out for:', query, err);
  }

  return null;
}

/**
 * Synchronous location validator.
 */
export function validateLocationString(query: string): { isValid: boolean; location: ResolvedLocation | null; error?: string } {
  if (!query || !query.trim()) {
    return { isValid: false, location: null, error: 'Location is required.' };
  }

  const resolved = resolveLocation(query);
  if (!resolved || isNaN(resolved.lat) || isNaN(resolved.lng) || (resolved.lat === 0 && resolved.lng === 0)) {
    return {
      isValid: false,
      location: null,
      error: `Location not recognized, please select a valid city.`
    };
  }

  return { isValid: true, location: resolved };
}

/**
 * Asynchronous location validator with live geocoder fallback.
 * Strictly rejects unresolvable locations with a clear user message.
 */
export async function validateLocationStringAsync(query: string): Promise<{ isValid: boolean; location: ResolvedLocation | null; error?: string }> {
  if (!query || !query.trim()) {
    return { isValid: false, location: null, error: 'Location is required.' };
  }

  const resolved = await resolveLocationAsync(query);
  if (!resolved || isNaN(resolved.lat) || isNaN(resolved.lng) || (resolved.lat === 0 && resolved.lng === 0)) {
    return {
      isValid: false,
      location: null,
      error: `Location not recognized, please select a valid city.`
    };
  }

  return { isValid: true, location: resolved };
}

