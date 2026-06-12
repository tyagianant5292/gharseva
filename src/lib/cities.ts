// Cities for the UAE (emirates, major cities, and popular community/area names).
export const CITIES_AE: string[] = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah", "Fujairah",
  "Umm Al Quwain", "Khor Fakkan", "Dibba Al-Fujairah", "Kalba", "Madinat Zayed",
  "Ruwais", "Liwa Oasis", "Ghayathi",
  // Popular Abu Dhabi / Dubai communities people search by:
  "Khalifa City", "Mohammed Bin Zayed City", "Al Reem Island", "Yas Island",
  "Saadiyat Island", "Mussafah", "Al Raha", "Al Bateen", "Al Khalidiyah",
  "Al Mushrif", "Al Reef", "Masdar City", "Jumeirah", "Dubai Marina",
  "Downtown Dubai", "Business Bay", "Deira", "Bur Dubai", "Al Barsha",
  "Jumeirah Lakes Towers", "Jumeirah Village Circle", "Discovery Gardens",
  "International City", "Mirdif", "Al Nahda", "Silicon Oasis",
];

// A curated list of Indian cities for search/registration autocomplete.
// (The pincode lookup can fill in any city not listed here.)
export const CITIES_IN: string[] = [
  "Mumbai", "Delhi", "New Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
  "Pune", "Jaipur", "Surat", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
  "Meerut", "Rajkot", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
  "Allahabad", "Prayagraj", "Ranchi", "Howrah", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada",
  "Jodhpur", "Madurai", "Raipur", "Kota", "Chandigarh", "Mohali", "Panchkula", "Guwahati", "Solapur",
  "Hubli", "Mysuru", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh", "Moradabad", "Gurugram",
  "Gurgaon", "Noida", "Greater Noida", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Guntur",
  "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Jamshedpur", "Bhilai", "Cuttack",
  "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela",
  "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri",
  "Jhansi", "Ulhasnagar", "Jammu", "Sangli", "Mangaluru", "Mangalore", "Erode", "Belgaum", "Ambattur",
  "Tirunelveli", "Malegaon", "Gaya", "Udaipur", "Maheshtala", "Davanagere", "Kozhikode", "Kurnool",
  "Rajpur", "Bokaro", "South Dumdum", "Bellary", "Patiala", "Gopalpur", "Agartala", "Bhagalpur",
  "Muzaffarnagar", "Bhatpara", "Panihati", "Latur", "Dhule", "Rohtak", "Korba", "Bhilwara",
  "Berhampur", "Muzaffarpur", "Ahmednagar", "Mathura", "Kollam", "Avadi", "Kadapa", "Anantapur",
  "Kamarhati", "Bilaspur", "Sambalpur", "Shahjahanpur", "Satara", "Bijapur", "Rampur", "Shivamogga",
  "Chandrapur", "Junagadh", "Thrissur", "Alwar", "Bardhaman", "Kulti", "Nizamabad", "Parbhani",
  "Tumkur", "Khammam", "Ozhukarai", "Bihar Sharif", "Panipat", "Darbhanga", "Bally", "Aizawl",
  "Dewas", "Ichalkaranji", "Tirupati", "Karnal", "Bathinda", "Rae Bareli", "Sonipat", "Hapur",
  "Haldia", "Hisar", "Yamunanagar", "Sagar", "Ratlam", "Hospet", "Ambala", "Karimnagar", "Anand",
  "Etawah", "Thoothukudi", "Rewa", "Imphal", "Anantapuram", "Catraj", "Karawal Nagar", "Shimla",
];

// Combined list (back-compat / default).
export const CITIES: string[] = [...CITIES_IN, ...CITIES_AE];

// Returns the right city list for a country code ("IN" | "AE").
export function citiesFor(country?: string | null): string[] {
  return country === "AE" ? CITIES_AE : CITIES_IN;
}
