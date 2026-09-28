import { MaritimeDepartment } from "../types";

export interface MaritimeTaxonomyItem {
  id: string;
  category: "Navigation & Bridge" | "Propulsion & Machinery" | "Power & Electrical" | "Cargo & Tanker Systems" | "Safety & LSA/FFA" | "Auxiliary & Environmental";
  department: MaritimeDepartment;
  systemName: string;
  abbreviations: string[];
  keywords: string[];
  components: string[];
  statutoryCode: string;
  governingBody: "IMO SOLAS" | "IMO MARPOL" | "Class / IACS" | "Maker Standard" | "STCW" | "MLC 2006";
  standardLimit: string;
  defaultTolerance: string;
  testInterval: "Daily" | "Weekly" | "Monthly" | "3-Monthly" | "Annual" | "Prior Departure" | "Continuous";
  primaryMakers: string[];
  commonModels: string[];
  typicalSpares: string[];
  operationalSummary: string;
}

export interface MarineAbbreviationEntry {
  abbreviation: string;
  fullName: string;
  department: MaritimeDepartment;
  category: string;
  statutoryRef: string;
  typicalParam: string;
  ocrAliases: string[];
}

export interface MarineComponentVocabulary {
  componentName: string;
  parentSystem: string;
  department: MaritimeDepartment;
  functionDescription: string;
  typicalFailureMode: string;
  maintenanceInterval: string;
}

