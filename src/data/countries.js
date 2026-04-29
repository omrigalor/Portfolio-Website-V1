// All countries present in the CPS ancestry data (cps_ready.dta).
// isoCode = ISO 3166-1 alpha-3; ancestryGroup = maps to the cultural distance matrix.

const COUNTRIES_RAW = [
  // Americas
  { isoCode: 'MEX', label: 'Mexico',              region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'CAN', label: 'Canada',               region: 'North America',       ancestryGroup: 'british' },
  { isoCode: 'PRI', label: 'Puerto Rico',          region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'CUB', label: 'Cuba',                 region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'DOM', label: 'Dominican Republic',   region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'SLV', label: 'El Salvador',          region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'COL', label: 'Colombia',             region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'BRA', label: 'Brazil',               region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'GTM', label: 'Guatemala',            region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'PER', label: 'Peru',                 region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'ECU', label: 'Ecuador',              region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'HND', label: 'Honduras',             region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'VEN', label: 'Venezuela',            region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'ARG', label: 'Argentina',            region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'NIC', label: 'Nicaragua',            region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'PAN', label: 'Panama',               region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'BOL', label: 'Bolivia',              region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'CHL', label: 'Chile',                region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'URY', label: 'Uruguay',              region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'CRI', label: 'Costa Rica',           region: 'Latin America',       ancestryGroup: 'latin_american' },
  { isoCode: 'BLZ', label: 'Belize',               region: 'Latin America',       ancestryGroup: 'latin_american' },

  // Western Europe
  { isoCode: 'GBR', label: 'United Kingdom',       region: 'Western Europe',      ancestryGroup: 'british' },
  { isoCode: 'IRL', label: 'Ireland',              region: 'Western Europe',      ancestryGroup: 'irish' },
  { isoCode: 'FRA', label: 'France',               region: 'Western Europe',      ancestryGroup: 'french' },
  { isoCode: 'DEU', label: 'Germany',              region: 'Central Europe',      ancestryGroup: 'german' },
  { isoCode: 'NLD', label: 'Netherlands',          region: 'Western Europe',      ancestryGroup: 'dutch' },
  { isoCode: 'BEL', label: 'Belgium',              region: 'Western Europe',      ancestryGroup: 'french' },
  { isoCode: 'CHE', label: 'Switzerland',          region: 'Western Europe',      ancestryGroup: 'german' },
  { isoCode: 'AUT', label: 'Austria',              region: 'Central Europe',      ancestryGroup: 'german' },

  // Northern Europe
  { isoCode: 'NOR', label: 'Norway',               region: 'Northern Europe',     ancestryGroup: 'scandinavian' },
  { isoCode: 'SWE', label: 'Sweden',               region: 'Northern Europe',     ancestryGroup: 'scandinavian' },
  { isoCode: 'DNK', label: 'Denmark',              region: 'Northern Europe',     ancestryGroup: 'scandinavian' },
  { isoCode: 'FIN', label: 'Finland',              region: 'Northern Europe',     ancestryGroup: 'scandinavian' },
  { isoCode: 'ISL', label: 'Iceland',              region: 'Northern Europe',     ancestryGroup: 'scandinavian' },

  // Southern Europe
  { isoCode: 'ITA', label: 'Italy',                region: 'Southern Europe',     ancestryGroup: 'italian' },
  { isoCode: 'ESP', label: 'Spain',                region: 'Southern Europe',     ancestryGroup: 'spanish' },
  { isoCode: 'PRT', label: 'Portugal',             region: 'Southern Europe',     ancestryGroup: 'spanish' },
  { isoCode: 'GRC', label: 'Greece',               region: 'Southern Europe',     ancestryGroup: 'greek' },
  { isoCode: 'CYP', label: 'Cyprus',               region: 'Southern Europe',     ancestryGroup: 'greek' },

  // Eastern Europe
  { isoCode: 'POL', label: 'Poland',               region: 'Eastern Europe',      ancestryGroup: 'polish' },
  { isoCode: 'RUS', label: 'Russia',               region: 'Eastern Europe',      ancestryGroup: 'russian' },
  { isoCode: 'UKR', label: 'Ukraine',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'HUN', label: 'Hungary',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'CZE', label: 'Czech Republic',       region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'SVK', label: 'Slovakia',             region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'SRB', label: 'Serbia',               region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'HRV', label: 'Croatia',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'BGR', label: 'Bulgaria',             region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'ROU', label: 'Romania',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'BLR', label: 'Belarus',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'MDA', label: 'Moldova',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'LTU', label: 'Lithuania',            region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'LVA', label: 'Latvia',               region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'EST', label: 'Estonia',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'ALB', label: 'Albania',              region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'MKD', label: 'North Macedonia',      region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },
  { isoCode: 'MNE', label: 'Montenegro',           region: 'Eastern Europe',      ancestryGroup: 'eastern_european' },

  // Middle East
  { isoCode: 'ISR', label: 'Israel',               region: 'Middle East',         ancestryGroup: 'jewish' },
  { isoCode: 'TUR', label: 'Turkey',               region: 'Middle East',         ancestryGroup: 'turkish' },
  { isoCode: 'IRN', label: 'Iran',                 region: 'Middle East',         ancestryGroup: 'persian' },
  { isoCode: 'IRQ', label: 'Iraq',                 region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'SYR', label: 'Syria',                region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'LBN', label: 'Lebanon',              region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'JOR', label: 'Jordan',               region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'EGY', label: 'Egypt',                region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'ARE', label: 'UAE',                  region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'SAU', label: 'Saudi Arabia',         region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'KWT', label: 'Kuwait',               region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'YEM', label: 'Yemen',                region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'PSE', label: 'Palestine',            region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'MAR', label: 'Morocco',              region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'DZA', label: 'Algeria',              region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'SDN', label: 'Sudan',                region: 'Middle East',         ancestryGroup: 'arab' },
  { isoCode: 'ARM', label: 'Armenia',              region: 'Middle East',         ancestryGroup: 'persian' },
  { isoCode: 'GEO', label: 'Georgia',              region: 'Middle East',         ancestryGroup: 'persian' },

  // South Asia
  { isoCode: 'IND', label: 'India',                region: 'South Asia',          ancestryGroup: 'south_asian' },
  { isoCode: 'PAK', label: 'Pakistan',             region: 'South Asia',          ancestryGroup: 'south_asian' },
  { isoCode: 'BGD', label: 'Bangladesh',           region: 'South Asia',          ancestryGroup: 'south_asian' },
  { isoCode: 'LKA', label: 'Sri Lanka',            region: 'South Asia',          ancestryGroup: 'south_asian' },
  { isoCode: 'AFG', label: 'Afghanistan',          region: 'South Asia',          ancestryGroup: 'south_asian' },

  // East Asia
  { isoCode: 'CHN', label: 'China',                region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'JPN', label: 'Japan',                region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'KOR', label: 'South Korea',          region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'TWN', label: 'Taiwan',               region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'HKG', label: 'Hong Kong',            region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'MNG', label: 'Mongolia',             region: 'East Asia',           ancestryGroup: 'east_asian' },
  { isoCode: 'KAZ', label: 'Kazakhstan',           region: 'East Asia',           ancestryGroup: 'east_asian' },

  // Southeast Asia
  { isoCode: 'PHL', label: 'Philippines',          region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'VNM', label: 'Vietnam',              region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'THA', label: 'Thailand',             region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'IDN', label: 'Indonesia',            region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'KHM', label: 'Cambodia',             region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'MMR', label: 'Myanmar',              region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'MYS', label: 'Malaysia',             region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'SGP', label: 'Singapore',            region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },
  { isoCode: 'LAO', label: 'Laos',                 region: 'Southeast Asia',      ancestryGroup: 'southeast_asian' },

  // Oceania
  { isoCode: 'AUS', label: 'Australia',            region: 'Oceania',             ancestryGroup: 'british' },
  { isoCode: 'NZL', label: 'New Zealand',          region: 'Oceania',             ancestryGroup: 'british' },
  { isoCode: 'FJI', label: 'Fiji',                 region: 'Oceania',             ancestryGroup: 'southeast_asian' },

  // Sub-Saharan Africa
  { isoCode: 'JAM', label: 'Jamaica',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'NGA', label: 'Nigeria',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'GHA', label: 'Ghana',                region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'ETH', label: 'Ethiopia',             region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'KEN', label: 'Kenya',                region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'ZAF', label: 'South Africa',         region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'UGA', label: 'Uganda',               region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'TTO', label: 'Trinidad & Tobago',    region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'GUY', label: 'Guyana',               region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'SOM', label: 'Somalia',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'SEN', label: 'Senegal',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'CMR', label: 'Cameroon',             region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'CIV', label: "Côte d'Ivoire",        region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'LBR', label: 'Liberia',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'SLE', label: 'Sierra Leone',         region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'ERI', label: 'Eritrea',              region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'COD', label: 'DR Congo',             region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'CPV', label: 'Cape Verde',           region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'TZA', label: 'Tanzania',             region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
  { isoCode: 'ZWE', label: 'Zimbabwe',             region: 'Sub-Saharan Africa',  ancestryGroup: 'african' },
];

export const COUNTRIES = [...COUNTRIES_RAW].sort((a, b) => a.label.localeCompare(b.label));

export const EDUCATION_OPTIONS = [
  { id: 'no_hs',       label: 'No High School Diploma' },
  { id: 'hs',          label: 'High School Diploma' },
  { id: 'some_college',label: 'Some College' },
  { id: 'college',     label: 'College Graduate' },
  { id: 'masters',     label: "Master's Degree" },
  { id: 'phd',         label: 'PhD / Doctoral Degree' },
];