// =========================================================================
// 1. COMPREHENSIVE STATIC MARITIME MACHINERY & SYSTEMS TAXONOMY
// =========================================================================
export const MARITIME_TAXONOMY: MaritimeTaxonomyItem[] = [
  // --- Navigation & Bridge ---
  {
    id: "tax-nav-ecdis",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "ECDIS (with backup arrangement)",
    abbreviations: ["ECDIS", "ENC", "S-57", "S-52", "CATZOC"],
    keywords: ["ecdis", "electronic chart", "fmd-3300", "fmd-3200", "fmd-3100", "chart display", "paperless navigation", "furuno ecdis", "jrc ecdis", "transas"],
    components: ["Processor Unit", "Optical Trackball", "UPS Power Supply Unit", "Presentation Library 4.0", "Security Dongle", "DGPS Interface"],
    statutoryCode: "SOLAS Ch.V Reg 19.2.10",
    governingBody: "IMO SOLAS",
    standardLimit: "Dual independent systems / 0s UPS drop / 45min battery reserve",
    defaultTolerance: "Cross-check sensor tolerance < 0.05 NM",
    testInterval: "Prior Departure",
    primaryMakers: ["Furuno Electric", "JRC (Japan Radio Co.)", "Transas / Wärtsilä", "Raytheon Anschütz", "Sperry Marine"],
    commonModels: ["FMD-3300", "FMD-3200", "JAN-9201", "Navi-Sailor 4000", "VisionMaster FT"],
    typicalSpares: ["1x Replacement Motherboard PSU 24VDC", "2x Optical Trackball Assemblies", "1x ENC Security License Dongle Backup", "1x DVI Video Cable"],
    operationalSummary: "Electronic Chart Display and Information System ensuring continuous paperless navigational situational awareness.",
  },
  {
    id: "tax-nav-radar",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "ARPA / Radar Systems (9 GHz X-Band & 3 GHz S-Band)",
    abbreviations: ["ARPA", "RADAR", "X-BAND", "S-BAND", "PM", "CPA", "TCPA"],
    keywords: ["radar", "arpa", "x-band", "s-band", "jrc", "jmr-9200", "furuno radar", "magnetron", "target tracking", "performance monitor", "scanner", "9 ghz", "3 ghz"],
    components: ["Magnetron", "Scanner Transceiver", "Antenna Turning Gear", "Performance Monitor (PM)", "Modulator PCB", "Display Processor"],
    statutoryCode: "SOLAS Ch.V Reg 19.2.3 & 19.2.7",
    governingBody: "IMO SOLAS",
    standardLimit: "2 Independent Radars (X & S Band) + ARPA tracking ≥ 100 targets",
    defaultTolerance: "Performance Monitor indicator ≥ 80% / Heading alignment < 0.5°",
    testInterval: "Prior Departure",
    primaryMakers: ["JRC (Japan Radio Co.)", "Furuno Electric", "Sperry Marine", "Kelvin Hughes", "Kongsberg"],
    commonModels: ["JMR-9200 Series", "FAR-3220 / FAR-3230", "VisionMaster FT 250", "MantaDigital"],
    typicalSpares: ["1x Spare 25kW X-Band Magnetron (M1458A)", "1x Spare 30kW S-Band Magnetron", "2x Scanner Drive Belts", "1x Scanner Power Supply PCB"],
    operationalSummary: "Dual frequency collision avoidance system for target tracking and weather clutter penetration.",
  },
  {
    id: "tax-nav-ais",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "AIS (Automatic Identification System - Class A)",
    abbreviations: ["AIS", "VHF-DSC", "SOG", "COG", "HDOP", "MMSI"],
    keywords: ["ais", "automatic identification", "transponder", "class a", "r5 supreme", "saab ais", "furuno fa-170", "pilot plug", "mmsi"],
    components: ["VHF Transceiver Unit", "GPS Antenna Sensor", "Pilot Plug Interface", "Display & Control Unit (MKD)", "Power Filter PCB"],
    statutoryCode: "SOLAS Ch.V Reg 19.2.4",
    governingBody: "IMO SOLAS",
    standardLimit: "Continuous Broadcast on Ch 87B & 88B / Power 12.5W / VSWR < 1.5",
    defaultTolerance: "Position reporting interval 2s to 3min depending on vessel dynamics",
    testInterval: "Continuous",
    primaryMakers: ["Saab TransponderTech", "Furuno Electric", "JRC", "Simrad / Navico", "Em-trak"],
    commonModels: ["R5 SUPREME Class A", "FA-170", "JHS-183", "V5035 Class A"],
    typicalSpares: ["1x Spare VHF Antenna Whip", "1x Power & Data Cable Assembly", "1x Pilot Plug Interface Adapter", "1x Internal Fuse Set"],
    operationalSummary: "Automatic broadcast of dynamic navigational data, voyage details, and static vessel identification.",
  },
  {
    id: "tax-nav-gyro",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "Master Gyrocompass & Repeater Distribution",
    abbreviations: ["GYRO", "STEP", "SYNCHRO", "ROT", "HDG"],
    keywords: ["gyro", "gyrocompass", "std 22", "repeater", "heading sensor", "gyrosphere", "anschutz", "tokyo keiki", "sperry navigat"],
    components: ["Gyrosphere Sensitive Element", "Supporting Fluid & Pump", "Step/Synchro Repeater Amplifier", "Flux Gate Sensor", "Master Distribution Unit"],
    statutoryCode: "SOLAS Ch.V Reg 19.2.5",
    governingBody: "IMO SOLAS",
    standardLimit: "Heading settling error ≤ 0.5° x sec(Lat) / 0° drift during sea passage",
    defaultTolerance: "Repeater synchronization error < 0.2°",
    testInterval: "Daily",
    primaryMakers: ["Raytheon Anschütz", "Tokyo Keiki", "Sperry Marine", "Yokogawa", "Simrad"],
    commonModels: ["Standard 22", "TG-8000", "NAVIGAT X MK 1", "CMZ-900"],
    typicalSpares: ["1x Gyro Supporting Liquid Container", "1x Gyrosphere Replacement Element", "2x Pump Drive Belts", "1x Centering Pin Set"],
    operationalSummary: "True north-seeking inertial heading reference system feeding ECDIS, Radar, Autopilot, and AIS.",
  },
  {
    id: "tax-nav-vdr",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "Voyage Data Recorder (VDR / S-VDR)",
    abbreviations: ["VDR", "S-VDR", "EPIRB-VDR", "HRP", "FRC", "NMEA"],
    keywords: ["vdr", "voyage data recorder", "capsule", "vr-7000", "black box", "protective capsule", "acoustic beacon", "audio mixer"],
    components: ["Fixed Protective Capsule", "Float-Free Capsule", "Acoustic Locator Beacon (PT9)", "Bridge Audio Microphone Unit", "Main Processing Unit (DAU)"],
    statutoryCode: "SOLAS Ch.V Reg 20",
    governingBody: "IMO SOLAS",
    standardLimit: "48 hours continuous multi-channel loop recording with zero dropout",
    defaultTolerance: "Annual Performance Test (APT) Class Certificate mandatory",
    testInterval: "Annual",
    primaryMakers: ["Furuno Electric", "Consilium / MacGregor", "JRC", "Danelec Marine", "Netwave Systems"],
    commonModels: ["VR-7000", "F2 VDR", "JCY-1900", "DM100 VDR", "NW-6000"],
    typicalSpares: ["1x Acoustic Underwater Locator Beacon Battery", "1x Audio Mixer Interface PCB", "1x Float-Free HRU Kit", "1x Backup SSD Drive"],
    operationalSummary: "Continuous recording of bridge audio, radar imagery, VHF comms, heading, engine orders, and hull stress.",
  },
  {
    id: "tax-nav-gmdss",
    category: "Navigation & Bridge",
    department: "Deck",
    systemName: "GMDSS Radio Communication Suite (VHF / MF-HF / EPIRB / SART)",
    abbreviations: ["GMDSS", "VHF", "DSC", "MF/HF", "EPIRB", "SART", "NAVTEX", "INMARSAT", "NBDP"],
    keywords: ["gmdss", "vhf dsc", "mf hf", "epirb", "sart", "navtex", "inmarsat-c", "sailor 6000", "cobham", "jrc gmdss", "furuno rc-1800"],
    components: ["VHF DSC Transceiver (Ch 70/16)", "MF/HF 150W/250W Transceiver", "Inmarsat-C Terminal", "NAVTEX Receiver 518 kHz", "406 MHz EPIRB", "9 GHz Radar SART"],
    statutoryCode: "SOLAS Ch.IV Reg 7-14",
    governingBody: "IMO SOLAS",
    standardLimit: "Antenna VSWR < 1.5 / Emergency reserve battery bank runtime > 8 hours",
    defaultTolerance: "Daily DSC self-test & weekly test calls to coast stations",
    testInterval: "Daily",
    primaryMakers: ["Sailor / Cobham", "Furuno Electric", "JRC", "Sam Electronics", "Icom"],
    commonModels: ["Sailor 6000 Series", "RC-1800F", "JSS-2150 / JHS-800", "IC-M803"],
    typicalSpares: ["1x EPIRB HRU Hydrostatic Release Unit", "1x SART Battery Pack", "2x GMDSS Handheld Two-Way Emergency Batteries", "1x 24VDC Charger PCB"],
    operationalSummary: "Global distress alerting, search and rescue coordination, and maritime safety information reception.",
  },

  // --- Propulsion & Main Machinery ---
  {
    id: "tax-eng-me",
    category: "Propulsion & Machinery",
    department: "Engine",
    systemName: "Main Engine Propulsion Unit",
    abbreviations: ["M/E", "ME-C", "RT-FLEX", "T/C", "PMAX", "PCOMP", "FIVA", "ELFI", "HCU"],
    keywords: ["main engine", "man b&w", "wingd", "wartsila", "2-stroke", "scavenge fire", "cylinder liner", "crosshead", "exhaust valve", "fuel injector", "piston rod"],
    components: ["Exhaust Valve Actuator", "Hydraulic Cylinder Unit (HCU)", "FIVA / ELFI Valve", "Cylinder Liner Lubricator Quills", "Piston Crown Rings", "Scavenge Air Cooler"],
    statutoryCode: "SOLAS Ch.II-1 Reg 26 & Ch.II-2 Reg 4.2",
    governingBody: "IMO SOLAS",
    standardLimit: "Scavenge box temp < 180°C / Jacket cooling water 80-85°C / Exhaust dev ± 25°C",
    defaultTolerance: "Pmax cylinder balance tolerance within ± 3.0 bar",
    testInterval: "Continuous",
    primaryMakers: ["MAN Energy Solutions", "WinGD (Winterthur Gas & Diesel)", "Wärtsilä", "Hyundai Heavy Industries", "Mitsui E&S"],
    commonModels: ["6S60ME-C9.5", "G70ME-C10.5", "X62 / X72 Dual Fuel", "RT-flex50", "6L50MC"],
    typicalSpares: ["1x Complete Exhaust Valve Assembly", "2x High-Pressure Fuel Injectors", "1x Cylinder Liner Lubricator Quill", "1x Piston Ring Set (CPR)"],
    operationalSummary: "Primary two-stroke crosshead diesel / dual-fuel engine providing direct shaft propulsion power.",
  },
  {
    id: "tax-eng-boiler",
    category: "Propulsion & Machinery",
    department: "Engine",
    systemName: "Auxiliary Marine Boiler & Steam Generation System",
    abbreviations: ["BOILER", "ECONOMIZER", "EGE", "TDS", "LWCO", "BFW"],
    keywords: ["auxiliary boiler", "boiler", "steam drum", "burner", "kangrim", "aalborg", "miura", "economizer", "flame eye", "feedwater", "low water level trip"],
    components: ["Steam Drum", "Rotary Burner Unit", "Flame Eye Photocell", "Low Water Cut-Off (LWCO) Electrodes", "Safety Spring Relief Valves", "Feedwater Multistage Pump"],
    statutoryCode: "SOLAS Ch.II-1 Reg 32 & Class / IACS Rules",
    governingBody: "Class / IACS",
    standardLimit: "Working steam pressure 7.5 - 9.0 bar / Low-Low Water level trip < 15 seconds",
    defaultTolerance: "Boiler water chlorides < 30 ppm / Phosphate 20 - 40 ppm",
    testInterval: "Weekly",
    primaryMakers: ["Alfa Laval / Aalborg", "Kangrim Heavy Industries", "Miura Co.", "Osaka Boiler", "SAACKE"],
    commonModels: ["Aalborg OS-TCi", "Kangrim PB-Series", "Miura VWS-Series", "SAACKE SKVJ"],
    typicalSpares: ["2x Flame Eye Photocells", "1x Safety Valve Spring & Seat Kit", "2x Ignition Electrodes", "1x Water Level Gauge Glass Tube"],
    operationalSummary: "Heavy oil fuel heating, cargo tank heating, and steam atomization generation system.",
  },
  {
    id: "tax-eng-purifier",
    category: "Propulsion & Machinery",
    department: "Engine",
    systemName: "Fuel Oil & Lube Oil Centrifugal Purifier / Separator",
    abbreviations: ["PURIFIER", "SEPARATOR", "HFO", "MDO", "L.O.", "EPC", "ALCAP"],
    keywords: ["purifier", "separator", "alfa laval purifier", "puretransfer", "alcap", "mitsubishi sj", "westfalia", "bowl disc stack", "water transducer", "deslag"],
    components: ["Centrifugal Bowl Disc Stack", "Operating Water Sliding Bowl", "Water Transducer (WT-200)", "EPC-60 / EPC-50 Controller", "Feed Pump", "Solenoid Water Block"],
    statutoryCode: "SOLAS Ch.II-2 Reg 4.2 & Maker Standard",
    governingBody: "Maker Standard",
    standardLimit: "Separation temperature 98°C ± 2°C (HFO) / Effluent water content < 0.05%",
    defaultTolerance: "Sludge discharge cycle interval 2 to 4 hours based on viscosity",
    testInterval: "Continuous",
    primaryMakers: ["Alfa Laval", "Mitsubishi Kakoki Kaisha (MKK)", "GEA Westfalia", "Samgong"],
    commonModels: ["PureTransfer FOPX / S-900", "Mitsubishi Selfjector SJ-G Series", "GEA OSE-Series"],
    typicalSpares: ["1x Bowl O-Ring Overhaul Gasket Kit", "1x Water Solenoid Valve Block", "2x Friction Clutch Shoes", "1x Gravity Disc Set"],
    operationalSummary: "High-speed centrifugal separation of water and catalytic fines from bunker fuels and engine lube oils.",
  },
  {
    id: "tax-eng-compressor",
    category: "Propulsion & Machinery",
    department: "Engine",
    systemName: "Main Starting Air Compressor & Air Receiver",
    abbreviations: ["COMPRESSOR", "AIR REC", "START AIR", "BAR", "HP", "LP"],
    keywords: ["compressor", "starting air", "tanabe", "sperre", "hatlapa", "air receiver", "unloader valve", "relief valve", "bursting disc", "30 bar"],
    components: ["LP/HP Piston & Connecting Rods", "Plate Suction/Discharge Valves", "Intercooler / Aftercooler Tubes", "Automatic Moisture Drain Trap", "Safety Relief Valve"],
    statutoryCode: "SOLAS Ch.II-1 Reg 34",
    governingBody: "IMO SOLAS",
    standardLimit: "30.0 bar receiver pressure / Minimum 12 consecutive starts without recharge",
    defaultTolerance: "Relief valve lifting pressure 33.0 bar (Max +10%)",
    testInterval: "Monthly",
    primaryMakers: ["Tanabe Pneumatic", "Sperre Air", "Hatlapa / MacGregor", "J.P. Sauer & Sohn", "Yanmar"],
    commonModels: ["Tanabe H-73 / H-74", "Sperre HL2/140", "Hatlapa W-Series", "Sauer WP4351"],
    typicalSpares: ["2x Suction & Discharge Valve Plate Sets", "1x LP & HP Piston Ring Set", "1x Crankcase Mechanical Seal", "1x Solenoid Drain Coil"],
    operationalSummary: "Multi-stage reciprocating compression generating 30 bar stored starting air for propulsion machinery.",
  },

  // --- Auxiliary & Environmental ---
  {
    id: "tax-env-ows",
    category: "Auxiliary & Environmental",
    department: "Engine",
    systemName: "Oily Water Separator (15 PPM Bilge Alarm & Separator)",
    abbreviations: ["OWS", "15PPM", "OCM", "BILGE", "MARPOL-I", "3-WAY"],
    keywords: ["ows", "oily water", "15ppm", "bilge separator", "bilgemate", "15 ppm", "cleanoil", "purebilge", "deckma", "ocm-15", "bilgemon 488", "3-way divert"],
    components: ["Coalescer Filter Cartridge", "15 PPM Optical Bilge Alarm Monitor (Deckma)", "Automatic 3-Way Recirculation Divert Valve", "Oil Level Sensor Probe", "Bilge Feed Pump"],
    statutoryCode: "MARPOL Annex I Reg 14 (MEPC.107(49))",
    governingBody: "IMO MARPOL",
    standardLimit: "Instantaneous effluent oil content ≤ 15 PPM / Automatic 3-way divert valve trip",
    defaultTolerance: "Bilge alarm calibration validity certificate mandatory (5-year renewal)",
    testInterval: "Prior Departure",
    primaryMakers: ["Alfa Laval", "Deckma Hamburg", "RWO Marine Water", "Victor Marine", "Hanyoung / Georim"],
    commonModels: ["PureBilge 2500", "OMD-24 / OMD-2008 Bilge Alarm", "RWO Veolia OWS-COM", "Victor MiniSep"],
    typicalSpares: ["1x 15PPM Sensor Measuring Glass Cell", "1x Descaling Cell Cleaning Chemical Solution", "2x Solenoid 3-Way Valves", "1x Coalescer Pack"],
    operationalSummary: "Certified statutory treatment unit preventing discharge of machinery bilge water exceeding 15 PPM oil content.",
  },
  {
    id: "tax-env-stp",
    category: "Auxiliary & Environmental",
    department: "Engine",
    systemName: "Sewage Treatment Plant (STP / Marine Sanitation Device)",
    abbreviations: ["STP", "MSD", "MARPOL-IV", "BOD", "COD", "TSS", "CHLORINE"],
    keywords: ["sewage", "treatment plant", "sanitary", "marichem", "vacuum toilet", "hamworthy stp", "membrane reactor", "aeration blower", "effluent pump", "chlorinator"],
    components: ["Aeration Tank & Diffuser Blower", "Settling Tank Clarifier", "Disinfection Chlorinator / UV Unit", "Discharge Macerator Pump", "Screen Basket Strainer"],
    statutoryCode: "MARPOL Annex IV Reg 9 (MEPC.227(64))",
    governingBody: "IMO MARPOL",
    standardLimit: "Coliform < 100 cfu/100ml / TSS < 35 mg/L / BOD5 < 25 mg/L / Residual Cl < 0.5 mg/L",
    defaultTolerance: "Continuous aerobic bacterial digestion",
    testInterval: "Monthly",
    primaryMakers: ["Hamworthy / Wärtsilä", "Evac Marine", "Rochem Marine", "ACO Marine", "Jonghwa"],
    commonModels: ["Super Trident ST3A", "Evac MBR (Membrane Bioreactor)", "ACO Clarimar MF", "Bio-Compact"],
    typicalSpares: ["1x Aeration Blower Diaphragm Set", "1x Chlorinator Tablet Dosing Kit", "1x Discharge Macerator Impeller", "1x Air Filter Element"],
    operationalSummary: "Biological/membrane digestion treating black and grey sanitary water before safe ocean discharge.",
  },
  {
    id: "tax-env-fwg",
    category: "Auxiliary & Environmental",
    department: "Engine",
    systemName: "Freshwater Generator (Reverse Osmosis / Vacuum Plate Evaporator)",
    abbreviations: ["FWG", "RO", "PPM", "TDS", "SALINOMETER", "EJECTOR"],
    keywords: ["freshwater generator", "ro plant", "evaporator", "salinometer", "alfa laval aqua", "nirex", "sondex", "distillate pump", "vacuum ejector", "titanium plates"],
    components: ["Titanium Plate Evaporator/Condenser Pack", "Sea Water Vacuum Ejector Nozzle", "Salinometer Conductivity Sensor", "Distillate Dump Solenoid Valve", "Distillate Transfer Pump"],
    statutoryCode: "WHO Maritime Sanitation & Class Rules",
    governingBody: "Class / IACS",
    standardLimit: "Distillate salinity < 10 PPM (Evaporator) / Chlorides < 200 ppm / TDS < 500 (RO)",
    defaultTolerance: "Automatic dump solenoid trips if salinity exceeds 10 PPM",
    testInterval: "Daily",
    primaryMakers: ["Alfa Laval (Nirex)", "Sondex / Danfoss", "Cathelco / Evac RO", "GEA Westfalia", "Parker Sea Recovery"],
    commonModels: ["AQUA Blue Single-Plate", "JWP-26-C80 / JWP-16", "Sondex SFO-Series", "Aqua Whisper RO"],
    typicalSpares: ["1x Salinometer Electrode Probe", "2x Titanium Heat Exchanger Gaskets", "1x Water Ejector Nozzle Kit", "1x Distillate Mechanical Seal"],
    operationalSummary: "Utilizes waste main engine jacket water heat or RO membranes to produce potable water from seawater.",
  },
  {
    id: "tax-env-incinerator",
    category: "Auxiliary & Environmental",
    department: "Engine",
    systemName: "Shipboard Marine Waste & Sludge Incinerator",
    abbreviations: ["INCINERATOR", "SLUDGE", "MARPOL-VI", "MEPC.76(40)", "FLUE GAS"],
    keywords: ["incinerator", "sludge burner", "teamtec", "waste disposal", "flue gas temp", "combustion chamber", "sludge dosing pump", "flame scanner", "pilot burner"],
    components: ["Primary Combustion Chamber", "Sludge Burning Atomizing Lance", "Pilot Diesel Burner", "Flue Gas High-Temp Thermocouple", "Induced Draft ID Exhaust Fan"],
    statutoryCode: "MARPOL Annex VI Reg 16 (MEPC.76(40))",
    governingBody: "IMO MARPOL",
    standardLimit: "Combustion chamber temperature 850°C - 1200°C / Flue gas exit < 350°C",
    defaultTolerance: "Prohibited inside port limits, ECAs, and within 12 NM from nearest land",
    testInterval: "Prior Departure",
    primaryMakers: ["TeamTec", "Atlas Incinerators", "Kangrim Heavy", "Miura", "Sunflame"],
    commonModels: ["GS500C", "Titan 1000", "KFB-Series", "Miura BGX-Series"],
    typicalSpares: ["2x High-Temp Thermocouples (K-Type)", "1x Sludge Dosing Pump Stator", "1x Flue Gas Optical Flame Detector", "1x Ignition Transformer"],
    operationalSummary: "Thermal destruction of waste engine lube oils, separator sludge, and dry operational waste onboard.",
  },

  // --- Cargo & Tanker Systems ---
  {
    id: "tax-crg-igs",
    category: "Cargo & Tanker Systems",
    department: "Cargo",
    systemName: "Inert Gas System (IGS) & Scrubber Tower",
    abbreviations: ["IGS", "IGG", "O2", "MMWG", "DWS", "PV BREAKER", "DEMISTER"],
    keywords: ["inert gas", "igs", "scrubber", "deck water seal", "flue gas", "inert gas generator", "zirconia o2", "pv breaker", "deck isolating valve", "soot separator"],
    components: ["Flue Gas Scrubber Tower", "Deck Water Seal (Wet/Semi-Dry)", "Dual High-Precision Zirconia O2 Analysers", "P/V Liquid Breaker", "Deck Non-Return Valve (NRV)", "IG Blower Blowers"],
    statutoryCode: "SOLAS Ch.II-2 Reg 4.5.5 & FSS Code Ch 15",
    governingBody: "IMO SOLAS",
    standardLimit: "Oxygen content < 5.0% by volume at main / Deck line positive pressure > +200 mmWG",
    defaultTolerance: "High O2 trip alarm activates at ≥ 8.0% O2 by volume",
    testInterval: "Prior Departure",
    primaryMakers: ["Wärtsilä / Moss Maritime", "Alfa Laval / Smit Gas", "Kangrim", "Air Liquide", "Scanjet"],
    commonModels: ["Moss Flue Gas Plant 10,000 m3/h", "Smit IG Generator", "Kangrim KIGS-Series"],
    typicalSpares: ["2x Zirconia O2 Sensor Probes (ZR22G)", "1x Deck Seal Demister Pad", "1x Scrubber DP Transmitter", "1x Calibration Gas Span Cylinder (1.0% O2)"],
    operationalSummary: "Renders cargo oil tanks non-combustible by supplying low-oxygen flue gas or inert gas generator output.",
  },
  {
    id: "tax-crg-cow",
    category: "Cargo & Tanker Systems",
    department: "Cargo",
    systemName: "Crude Oil Washing (COW) System",
    abbreviations: ["COW", "MARPOL-I", "BAR", "TCM", "O2 TANK", "ISGOTT"],
    keywords: ["cow", "crude oil washing", "tank cleaning machine", "wash line", "gunclean", "toftejorg", "shadow diagram", "drive unit", "nozzle pressure"],
    components: ["Single/Dual Nozzle Programmable Cleaning Machines", "COW Wash Supply Main", "Drive Unit Turbine / Air Motor", "Oxygen Level Interlock Transducer", "Stripping Ejector"],
    statutoryCode: "MARPOL Annex I Reg 33 & 35",
    governingBody: "IMO MARPOL",
    standardLimit: "Supply pressure > 8.0 bar / Tank atmosphere O2 < 8.0% by volume throughout washing",
    defaultTolerance: "100% of tank vertical and horizontal surfaces covered per shadow diagrams",
    testInterval: "Prior Departure",
    primaryMakers: ["Alfa Laval / Gunclean Toftejorg", "Scanjet Marine", "Victor Pyrate", "Dasic Marine"],
    commonModels: ["Dual Nozzle Programmable TZ-82", "Scanjet SC-30T", "VP Monomatic"],
    typicalSpares: ["4x PTFE Drive Gear Rings", "2x Turbine Impeller Shafts", "6x High-Pressure Flange Gasket Sets", "1x Nozzle Bevel Gear Kit"],
    operationalSummary: "High-pressure crude oil washing of cargo tanks during discharge to prevent heavy wax accumulation and sludge deposits.",
  },
  {
    id: "tax-crg-odmcs",
    category: "Cargo & Tanker Systems",
    department: "Cargo",
    systemName: "Oil Discharge Monitoring & Control System (ODMCS / ODME)",
    abbreviations: ["ODMCS", "ODME", "L/NM", "PPM", "GPS", "MEPC.108(49)", "OVERBOARD"],
    keywords: ["odmcs", "oil discharge", "oil monitor", "ppm monitor", "clean ballast", "rivertrace", "smart odme", "flowmeter", "instantaneous rate", "30 l/nm"],
    components: ["Optical Turbidity Measuring Cell", "Sample Extraction High-Speed Pump", "Electromagnetic Overboard Flowmeter", "GPS Vessel Speed & Position Interface", "Motorized Overboard Valve Interlock"],
    statutoryCode: "MARPOL Annex I Reg 31 (MEPC.108(49))",
    governingBody: "IMO MARPOL",
    standardLimit: "Instantaneous rate ≤ 30 Litres / Nautical Mile / Total quantity ≤ 1/30,000 of cargo",
    defaultTolerance: "Discharge permitted strictly en route > 50 NM from nearest land",
    testInterval: "Prior Departure",
    primaryMakers: ["Rivertrace Engineering", "Seil Seres", "VAF Instruments", "Fellows"],
    commonModels: ["Smart ODME 2005", "SS-107", "VAF Oilcon Mark 6"],
    typicalSpares: ["1x Optical Quartz Measuring Cell", "1x Sample Pump Rebuild Kit", "1x Calibration Verification Standard Solution", "1x Solenoid Flushing Valve"],
    operationalSummary: "Enforces statutory discharge limits for slop tank effluent and dirty ballast water discharges.",
  },
  {
    id: "tax-crg-pv",
    category: "Cargo & Tanker Systems",
    department: "Cargo",
    systemName: "High-Velocity Pressure-Vacuum (P/V) Relief Valve & Mast Riser",
    abbreviations: ["PV VALVE", "P/V", "MMWG", "FLAME ARRESTER", "VOC", "HIGH VELOCITY"],
    keywords: ["pv valve", "pressure vacuum", "high-velocity", "venting", "flame arrester", "pres-vac", "voc venting", "mast riser", "vacuum disc", "bullet valve"],
    components: ["High-Velocity Pressure Poppet Disc", "Vacuum Disc & Counterweight", "Stainless Steel Flame Screen Gauze", "Manual Lifting Check Lever", "Flame Proof Housing"],
    statutoryCode: "SOLAS Ch.II-2 Reg 4.5.3 & Reg 11.6",
    governingBody: "IMO SOLAS",
    standardLimit: "Pressure opening: +1400 to +2000 mmWG / Vacuum opening: -350 to -500 mmWG",
    defaultTolerance: "Efflux velocity ≥ 30 m/s to throw vapors clear of deck level",
    testInterval: "Prior Departure",
    primaryMakers: ["Pres-Vac Engineering", "Bayham / Stanhope", "Scanjet", "Tanktech", "Sewon"],
    commonModels: ["Type HS-ISO High Velocity P/V", "Pres-Vac HV-Series", "Tanktech TV-Series"],
    typicalSpares: ["2x Teflon Pressure Disc Bushings", "1x Stainless Flame Screen Set (SUS316)", "1x Counterweight Bearing Assembly", "2x Weather Hood O-Rings"],
    operationalSummary: "Maintains cargo tank ullage space pressure within structural limits while preventing flame ingress.",
  },
  {
    id: "tax-crg-bwts",
    category: "Cargo & Tanker Systems",
    department: "Cargo",
    systemName: "Ballast Water Management System (BWMS / BWTS)",
    abbreviations: ["BWMS", "BWTS", "BWM", "D-2", "TRO", "UV", "M3/H", "FILTER"],
    keywords: ["bwts", "bwms", "ballast water", "filter safe", "uv reactor", "tro sensor", "pureballast", "oceanlux", "hyundai hihas", "tro neutralizer", "backwash"],
    components: ["Automatic 40-50µm Backwash Filter Screen", "Medium/Low-Pressure UV Reactor Chamber", "Total Residual Oxidant (TRO) Sensor", "Chemical Neutralizer Dosing Pump", "Flowmeter Transmitter"],
    statutoryCode: "IMO BWM Convention Reg D-2",
    governingBody: "IMO MARPOL",
    standardLimit: "Organisms ≥ 50µm: < 10/m3 / Organisms 10-50µm: < 10/ml / E. coli < 250 cfu/100ml",
    defaultTolerance: "Mandatory D-2 Ballast Water Record Book logging",
    testInterval: "Continuous",
    primaryMakers: ["Alfa Laval", "Optimarin", "Hyundai Heavy (HiBallast)", "Panasia", "Wärtsilä (Aquarius)"],
    commonModels: ["PureBallast 3.2 Ultra", "OBS Optimarin 1000", "HiBallast 1500 m3/h", "Panasia GloEn-Patrol"],
    typicalSpares: ["2x Medium-Pressure UV Lamps", "1x Automatic Backwash Filter Mesh Sleeve", "1x TRO Sensor Reagent Kit", "2x Quartz Sleeve Cleaning Wipers"],
    operationalSummary: "Treats uptake and discharge ballast water to eliminate harmful aquatic invasive species.",
  },

  // --- Power & Electrical ---
  {
    id: "tax-elec-edg",
    category: "Power & Electrical",
    department: "Electrical",
    systemName: "Emergency Diesel Generator & Emergency Switchboard (EDG/ESB)",
    abbreviations: ["EDG", "ESB", "AVR", "BLACKOUT", "KVA", "KW", "440V", "45S"],
    keywords: ["emergency generator", "emg gen", "emergency switchboard", "blackout", "auto-start", "cummins edg", "stamford", "woodward", "secondary starting", "45 seconds"],
    components: ["Diesel Engine Prime Mover", "Brushless Alternator", "Automatic Voltage Regulator (AVR)", "Dual Starting Systems (Primary Electric / Secondary Hydraulic)", "Auto-Mains Failure Bus Coupler"],
    statutoryCode: "SOLAS Ch.II-1 Reg 42 & 43",
    governingBody: "IMO SOLAS",
    standardLimit: "Auto-start and supply all emergency bus circuits in ≤ 45 seconds after blackout",
    defaultTolerance: "Continuous fuel runtime ≥ 18 hours (cargo vessels) / 36 hours (passenger vessels)",
    testInterval: "Weekly",
    primaryMakers: ["Cummins / Stamford", "Caterpillar (CAT)", "Yanmar", "MAN", "Leroy-Somer"],
    commonModels: ["KTA19-D(M1) / 350 kVA", "CAT C18 ACERT", "Yanmar 6HAL2", "Stamford HCM434F"],
    typicalSpares: ["1x 24VDC Heavy Duty Starter Motor", "1x Hydraulic / Spring Secondary Starter Unit", "1x Digital AVR Board (SX460/MX321)", "2x Fuel Filter Cartridges"],
    operationalSummary: "Independent emergency power source driving emergency fire pumps, steering gear, bridge radios, and emergency lighting.",
  },
  {
    id: "tax-elec-msb",
    category: "Power & Electrical",
    department: "Electrical",
    systemName: "Main Switchboard (440V / 6.6kV) & Power Management System (PMS)",
    abbreviations: ["MSB", "PMS", "ACB", "MCCB", "PREFERENTIAL TRIP", "BUSBAR", "EARTH FAULT"],
    keywords: ["main switchboard", "msb", "pms", "air circuit breaker", "acb", "preferential trip", "busbar", "earth fault", "440v", "megger", "synchronizing"],
    components: ["Air Circuit Breaker (ACB 2000A)", "Preferential Trip Relays (Stage 1/2)", "440V/220V Insulation Resistance Monitor", "Automatic Generator Synchronizer", "Reverse Power Relay"],
    statutoryCode: "SOLAS Ch.II-1 Reg 40 & 41 & Class Rules",
    governingBody: "Class / IACS",
    standardLimit: "Busbar insulation resistance > 1.0 MΩ / Reverse power trip: 5-10% in 3-5 sec",
    defaultTolerance: "Preferential non-essential trip activates on 110% overload after 10s",
    testInterval: "Monthly",
    primaryMakers: ["Schneider Electric", "ABB", "Terasaki Electric", "Siemens", "Hyundai Electric"],
    commonModels: ["Terasaki TemPower2 ACB", "ABB Emax2", "Schneider Masterpact MTZ", "Siemens SIVACON"],
    typicalSpares: ["1x ACB Under-Voltage Trip Coil", "1x Electronic Trip Relay Unit (ETU)", "2x 440V Potential Indicator Lamps", "1x Insulation Monitor Transducer"],
    operationalSummary: "Central distribution hub receiving generator power, providing automatic load sharing, synchronizing, and fault clearing.",
  },

  // --- Safety & LSA/FFA ---
  {
    id: "tax-saf-co2",
    category: "Safety & LSA/FFA",
    department: "Safety_ISM",
    systemName: "Fixed High-Pressure CO2 Total Flooding Fire Suppression System",
    abbreviations: ["CO2", "FFA", "FSS", "FSS-CH5", "TOTAL FLOODING", "PILOT", "PNEUMATIC"],
    keywords: ["fixed co2", "co2 system", "fire suppression", "co2 bank", "total flooding", "nk co2", "pilot cylinder", "time delay cabinet", "quick release", "weighing device"],
    components: ["High-Pressure 45kg CO2 Cylinder Bank", "Pilot Nitrogen / CO2 Actuator Cylinder", "Time-Delay Pneumatic Siren Cabinet", "Main Manifold Directional Distribution Valves", "Main Line Safety Relief Valve"],
    statutoryCode: "SOLAS Ch.II-2 Reg 10.4 & FSS Code Ch 5",
    governingBody: "IMO SOLAS",
    standardLimit: "Cylinder weight loss < 5% / Discharge 85% of gas into machinery space in < 2 minutes",
    defaultTolerance: "Pneumatic pre-discharge audible alarm minimum 20 seconds warning",
    testInterval: "Monthly",
    primaryMakers: ["NK Co. Ltd", "Survitec / Wilhelmsen", "Kidde Fire Systems", "Minimax", "Kashiwa"],
    commonModels: ["NK HP-CO2 System", "Unitor CO2 Total Flooding", "Kidde Marine CO2", "Minimax Marine"],
    typicalSpares: ["10x CO2 Flexible High-Pressure Loop Hoses", "2x Pilot Cylinder Puncture Actuators", "4x Cylinder Valve Bursting Disc Sets", "2x Main Line Pressure Switches"],
    operationalSummary: "Total flooding inert extinguishing medium designed to extinguish catastrophic engine room, cargo pump room, or hold fires.",
  },
  {
    id: "tax-saf-efp",
    category: "Safety & LSA/FFA",
    department: "Safety_ISM",
    systemName: "Emergency Fire Pump & Fire Main System",
    abbreviations: ["EFP", "FFA", "SOLAS-II-2", "BAR", "HYDRANT", "HOSE", "SELF-PRIMING"],
    keywords: ["emergency fire pump", "fire pump", "el f fire", "fire main", "desmi", "shinko", "taiko", "self-priming", "fire hydrant", "jet pressure"],
    components: ["Vertical Centrifugal Pump Impeller", "Self-Priming Air Ejector / Vacuum Primer", "Diesel Engine / Dedicated Electric Motor", "Suction Sea Chest Strainer", "Fire Main Non-Return Isolation Valve"],
    statutoryCode: "SOLAS Ch.II-2 Reg 10.2.2.3",
    governingBody: "IMO SOLAS",
    standardLimit: "Discharge pressure > 3.2 bar at 2 furthest hydrants (cargo ships ≥ 6,000 GT)",
    defaultTolerance: "Pump must deliver minimum 25 m3/h at rated head from light ballast draft",
    testInterval: "Weekly",
    primaryMakers: ["Desmi", "Shinko Industries", "Taiko Kikai", "Hamworthy Pumps", "Iron Pump"],
    commonModels: ["DSL-150 / DSL-100", "Shinko SVS-Series", "Taiko ESC-Series", "Hamworthy C-Series"],
    typicalSpares: ["1x Mechanical Shaft Seal Kit", "1x Primer Air Ejector Diaphragm Kit", "1x Suction Strainer Screen", "1x Impeller Wear Ring Set"],
    operationalSummary: "Independent fire pump located outside machinery spaces ensuring pressurized water to fire hoses and foam monitors.",
  },
  {
    id: "tax-saf-lifeboat",
    category: "Safety & LSA/FFA",
    department: "Safety_ISM",
    systemName: "Totally Enclosed Lifeboat & Davit Launching Appliance",
    abbreviations: ["LSA", "LSA-CODE", "DAVIT", "ON-LOAD", "FREEFALL", "HRU", "SOLAS-III"],
    keywords: ["lifeboat", "rescue boat", "davits", "on-load release", "freefall", "hatecke", "palfinger", "fassmer", "norsafe", "hydrostatic interlock", "limit switch"],
    components: ["Hydrostatic On-Load Release Hook System", "Gravity Davit Winch & Centrifugal Brake", "Inboard Lifeboat Diesel Engine (Bukh/Lister)", "Self-Contained Air Support Cylinders", "Water Spray Fire Protection Pump"],
    statutoryCode: "SOLAS Ch.III Reg 20 & 31 & LSA Code Ch 4",
    governingBody: "IMO SOLAS",
    standardLimit: "Freefall / Davit launch in ≤ 10 minutes / Launch under 20° list and 10° trim",
    defaultTolerance: "On-load release hook hydrostatic interlock must prevent premature opening in air",
    testInterval: "Weekly",
    primaryMakers: ["Hatecke", "Palfinger Marine", "Fassmer", "Viking Norsafe", "Jiangyin Wolong"],
    commonModels: ["G-FRP Totally Enclosed 32P", "Palfinger MPC-Series", "Fassmer CLR-Series", "Norsafe Matrix"],
    typicalSpares: ["1x Hydrostatic Interlock Release Cable Set", "2x Bukh Engine Fuel/Oil Filters", "1x 12V Heavy Duty Marine Battery", "1x Air Cylinder Pressure Reducer"],
    operationalSummary: "Primary survival craft providing buoyant, fire-retardant evacuation for 100% of ship's complement.",
  },
];

// =========================================================================
// 2. MARINE TECHNICAL ABBREVIATIONS & ACRONYMS LEXICON
// =========================================================================
export const MARINE_ABBREVIATIONS: MarineAbbreviationEntry[] = [
  { abbreviation: "OWS", fullName: "Oily Water Separator", department: "Engine", category: "Environmental", statutoryRef: "MARPOL Annex I Reg 14", typicalParam: "≤ 15 PPM", ocrAliases: ["0WS", "O.W.S.", "O-W-S", "O/W/S"] },
  { abbreviation: "15PPM", fullName: "15 PPM Bilge Alarm Monitor", department: "Engine", category: "Environmental", statutoryRef: "MARPOL Annex I Reg 14", typicalParam: "≤ 15.0 PPM", ocrAliases: ["15 PPM", "15-PPM", "I5PPM", "IS PPM"] },
  { abbreviation: "IGS", fullName: "Inert Gas System", department: "Cargo", category: "Cargo Safety", statutoryRef: "SOLAS Ch.II-2 Reg 4.5.5", typicalParam: "< 5.0% O2 Vol", ocrAliases: ["I.G.S.", "1GS", "I-G-S", "IG S"] },
  { abbreviation: "COW", fullName: "Crude Oil Washing System", department: "Cargo", category: "Cargo Operations", statutoryRef: "MARPOL Annex I Reg 33", typicalParam: "> 8.0 bar / O2 < 8%", ocrAliases: ["C.O.W.", "C-O-W", "CO W"] },
  { abbreviation: "ODMCS", fullName: "Oil Discharge Monitoring & Control System", department: "Cargo", category: "Environmental", statutoryRef: "MARPOL Annex I Reg 31", typicalParam: "≤ 30 L/NM", ocrAliases: ["ODME", "O.D.M.C.S.", "ODMCS/ODME", "0DMCS"] },
  { abbreviation: "ECDIS", fullName: "Electronic Chart Display and Information System", department: "Deck", category: "Navigation", statutoryRef: "SOLAS Ch.V Reg 19.2.10", typicalParam: "Dual / 0s Drop", ocrAliases: ["E.C.D.I.S.", "EC-DIS", "EC D I S", "ECD1S"] },
  { abbreviation: "ARPA", fullName: "Automatic Radar Plotting Aid", department: "Deck", category: "Navigation", statutoryRef: "SOLAS Ch.V Reg 19.2.3", typicalParam: "≥ 100 Targets", ocrAliases: ["A.R.P.A.", "AR-PA", "ARP A"] },
  { abbreviation: "AIS", fullName: "Automatic Identification System", department: "Deck", category: "Navigation", statutoryRef: "SOLAS Ch.V Reg 19.2.4", typicalParam: "12.5W / Ch 87B/88B", ocrAliases: ["A.I.S.", "A-I-S", "A1S"] },
  { abbreviation: "VDR", fullName: "Voyage Data Recorder", department: "Deck", category: "Navigation", statutoryRef: "SOLAS Ch.V Reg 20", typicalParam: "48h Loop", ocrAliases: ["V.D.R.", "S-VDR", "V-D-R", "V0R"] },
  { abbreviation: "GMDSS", fullName: "Global Maritime Distress and Safety System", department: "Deck", category: "Radio", statutoryRef: "SOLAS Ch.IV Reg 7-14", typicalParam: "VSWR < 1.5", ocrAliases: ["G.M.D.S.S.", "GMD SS", "GMD-SS"] },
  { abbreviation: "BWMS", fullName: "Ballast Water Management System", department: "Cargo", category: "Environmental", statutoryRef: "BWM Convention Reg D-2", typicalParam: "< 10 org/m3", ocrAliases: ["BWTS", "B.W.M.S.", "B.W.T.S.", "BWM"] },
  { abbreviation: "EDG", fullName: "Emergency Diesel Generator", department: "Electrical", category: "Electrical Power", statutoryRef: "SOLAS Ch.II-1 Reg 42", typicalParam: "≤ 45s Start", ocrAliases: ["E.D.G.", "EMG GEN", "EMER GEN", "E-GEN"] },
  { abbreviation: "STP", fullName: "Sewage Treatment Plant", department: "Engine", category: "Environmental", statutoryRef: "MARPOL Annex IV Reg 9", typicalParam: "< 100 cfu/ml", ocrAliases: ["S.T.P.", "MSD", "S-T-P"] },
  { abbreviation: "FWG", fullName: "Freshwater Generator", department: "Engine", category: "Auxiliary Machinery", statutoryRef: "WHO Marine Sanitation", typicalParam: "< 10 PPM Salinity", ocrAliases: ["F.W.G.", "F-W-G", "RO PLANT", "EVAPORATOR"] },
  { abbreviation: "PV VALVE", fullName: "High-Velocity Pressure/Vacuum Valve", department: "Cargo", category: "Cargo Safety", statutoryRef: "SOLAS Ch.II-2 Reg 4.5.3", typicalParam: "+1400 / -350 mmWG", ocrAliases: ["P/V", "P/V VALVE", "PV-VALVE", "P-V VALVE"] },
  { abbreviation: "VECS", fullName: "Vapor Emission Control System", department: "Cargo", category: "Environmental", statutoryRef: "MARPOL Annex VI Reg 15", typicalParam: "< +1200 mmWG", ocrAliases: ["V.E.C.S.", "VEC S", "V-E-C-S"] },
  { abbreviation: "MSB", fullName: "Main Switchboard", department: "Electrical", category: "Electrical Power", statutoryRef: "SOLAS Ch.II-1 Reg 40", typicalParam: "440V / > 1.0 MΩ", ocrAliases: ["M.S.B.", "M-S-B", "MAIN SWBD"] },
  { abbreviation: "ESB", fullName: "Emergency Switchboard", department: "Electrical", category: "Electrical Power", statutoryRef: "SOLAS Ch.II-1 Reg 42", typicalParam: "440V / 230V", ocrAliases: ["E.S.B.", "E-S-B", "EMER SWBD"] },
  { abbreviation: "EFP", fullName: "Emergency Fire Pump", department: "Safety_ISM", category: "Fire Safety", statutoryRef: "SOLAS Ch.II-2 Reg 10", typicalParam: "> 3.2 bar at 2 jets", ocrAliases: ["E.F.P.", "EMG FIRE PUMP", "E-FIRE PUMP"] },
  { abbreviation: "LSA", fullName: "Life Saving Appliances", department: "Safety_ISM", category: "Safety", statutoryRef: "SOLAS Ch.III", typicalParam: "100% Complement", ocrAliases: ["L.S.A.", "LSA CODE"] },
  { abbreviation: "FFA", fullName: "Fire Fighting Appliances", department: "Safety_ISM", category: "Safety", statutoryRef: "SOLAS Ch.II-2", typicalParam: "FSS Code Compliant", ocrAliases: ["F.F.A.", "FFA CODE"] },
  { abbreviation: "HRU", fullName: "Hydrostatic Release Unit", department: "Safety_ISM", category: "Lifesaving", statutoryRef: "SOLAS Ch.III Reg 13", typicalParam: "Depth 1.5 - 4.0m", ocrAliases: ["H.R.U.", "H-R-U"] },
  { abbreviation: "SCBA", fullName: "Self-Contained Breathing Apparatus", department: "Safety_ISM", category: "Safety", statutoryRef: "FSS Code Ch 3", typicalParam: "≥ 1200L Air / 300 bar", ocrAliases: ["S.C.B.A.", "BA SET", "BREATHING APPARATUS"] },
  { abbreviation: "EEBD", fullName: "Emergency Escape Breathing Device", department: "Safety_ISM", category: "Safety", statutoryRef: "FSS Code Ch 3", typicalParam: "≥ 15 min duration", ocrAliases: ["E.E.B.D.", "EEBD SET"] },
  { abbreviation: "UTI", fullName: "Ullage-Temperature-Interface Detector", department: "Cargo", category: "Cargo Operations", statutoryRef: "SOLAS Ch.II-2 Reg 4.5.3", typicalParam: "Intrinsically Safe Ex", ocrAliases: ["U.T.I.", "UTI TAPE", "HERMETIC"] },
  { abbreviation: "QCV", fullName: "Quick Closing Valve Emergency Trip", department: "Engine", category: "Machinery Safety", statutoryRef: "SOLAS Ch.II-2 Reg 4.2", typicalParam: "< 5s Pneumatic Trip", ocrAliases: ["Q.C.V.", "QUICK CLOSING"] },
];

// =========================================================================
// 3. OCR TEXT NORMALIZATION & CHARACTER NOISE MAP
// =========================================================================
const OCR_NOISE_REPLACEMENTS: [RegExp, string][] = [
  [/\b0il\b/gi, "Oil"],
  [/\bo1l\b/gi, "Oil"],
  [/\b0ily\b/gi, "Oily"],
  [/\b15\s*ppm\b/gi, "15 PPM"],
  [/\b15ppm\b/gi, "15 PPM"],
  [/\bi5\s*ppm\b/gi, "15 PPM"],
  [/\bs0las\b/gi, "SOLAS"],
  [/\bsola5\b/gi, "SOLAS"],
  [/\bmarp0l\b/gi, "MARPOL"],
  [/\bec\s*d\s*i\s*s\b/gi, "ECDIS"],
  [/\becd1s\b/gi, "ECDIS"],
  [/\b0ws\b/gi, "OWS"],
  [/\b1gs\b/gi, "IGS"],
  [/\bwarts1la\b/gi, "Wartsila"],
  [/\bfurun0\b/gi, "Furuno"],
  [/\ba1fa\b/gi, "Alfa"],
  [/\balfa\s*lava1\b/gi, "Alfa Laval"],
  [/\bscrubh?er\b/gi, "Scrubber"],
  [/\bsep[ea]rat[eo]r\b/gi, "Separator"],
  [/\bcompres[eo]r\b/gi, "Compressor"],
  [/\bgenerat[eo]r\b/gi, "Generator"],
  [/\bincinerat[eo]r\b/gi, "Incinerator"],
  [/\bevaporat[eo]r\b/gi, "Evaporator"],
  [/\btranspond[eo]r\b/gi, "Transponder"],
  [/\bmagnetr[eo]n\b/gi, "Magnetron"],
  [/\bhydraul[il]c\b/gi, "Hydraulic"],
  [/\bpneumat[il]c\b/gi, "Pneumatic"],
  [/\bm3\/h\b/gi, "m3/h"],
  [/\bkw\b/gi, "kW"],
  [/\bkva\b/gi, "kVA"],
  [/\bmmwg\b/gi, "mmWG"],
  [/\bbar\b/gi, "bar"],
];

/**
 * Normalizes raw OCR text against marine technical dictionary & noise rules
 */
export function normalizeMaritimeOcrText(rawText: string): string {
  let cleaned = rawText;
  OCR_NOISE_REPLACEMENTS.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  return cleaned;
}

export interface TaxonomyMatchResult {
  matchedTaxonomy: MaritimeTaxonomyItem | null;
  detectedAbbreviations: MarineAbbreviationEntry[];
  matchedComponents: string[];
  confidenceScore: number; // 0 to 100
  suggestedDepartment: MaritimeDepartment;
  statutoryCode: string;
  limitThreshold: string;
  makerName: string;
  modelName: string;
  suggestedSpares: string;
}

/**
 * High-accuracy static taxonomy matching against OCR text
 */
export function matchMaritimeTaxonomy(text: string): TaxonomyMatchResult {
  const normalized = normalizeMaritimeOcrText(text);
  const lower = normalized.toLowerCase();

  // 1. Detect any recognized marine abbreviations
  const detectedAbbreviations: MarineAbbreviationEntry[] = [];
  MARINE_ABBREVIATIONS.forEach((abbr) => {
    const isExactAbbr = new RegExp(`\\b${abbr.abbreviation}\\b`, "i").test(normalized);
    const isAlias = abbr.ocrAliases.some((alias) => new RegExp(`\\b${alias}\\b`, "i").test(normalized));
    const isFullName = lower.includes(abbr.fullName.toLowerCase());
    if (isExactAbbr || isAlias || isFullName) {
      detectedAbbreviations.push(abbr);
    }
  });

  // 2. Score and match against complete static taxonomy
  let bestItem: MaritimeTaxonomyItem | null = null;
  let bestScore = 0;
  let matchedComponents: string[] = [];

  for (const tax of MARITIME_TAXONOMY) {
    let score = 0;
    const itemMatchedComponents: string[] = [];

    // Keyword match
    for (const kw of tax.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 20;
      }
    }

    // Abbreviation match
    for (const abbr of tax.abbreviations) {
      if (new RegExp(`\\b${abbr}\\b`, "i").test(normalized)) {
        score += 25;
      }
    }

    // Component match
    for (const comp of tax.components) {
      if (lower.includes(comp.toLowerCase())) {
        score += 15;
        itemMatchedComponents.push(comp);
      }
    }

    // Maker match
    for (const m of tax.primaryMakers) {
      if (lower.includes(m.toLowerCase())) {
        score += 15;
      }
    }

    // Statutory code match
    if (tax.statutoryCode && lower.includes(tax.statutoryCode.toLowerCase())) {
      score += 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = tax;
      matchedComponents = itemMatchedComponents;
    }
  }

  // Calculate normalized confidence score (max 100)
  const confidenceScore = Math.min(100, Math.max(0, bestScore));

  const matchedResultItem: MaritimeTaxonomyItem | null = bestItem;

  // Extract dynamic Maker/Model overrides from text if explicitly present
  let foundMaker = matchedResultItem ? matchedResultItem.primaryMakers[0] : "General Marine Maker";
  let foundModel = matchedResultItem ? matchedResultItem.commonModels[0] : "Standard Marine Model";
  const lines = normalized.split(/\r?\n/).map((l) => l.trim());

  lines.forEach((line) => {
    const l = line.toLowerCase();
    if ((l.includes("maker") || l.includes("manufacturer") || l.includes("mfg")) && !l.includes("standard")) {
      const parts = line.split(/[:|=-]/);
      if (parts[1]?.trim()) foundMaker = parts[1].trim();
    }
    if (l.includes("model") || l.includes("type") || l.includes("series")) {
      const parts = line.split(/[:|=-]/);
      if (parts[1]?.trim()) foundModel = parts[1].trim();
    }
  });

  return {
    matchedTaxonomy: matchedResultItem,
    detectedAbbreviations,
    matchedComponents,
    confidenceScore,
    suggestedDepartment: matchedResultItem ? matchedResultItem.department : "Engine",
    statutoryCode: matchedResultItem ? matchedResultItem.statutoryCode : "SOLAS / MARPOL",
    limitThreshold: matchedResultItem ? matchedResultItem.standardLimit : "Nominal Operating Limit",
    makerName: foundMaker,
    modelName: foundModel,
    suggestedSpares: matchedResultItem ? matchedResultItem.typicalSpares.join(", ") : "1x Overhaul Kit, 1x Sensor Probe",
  };
}
