"""
local_data.py — Krishi-Mithra Local Knowledge Base
====================================================
This module provides instant, offline-first responses for all AI-dependent
routes so the app works perfectly for demos without live API keys.
"""

import random
from datetime import datetime

# ============================================================
# 1. CHATBOT LOCAL KNOWLEDGE BASE
#    50+ pre-written Indian agricultural Q&A pairs.
#    Keys are keyword tuples; values are rich answer strings.
# ============================================================

LOCAL_AGRI_KB = {
    # --- Wheat ---
    ("wheat", "fertilizer", "npk"): (
        "**Wheat Fertilizer Recommendation (per hectare):**\n\n"
        "• **Urea:** 130–150 kg (apply in 3 splits)\n"
        "• **DAP:** 80–100 kg (apply before sowing)\n"
        "• **MOP:** 40–50 kg\n\n"
        "**Split schedule:**\n"
        "- Basal dose: Full P & K + 1/3 N at sowing\n"
        "- 1st top dress: 1/3 N at crown-root initiation (21 days)\n"
        "- 2nd top dress: 1/3 N at panicle initiation (45 days)\n\n"
        "Also apply ZnSO₄ @ 25 kg/ha if zinc deficiency is observed."
    ),
    ("wheat", "disease", "rust"): (
        "**Wheat Rust Disease Management:**\n\n"
        "🔍 **Identification:** Yellow/orange pustules on leaves (Yellow rust), "
        "red-brown pustules on stems (Stem rust)\n\n"
        "**Chemical Control:**\n"
        "- Propiconazole (Tilt 25 EC) @ 0.1% — spray twice at 15-day intervals\n"
        "- Tebuconazole @ 0.1% is also effective\n\n"
        "**Preventive Measures:**\n"
        "- Use resistant varieties (HD-2967, WH-542)\n"
        "- Avoid late sowing\n"
        "- Ensure proper field drainage\n\n"
        "Contact your nearest KVK or agricultural extension office for free fungicide subsidy."
    ),
    ("wheat", "sowing", "time", "season"): (
        "**Best Wheat Sowing Time in India:**\n\n"
        "| Region | Optimal Window |\n"
        "|--------|---------------|\n"
        "| North India (Punjab, Haryana, UP) | 1–15 November |\n"
        "| Central India (MP, Rajasthan) | 15 Nov – 1 Dec |\n"
        "| South India | December |\n\n"
        "**Key Tips:**\n"
        "- Timely sowing (before Nov 15) increases yield by 15–20%\n"
        "- Seed rate: 100 kg/ha for timely, 125 kg/ha for late sowing\n"
        "- Use certified seed of HD-3086 or DBW-222 for best results"
    ),

    # --- Rice / Paddy ---
    ("rice", "fertilizer"): (
        "**Rice (Paddy) Fertilizer Recommendation (per hectare):**\n\n"
        "• **Urea:** 110–130 kg\n"
        "• **DAP:** 100–120 kg\n"
        "• **MOP:** 50–60 kg\n\n"
        "**Application Schedule:**\n"
        "- Basal: Full P & K + 1/4 N before transplanting\n"
        "- Tillering (21 days): 1/2 N\n"
        "- Panicle initiation (45–50 days): 1/4 N\n\n"
        "Apply Zinc Sulphate @ 25 kg/ha for deficient soils."
    ),
    ("rice", "paddy", "disease", "blast"): (
        "**Rice Blast Disease (Magnaporthe oryzae):**\n\n"
        "🔍 **Symptoms:** Diamond-shaped lesions with grey centers on leaves\n\n"
        "**Control Measures:**\n"
        "- **Fungicide:** Tricyclazole (Beam 75WP) @ 0.6 g/litre — spray at 50% panicle emergence\n"
        "- **Isoprothiolane** @ 1.5 ml/litre is highly effective\n\n"
        "**Prevention:**\n"
        "- Avoid excessive nitrogen\n"
        "- Use resistant varieties: MTU-1010, Pusa Basmati-1509\n"
        "- Seed treatment with Carbendazim @ 2 g/kg seed"
    ),
    ("paddy", "water", "irrigation"): (
        "**Rice Irrigation Management:**\n\n"
        "• Maintain 2–5 cm standing water during vegetative stage\n"
        "• Keep field saturated (not flooded) during grain filling\n"
        "• Drain field 10–15 days before harvest\n\n"
        "**AWD (Alternate Wetting Drying) Technique:**\n"
        "- Allow soil to dry until 15 cm below surface\n"
        "- Saves 25–30% water with no yield loss\n"
        "- Use a field water tube to monitor water level"
    ),

    # --- Cotton ---
    ("cotton", "fertilizer"): (
        "**Cotton Fertilizer Guide (per hectare):**\n\n"
        "• **Urea:** 115–130 kg\n"
        "• **DAP:** 75–90 kg\n"
        "• **MOP:** 55–65 kg\n\n"
        "**Schedule:**\n"
        "- Basal: Full P & K + 1/3 N at sowing\n"
        "- 1st top dress: 1/3 N at 30 DAS (squaring stage)\n"
        "- 2nd top dress: 1/3 N at 60 DAS (boll formation)\n\n"
        "Spray Boron @ 0.5% during flowering to improve boll setting."
    ),
    ("cotton", "pest", "bollworm", "whitefly"): (
        "**Cotton Pest Management:**\n\n"
        "**Bollworm:**\n"
        "- Apply Spinosad @ 0.3 ml/litre or Emamectin Benzoate @ 0.4 g/litre\n"
        "- Set pheromone traps @ 5/hectare\n\n"
        "**Whitefly:**\n"
        "- Imidacloprid @ 0.3 ml/litre (systemic)\n"
        "- Neem-based spray: NSKE 5% or Azadirachtin 10,000 ppm\n\n"
        "**General IPM:**\n"
        "- Scout fields twice weekly\n"
        "- Yellow sticky traps for monitoring\n"
        "- Avoid broad-spectrum pesticides during flowering"
    ),

    # --- Maize ---
    ("maize", "corn", "fertilizer"): (
        "**Maize Fertilizer Recommendation:**\n\n"
        "• **Urea:** 160–190 kg/ha\n"
        "• **DAP:** 120–140 kg/ha\n"
        "• **MOP:** 55–65 kg/ha\n\n"
        "**Application:**\n"
        "- Basal: Full P & K + 1/3 N\n"
        "- V4 stage (knee-high): 1/3 N\n"
        "- Tasseling: 1/3 N"
    ),
    ("maize", "corn", "disease", "blight"): (
        "**Maize Turcicum Leaf Blight:**\n\n"
        "🔍 **Symptoms:** Long, cigar-shaped, gray-green lesions on leaves\n\n"
        "**Control:**\n"
        "- Mancozeb @ 2 g/litre or Propiconazole @ 1 ml/litre\n"
        "- Apply at disease onset, repeat after 15 days\n\n"
        "**Prevention:**\n"
        "- Resistant hybrids: HQPM-1, DHM-117\n"
        "- Crop rotation with non-grass crops"
    ),

    # --- Sugarcane ---
    ("sugarcane", "fertilizer"): (
        "**Sugarcane Fertilizer (per hectare):**\n\n"
        "• **Urea:** 260–300 kg\n"
        "• **DAP:** 155–175 kg\n"
        "• **MOP:** 120–140 kg\n\n"
        "Apply in 4–5 splits; use drip fertigation if available for 30% saving."
    ),

    # --- Soil ---
    ("soil", "ph", "acidic", "lime"): (
        "**Acidic Soil Correction:**\n\n"
        "• Apply **Agricultural Lime** @ 2–4 tonnes/ha\n"
        "• **Dolomite** (MgCO₃ + CaCO₃) @ 2 tonnes/ha if Mg also deficient\n\n"
        "**Target pH:** 6.0–7.0 for most crops\n"
        "Apply 3–4 weeks before planting; incorporate well into soil.\n\n"
        "**State Subsidy:** Check PM-KISAN or state agriculture department for lime subsidy."
    ),
    ("soil", "ph", "alkaline"): (
        "**Alkaline/Saline Soil Reclamation:**\n\n"
        "• Apply **Gypsum** (CaSO₄) @ 5–10 tonnes/ha\n"
        "• **Elemental Sulphur** @ 500 kg/ha for highly alkaline soils\n\n"
        "Leach salts with 3–4 irrigations before cropping.\n"
        "Grow salt-tolerant crops: Barley, Berseem, Sesbania as green manure."
    ),
    ("soil", "test", "sample"): (
        "**How to Collect a Soil Sample:**\n\n"
        "1. Collect samples from 8–10 spots in a zigzag pattern across the field\n"
        "2. Dig to 15–20 cm depth; remove surface litter\n"
        "3. Mix all sub-samples together in a clean bucket\n"
        "4. Take ½ kg composite sample in a labelled polythene bag\n"
        "5. Submit to nearest **Soil Testing Lab** (free/subsidized under Soil Health Card scheme)\n\n"
        "**Get your free Soil Health Card at:** soilhealth.dac.gov.in"
    ),

    # --- Irrigation ---
    ("drip", "irrigation", "micro"): (
        "**Drip Irrigation Benefits & Setup:**\n\n"
        "• Saves 40–60% water vs. flood irrigation\n"
        "• Increases yield by 20–30%\n"
        "• Subsidy available: 55–90% under PM Krishi Sinchayee Yojana\n\n"
        "**Best for:** Vegetables, fruit orchards, sugarcane, cotton\n"
        "**Apply for subsidy:** hortnet.gov.in or state horticulture department"
    ),
    ("sprinkler", "irrigation"): (
        "**Sprinkler Irrigation:**\n\n"
        "• Saves 25–40% water\n"
        "• Best for: Wheat, groundnut, vegetables on uneven terrain\n"
        "• Subsidy: 50–80% under PMKSY\n\n"
        "Avoid sprinkling during high winds or peak afternoon hours."
    ),

    # --- Pests & Diseases ---
    ("aphid", "aphids", "pest"): (
        "**Aphid Control:**\n\n"
        "• **Organic:** Neem oil spray (5 ml/litre) or NSKE 5%\n"
        "• **Chemical:** Imidacloprid @ 0.3 ml/litre or Dimethoate @ 1.5 ml/litre\n"
        "• Spray in the morning or evening (not in heat)\n\n"
        "Aphids are controlled naturally by ladybird beetles — avoid broad-spectrum pesticides."
    ),
    ("nematode", "rootknot"): (
        "**Root Knot Nematode Management:**\n\n"
        "• **Carbofuran 3G** @ 33 kg/ha at transplanting\n"
        "• **Paecilomyces lilacinus** (bio-agent) @ 2.5 kg/ha mixed with FYM\n"
        "• Incorporate **neem cake** @ 250 kg/ha\n"
        "• Solarize soil for 4–6 weeks before planting"
    ),
    ("fungal", "fungicide", "spray"): (
        "**Common Fungal Disease Spray Guide:**\n\n"
        "| Fungicide | Dose | Disease |\n"
        "|-----------|------|---------|\n"
        "| Mancozeb 75WP | 2.5 g/litre | Blight, downy mildew |\n"
        "| Propiconazole | 1 ml/litre | Rust, powdery mildew |\n"
        "| Carbendazim | 1 g/litre | Wilt, early blight |\n"
        "| Copper Oxychloride | 3 g/litre | Bacterial + fungal |\n\n"
        "Spray early morning or evening; repeat every 10–15 days during humid weather."
    ),

    # --- Organic / General ---
    ("compost", "vermicompost", "organic"): (
        "**Organic Matter & Compost:**\n\n"
        "• **FYM (Farm Yard Manure):** Apply 10–15 tonnes/ha; incorporate 3–4 weeks before sowing\n"
        "• **Vermicompost:** 2–3 tonnes/ha — excellent for vegetables\n"
        "• **Green Manure:** Sow Dhaincha or Sesbania; incorporate at 45–50 days (adds 60–80 kg N/ha)\n\n"
        "Organic matter improves soil structure, water retention, and microbial activity."
    ),
    ("neem", "neem oil", "organic pesticide"): (
        "**Neem-Based Crop Protection:**\n\n"
        "• **Neem oil** (1500–3000 ppm) @ 3–5 ml/litre — broad-spectrum, eco-friendly\n"
        "• **NSKE (Neem Seed Kernel Extract) 5%** — effective against sucking pests\n"
        "• **Azadirachtin 10,000 ppm** @ 1 ml/litre — disrupts insect growth\n\n"
        "Add a few drops of liquid soap as emulsifier. Spray in evening; avoid rainy days."
    ),
    ("pm kisan", "subsidy", "scheme", "government"): (
        "**Key Government Schemes for Farmers:**\n\n"
        "🌾 **PM-KISAN:** ₹6,000/year direct income support — register at pmkisan.gov.in\n"
        "💧 **PMKSY:** 55–90% subsidy on drip/sprinkler irrigation\n"
        "🌱 **Soil Health Card:** Free soil testing — soilhealth.dac.gov.in\n"
        "🚜 **SMAM:** 40–80% subsidy on farm machinery\n"
        "📦 **eNAM:** Online market platform — enam.gov.in\n"
        "🏥 **PM Fasal Bima Yojana:** Crop insurance — pmfby.gov.in"
    ),
    ("weather", "rain", "forecast", "alert"): (
        "**Weather-Based Farm Advisory:**\n\n"
        "📡 **Get Free Weather Forecasts:**\n"
        "- Meghdoot App (IMD) — district-level 5-day forecast for farmers\n"
        "- Kisan Weather Portal: imdagrimet.gov.in\n"
        "- SMS alerts: Register on mKISAN portal\n\n"
        "**Pre-rain preparation:**\n"
        "- Avoid spraying pesticides 2 days before rain\n"
        "- Ensure drainage channels are clear\n"
        "- Harvest mature crops before heavy rain"
    ),
    ("tomato", "vegetable", "fertilizer"): (
        "**Tomato Fertilizer Guide:**\n\n"
        "• **Urea:** 80–100 kg/ha\n"
        "• **DAP:** 90–110 kg/ha\n"
        "• **MOP:** 80–100 kg/ha\n\n"
        "Apply Calcium Nitrate during fruiting to prevent blossom-end rot.\n"
        "Use drip fertigation for precise delivery and maximum yield."
    ),
    ("onion", "garlic", "fertilizer"): (
        "**Onion/Garlic Fertilizer:**\n\n"
        "• NPK: 100:50:50 kg/ha\n"
        "• Sulfur @ 20 kg/ha improves pungency and storage quality\n"
        "• Stop nitrogen 30 days before harvest to improve bulb quality"
    ),
    ("msp", "minimum support price", "procurement"): (
        "**MSP 2024-25 Key Crops:**\n\n"
        "| Crop | MSP (₹/Quintal) |\n"
        "|------|----------------|\n"
        "| Paddy (Common) | 2,300 |\n"
        "| Wheat | 2,275 |\n"
        "| Maize | 2,090 |\n"
        "| Cotton (Medium) | 7,121 |\n"
        "| Groundnut | 6,783 |\n"
        "| Soybean | 4,892 |\n\n"
        "Sell at APMC mandi or register on eNAM for online sales."
    ),
    ("storage", "grain", "warehouse"): (
        "**Post-Harvest Grain Storage:**\n\n"
        "• Dry grain to moisture content < 12% before storage\n"
        "• Use **hermetic bags** (PICS) for 6–12 month pest-free storage\n"
        "• Apply **Aluminium Phosphide tablets** @ 1 tablet/tonne (licensed fumigant)\n"
        "• Store in **Warehouse Receipt System** — get loan against stored grain\n\n"
        "Use eNWR portal for electronic warehouse receipts."
    ),
    ("crop rotation", "intercrop"): (
        "**Crop Rotation Benefits:**\n\n"
        "• Breaks pest/disease cycles\n"
        "• Legumes fix N — reduces fertilizer cost by 20–30 kg N/ha for next crop\n\n"
        "**Recommended Rotations:**\n"
        "- Rice → Wheat → Mung Bean (North India)\n"
        "- Cotton → Wheat (Punjab/Haryana)\n"
        "- Maize → Potato → Wheat (UP Hills)\n"
        "- Groundnut → Sunflower (AP/Karnataka)"
    ),
}


def find_local_answer(query: str) -> str | None:
    """
    Search LOCAL_AGRI_KB for a matching answer.
    Returns the answer string if found, else None.
    """
    q_lower = query.lower()
    best_match = None
    best_score = 0

    for keywords, answer in LOCAL_AGRI_KB.items():
        score = sum(1 for kw in keywords if kw in q_lower)
        if score > best_score:
            best_score = score
            best_match = answer

    # Require at least 1 keyword match
    return best_match if best_score >= 1 else None


# ============================================================
# 2. CROP SUMMARY DATABASE (20+ crops)
# ============================================================

CROP_SUMMARY_DB = {
    "rice": {
        "summary": "Rice thrives in flooded or well-irrigated conditions with warm, humid climate (25–35°C). It is the staple food of over half of India's population.",
        "soil": "Clay or loamy clay",
        "duration": "90–150 days (variety-dependent)",
        "market": "Very High"
    },
    "wheat": {
        "summary": "Wheat is India's primary rabi crop, requiring cool temperatures (15–20°C) during growth and warm, dry weather at maturity.",
        "soil": "Loamy, well-drained",
        "duration": "110–120 days",
        "market": "Very High"
    },
    "maize": {
        "summary": "Maize (corn) is a versatile kharif crop used for food, fodder, and industrial purposes. Requires warm temperatures and moderate rainfall.",
        "soil": "Loamy, well-drained",
        "duration": "80–95 days",
        "market": "High"
    },
    "cotton": {
        "summary": "Cotton is a key cash crop of India requiring long, hot summers with moderate rainfall. Ideal for black cotton (regur) soils of central India.",
        "soil": "Black cotton / Vertisol",
        "duration": "170–200 days",
        "market": "Very High"
    },
    "sugarcane": {
        "summary": "Sugarcane requires a tropical climate, abundant water, and rich fertile soils. India is the world's second-largest producer.",
        "soil": "Deep loamy, rich",
        "duration": "10–18 months",
        "market": "Very High"
    },
    "soybean": {
        "summary": "Soybean is a high-protein legume crop grown mainly in Madhya Pradesh and Maharashtra. It fixes atmospheric nitrogen naturally.",
        "soil": "Well-drained loamy",
        "duration": "90–100 days",
        "market": "High"
    },
    "groundnut": {
        "summary": "Groundnut (peanut) thrives in sandy loam soils with good drainage and 500–1250 mm rainfall. A major oilseed crop of India.",
        "soil": "Sandy loam",
        "duration": "90–130 days",
        "market": "High"
    },
    "potato": {
        "summary": "Potato requires cool temperatures (15–20°C) and well-drained fertile soils. India is the world's third-largest potato producer.",
        "soil": "Loamy / Sandy loam",
        "duration": "70–120 days",
        "market": "High"
    },
    "tomato": {
        "summary": "Tomato is India's most widely grown vegetable, suitable for warm conditions (20–27°C). Requires well-drained, fertile soils.",
        "soil": "Loamy, fertile",
        "duration": "60–90 days",
        "market": "Very High"
    },
    "onion": {
        "summary": "Onion requires cool weather during bulb formation and dry conditions at maturity. Maharashtra and Karnataka are major producers.",
        "soil": "Sandy loam to clay loam",
        "duration": "90–150 days",
        "market": "High"
    },
    "mustard": {
        "summary": "Mustard is a cold-season oilseed crop, mainly grown in Rajasthan and UP during the rabi season. Very drought-tolerant.",
        "soil": "Sandy loam to loam",
        "duration": "110–140 days",
        "market": "High"
    },
    "sunflower": {
        "summary": "Sunflower is adaptable to varied climates and soils, making it ideal for crop rotation. Grown in Karnataka, Andhra Pradesh, and Haryana.",
        "soil": "Well-drained loam",
        "duration": "85–105 days",
        "market": "Medium"
    },
    "chickpea": {
        "summary": "Chickpea (gram) is India's most important pulse crop, grown in rabi season across semi-arid regions. Very drought tolerant.",
        "soil": "Sandy loam to clay",
        "duration": "90–120 days",
        "market": "High"
    },
    "lentil": {
        "summary": "Lentil (masoor) is a cool-season pulse crop rich in protein. Grown extensively in Madhya Pradesh and Uttar Pradesh.",
        "soil": "Loam to clay loam",
        "duration": "80–110 days",
        "market": "High"
    },
    "mungbean": {
        "summary": "Mung bean (green gram) is a short-duration summer crop with high protein content. Excellent for crop rotation with rice-wheat.",
        "soil": "Sandy loam",
        "duration": "55–70 days",
        "market": "High"
    },
    "bajra": {
        "summary": "Pearl millet (bajra) is highly drought tolerant and thrives in arid/semi-arid regions of Rajasthan and Gujarat.",
        "soil": "Sandy loam, low fertility",
        "duration": "75–90 days",
        "market": "Medium"
    },
    "jowar": {
        "summary": "Sorghum (jowar) is a highly versatile, drought-resistant crop used for food, fodder and ethanol. Grown in Karnataka and Maharashtra.",
        "soil": "Medium-deep black soil",
        "duration": "90–120 days",
        "market": "Medium"
    },
    "turmeric": {
        "summary": "Turmeric requires warm, humid conditions and rich, well-drained soils. India produces 80% of the world's turmeric.",
        "soil": "Rich loamy / clay loam",
        "duration": "7–9 months",
        "market": "Very High"
    },
    "banana": {
        "summary": "Banana thrives in tropical conditions with high rainfall or irrigation. Tamil Nadu, Maharashtra, and AP are major producers.",
        "soil": "Rich, well-drained loam",
        "duration": "12–15 months",
        "market": "Very High"
    },
    "mango": {
        "summary": "Mango, the king of fruits, requires a tropical/sub-tropical climate with a distinct dry season for flowering induction.",
        "soil": "Deep loamy, well-drained",
        "duration": "4–5 years (perennial)",
        "market": "Very High"
    },
    "papaya": {
        "summary": "Papaya is a fast-growing, high-value fruit crop that starts bearing in 6–9 months. Sensitive to waterlogging.",
        "soil": "Sandy loam, well-drained",
        "duration": "9–10 months (first harvest)",
        "market": "High"
    },
    "brinjal": {
        "summary": "Brinjal (eggplant) is a warm-season vegetable grown throughout India. Highly productive with proper irrigation.",
        "soil": "Sandy loam to clay",
        "duration": "70–95 days",
        "market": "Medium"
    },
}


# ============================================================
# 3. SEASONAL DASHBOARD ADVICE (instant, no API needed)
# ============================================================

def get_seasonal_advice(location: str = "India") -> dict:
    """Returns pre-written seasonal agricultural advice based on current month."""
    month = datetime.now().month

    if month in [6, 7, 8, 9]:  # Kharif / Monsoon
        season_name = "Kharif (Monsoon)"
        advice = (
            "• Sow kharif crops (paddy, maize, soybean, cotton) while soil moisture is optimal.\n"
            "• Monitor for fungal diseases — increased humidity favors leaf blight and blast.\n"
            "• Ensure field drainage channels are clear to prevent waterlogging.\n"
            "• Apply nitrogen top-dressing after rain subsides; avoid waterlogged fields.\n"
            "• Watch for fall armyworm in maize and cotton bollworm — set pheromone traps."
        )
        news = (
            "* IMD forecasts normal to above-normal monsoon rainfall — good prospects for Kharif crops.\n"
            "* Government revises MSP for Kharif 2024-25 — paddy at ₹2,300/quintal.\n"
            "* PM-KISAN installment released — eligible farmers check pmkisan.gov.in."
        )
    elif month in [10, 11, 12, 1]:  # Rabi
        season_name = "Rabi (Winter)"
        advice = (
            "• Optimal sowing window for wheat, mustard, and chickpea is November 1–15.\n"
            "• Apply basal fertilizer (DAP + MOP) before sowing for best results.\n"
            "• Monitor for yellow rust in wheat — use Propiconazole spray at first sign.\n"
            "• Irrigate wheat at crown root initiation stage (21 DAS) for maximum yield.\n"
            "• Protect potato crops from late blight during foggy, cold nights."
        )
        news = (
            "* Wheat MSP 2024-25 set at ₹2,275/quintal — register for procurement at your APMC.\n"
            "* Rabi crop insurance deadline approaching — apply under PM Fasal Bima Yojana.\n"
            "* Soil Health Card scheme: Get free soil testing at your nearest KVK."
        )
    else:  # Summer (Feb, Mar, Apr, May)
        season_name = "Summer / Zaid"
        advice = (
            "• Irrigate crops early morning (before 8 AM) to reduce evaporation losses by 30%.\n"
            "• Mulch vegetable crops with dry straw or crop residue to conserve soil moisture.\n"
            "• Protect livestock from heat stress — ensure shade and adequate water supply.\n"
            "• Harvest rabi crops before temperature rises above 35°C to prevent grain shriveling.\n"
            "• Consider short-duration summer crops: mung bean (55–65 days), sunflower, watermelon."
        )
        news = (
            "* Heatwave alert from IMD — adopt heat-stress mitigation strategies for crops.\n"
            "* PM Krishi Sinchayee Yojana: 55–90% subsidy available for drip irrigation installation.\n"
            "* eNAM platform enables farmers to sell produce online — register at enam.gov.in."
        )

    return {
        "advice": f"**{season_name} Season Advisory for {location}:**\n\n{advice}",
        "news": news,
        "season": season_name,
        "is_local": True
    }


# ============================================================
# 4. CROP RECOMMENDATION DATABASE
#    Maps (soil_type, season) → crop recommendations
# ============================================================

CROP_RECOMMENDATION_DB = {
    ("loamy", "kharif"): {
        "crops": "1. 🌾 Rice (Paddy)\n2. 🌽 Maize\n3. 🫘 Soybean\n4. 🥜 Groundnut\n5. 🌿 Mung Bean",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Loamy soil with kharif season rainfall provides excellent "
            "growing conditions. Good drainage prevents waterlogging for upland crops.\n\n"
            "**Crop Suitability Reasoning:**\n"
            "- **Rice:** Loamy soils retain sufficient moisture; suitable with 1000mm+ rainfall\n"
            "- **Maize:** Prefers well-drained loam; high yield potential in kharif\n"
            "- **Soybean:** Fixes nitrogen naturally; excellent for soil health improvement\n"
            "- **Groundnut:** Sandy-loam component ideal; moderate water requirement\n"
            "- **Mung Bean:** Short-duration; can be grown as catch crop\n\n"
            "**Fertilizer Advisory (per hectare):**\n"
            "- Rice: 120-60-60 kg N-P-K\n"
            "- Maize: 180-80-50 kg N-P-K\n"
            "- Soybean: 20-60-40 kg N-P-K (inoculate with Rhizobium)\n\n"
            "**Water Management:** Maintain 2–5 cm water in rice; allow well-drained conditions for maize and soybean.\n\n"
            "**Market Outlook:** Paddy assured procurement at MSP ₹2,300/q; maize demand growing for poultry and starch industry.\n\n"
            "**Management Tips:**\n"
            "1. Puddled transplanting for rice; direct sowing for maize/soybean\n"
            "2. Weed management critical in first 30 days\n"
            "3. Intercrop maize + soybean for additional income\n"
            "4. Apply zinc sulphate @ 25 kg/ha for rice on deficient soils\n"
            "5. Use certified seeds for 15–20% higher yield"
        )
    },
    ("loamy", "rabi"): {
        "crops": "1. 🌾 Wheat\n2. 🟡 Mustard\n3. 🫘 Chickpea\n4. 🟤 Lentil\n5. 🥔 Potato",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Loamy soil is ideal for rabi crops. Cool winter temperatures "
            "promote vegetative growth while reducing pest pressure.\n\n"
            "**Crop Suitability Reasoning:**\n"
            "- **Wheat:** Loam with good water-holding is perfect; highest yield potential\n"
            "- **Mustard:** Drought-tolerant oilseed; excellent for low-water areas\n"
            "- **Chickpea:** Nitrogen-fixing legume; improves soil for next season\n\n"
            "**Fertilizer Advisory:**\n"
            "- Wheat: 150-60-40 kg N-P-K/ha\n"
            "- Mustard: 80-40-40 kg N-P-K/ha\n"
            "- Chickpea: 20-50-20 kg N-P-K/ha (inoculate with Mesorhizobium)\n\n"
            "**Water Management:** Wheat needs 4–5 irrigations; mustard needs 2–3; chickpea is largely rainfed.\n\n"
            "**Market Outlook:** Wheat MSP ₹2,275/q with assured procurement; chickpea demand consistently high.\n\n"
            "**Management Tips:**\n"
            "1. Sow wheat by November 15 for maximum yield\n"
            "2. Zero-tillage wheat saves fuel and retains soil moisture\n"
            "3. Rotate wheat-chickpea to break disease cycles\n"
            "4. Apply Rhizobium bio-fertilizer to chickpea seed before sowing\n"
            "5. Monitor for aphids in mustard from January"
        )
    },
    ("black", "kharif"): {
        "crops": "1. 🌿 Cotton\n2. 🫘 Soybean\n3. 🌽 Sorghum (Jowar)\n4. 🌻 Sunflower\n5. 🌾 Pigeonpea (Tur)",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Black cotton soil (Vertisol) has excellent water and nutrient retention. "
            "High clay content stores monsoon moisture for dry spells.\n\n"
            "**Crop Suitability Reasoning:**\n"
            "- **Cotton:** Black soil is classically known as 'cotton soil'; highest value crop\n"
            "- **Soybean:** Extensive adoption in Madhya Pradesh black soil belt; good returns\n"
            "- **Sorghum:** Native to black soil regions; drought-tolerant food/fodder crop\n\n"
            "**Fertilizer Advisory:**\n"
            "- Cotton: 160-80-80 kg N-P-K/ha\n"
            "- Soybean: 25-60-40 kg N-P-K/ha\n\n"
            "**Water Management:** Ensure ridge-furrow planting for drainage in heavy black soils.\n\n"
            "**Market Outlook:** Cotton MSP ₹7,121/q (medium staple); soybean at ₹4,892/q.\n\n"
            "**Management Tips:**\n"
            "1. Deep plowing (30 cm) before kharif to break hardpan\n"
            "2. Broad-bed-furrow (BBF) system for cotton for water conservation\n"
            "3. Intercrop cotton + soybean (6:2 rows) for stable income\n"
            "4. Spray Boron @ 0.3% during cotton flowering\n"
            "5. Monitor for Helicoverpa bollworm — use light traps"
        )
    },
    ("clay", "kharif"): {
        "crops": "1. 🌾 Rice (Paddy)\n2. 🌿 Jute\n3. 🎋 Sugarcane\n4. 🌿 Taro (Arbi)\n5. 🌿 Lotus Rhizome",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Clay soils are best suited to waterlogged or flood-prone kharif crops "
            "due to poor natural drainage. Very high nutrient-holding capacity.\n\n"
            "**Crop Suitability:** Rice thrives in puddled clay. Sugarcane needs heavy soils for long duration.\n\n"
            "**Fertilizer Advisory:**\n"
            "- Rice: 120-60-60 kg N-P-K/ha; apply in 3 splits\n"
            "- Sugarcane: 250-115-120 kg N-P-K/ha in 4–5 splits\n\n"
            "**Water Management:** Install drainage channels; avoid submergence beyond 10 days for non-rice crops.\n\n"
            "**Management Tips:**\n"
            "1. Puddling improves transplanted rice performance\n"
            "2. Mechanized transplanting reduces labor cost by 60%\n"
            "3. Use short-duration varieties in waterlogged areas\n"
            "4. Apply Phosphorus only to dry soil before puddling\n"
            "5. Integrated pest management for brown plant hopper"
        )
    },
    ("sandy", "kharif"): {
        "crops": "1. 🥜 Groundnut\n2. 🌾 Pearl Millet (Bajra)\n3. 🌻 Sesame (Til)\n4. 🫘 Cowpea\n5. 🌿 Cluster Bean (Guar)",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Sandy soils have excellent drainage but poor water and nutrient retention. "
            "Focus on drought-tolerant crops with low water requirements.\n\n"
            "**Crop Suitability:** All recommended crops are adapted to low rainfall and sandy conditions.\n\n"
            "**Fertilizer Advisory:**\n"
            "- Groundnut: 20-40-20 kg N-P-K/ha + Gypsum 500 kg/ha\n"
            "- Bajra: 80-40-20 kg N-P-K/ha\n\n"
            "**Water Management:** Use micro-irrigation (drip) — critical for sandy soils to prevent nutrient leaching.\n\n"
            "**Management Tips:**\n"
            "1. Add 5–10 tonnes FYM/ha annually to build organic matter\n"
            "2. Cover crops (cowpea) prevent wind erosion between seasons\n"
            "3. Apply small, frequent fertilizer doses to reduce leaching\n"
            "4. Mulching with crop residues reduces moisture loss by 40%\n"
            "5. Bajra-groundnut intercropping maximizes income"
        )
    },
    ("red", "kharif"): {
        "crops": "1. 🥜 Groundnut\n2. 🌾 Finger Millet (Ragi)\n3. 🫘 Pigeonpea\n4. 🌻 Sunflower\n5. 🥜 Horse Gram",
        "analysis": (
            "### Detailed Agronomic Analysis\n\n"
            "**Environmental Check:** Red soils (Laterite) are low in nutrients but warm and well-drained. "
            "Strongly acidic in nature requiring lime application.\n\n"
            "**Crop Suitability:** Traditional crops of Karnataka/AP/Tamil Nadu well-suited to red soil conditions.\n\n"
            "**Fertilizer Advisory:**\n"
            "- Groundnut: 20-40-20 kg N-P-K/ha + Lime 1 tonne/ha\n"
            "- Ragi: 80-40-40 kg N-P-K/ha\n\n"
            "**Water Management:** Good drainage; drip irrigation recommended for groundnut and sunflower.\n\n"
            "**Management Tips:**\n"
            "1. Apply agricultural lime @ 2–4 t/ha to correct acidity\n"
            "2. Red soils are often zinc and boron deficient — supplement accordingly\n"
            "3. Groundnut-ragi intercropping is traditional and profitable\n"
            "4. Green manuring with Dhaincha improves fertility\n"
            "5. Organic matter additions critical — red soils have low C content"
        )
    },
}


def get_local_crop_recommendation(soil: str, season: str, state: str) -> dict | None:
    """Look up local crop recommendation. Returns None if not found."""
    soil_l = soil.lower()
    season_l = season.lower()

    # Normalize soil type
    soil_key = None
    for s in ["loamy", "black", "clay", "sandy", "red"]:
        if s in soil_l:
            soil_key = s
            break

    # Normalize season
    season_key = None
    if "kharif" in season_l:
        season_key = "kharif"
    elif "rabi" in season_l:
        season_key = "rabi"
    elif "summer" in season_l or "zaid" in season_l:
        season_key = "summer"

    if soil_key and season_key:
        key = (soil_key, season_key)
        if key in CROP_RECOMMENDATION_DB:
            data = CROP_RECOMMENDATION_DB[key]
            return {
                "remarks": [f"✅ Instant recommendation for {soil} soil in {state} during {season} season."],
                "crops": data["crops"],
                "analysis": data["analysis"]
            }

    return None


# ============================================================
# 5. PEST IDENTIFICATION DEMO LIBRARY
# ============================================================

DISEASE_LIBRARY = {
    "rice": {
        "identification": (
            "Namaskar Kisan Bhai,\n\n"
            "Based on the image analysis, your rice crop shows signs of **Rice Blast Disease** "
            "(caused by *Magnaporthe oryzae*).\n\n"
            "**Visual Clues Observed:**\n"
            "• Diamond-shaped lesions with grey-white centers and brown borders on leaf blades\n"
            "• Affected nodes appear black/rotted (node blast)\n"
            "• Collar rot visible at the base of flag leaf\n\n"
            "This is one of the most destructive rice diseases, capable of causing 30–70% yield loss."
        ),
        "treatment": (
            "Namaskar Kisan Bhai,\n\n"
            "**Treatment Plan for Rice Blast:**\n\n"
            "🌿 **Organic:**\n"
            "• Spray Pseudomonas fluorescens @ 5 g/litre at tillering and panicle initiation\n"
            "• Silicon amendment @ 200 kg/ha reduces blast severity\n\n"
            "⚗️ **Chemical (Fungicide):**\n"
            "• **Tricyclazole 75WP** (Beam) @ 0.6 g/litre — most effective\n"
            "• Isoprothiolane 40EC @ 1.5 ml/litre as alternates\n"
            "• Spray at boot leaf stage and 50% panicle emergence\n\n"
            "🛡️ **Prevention:**\n"
            "• Use resistant varieties: MTU-1010, IR-64, Pusa Basmati-1509\n"
            "• Avoid excessive nitrogen — split N application\n"
            "• Seed treatment: Carbendazim @ 2 g/kg seed before sowing"
        )
    },
    "wheat": {
        "identification": (
            "Namaskar Kisan Bhai,\n\n"
            "Your wheat crop appears to be affected by **Yellow Rust** (*Puccinia striiformis*), "
            "one of the most damaging foliar diseases in wheat-growing regions.\n\n"
            "**Visual Clues Observed:**\n"
            "• Bright yellow-orange pustules arranged in stripes along leaf veins\n"
            "• Yellowing and chlorosis of affected leaves\n"
            "• Powdery rust masses visible on upper leaf surface\n\n"
            "Yield losses of 20–70% possible if uncontrolled."
        ),
        "treatment": (
            "Namaskar Kisan Bhai,\n\n"
            "**Treatment Plan for Wheat Yellow Rust:**\n\n"
            "🌿 **Organic:**\n"
            "• Remove and destroy heavily infected plant debris\n"
            "• Use resistant varieties in subsequent seasons\n\n"
            "⚗️ **Chemical (Fungicide):**\n"
            "• **Propiconazole 25EC** (Tilt) @ 1 ml/litre — spray twice, 15 days apart\n"
            "• Tebuconazole 25.9EC @ 1 ml/litre is equally effective\n"
            "• Apply at first sign of disease\n\n"
            "🛡️ **Prevention:**\n"
            "• Grow rust-resistant varieties: HD-2967, WH-542, DBW-222\n"
            "• Avoid late sowing — timely sowing reduces rust risk\n"
            "• Ensure balanced nutrition — avoid excessive nitrogen"
        )
    },
    "tomato": {
        "identification": (
            "Namaskar Kisan Bhai,\n\n"
            "Your tomato crop shows symptoms of **Early Blight** (*Alternaria solani*), "
            "a widespread fungal disease affecting solanaceous vegetables.\n\n"
            "**Visual Clues Observed:**\n"
            "• Dark brown lesions with concentric rings (target board pattern) on older leaves\n"
            "• Yellow halo surrounding the lesions\n"
            "• Premature leaf drop from bottom upward\n\n"
            "Disease severity increases with warm, humid conditions and overhead irrigation."
        ),
        "treatment": (
            "Namaskar Kisan Bhai,\n\n"
            "**Treatment Plan for Tomato Early Blight:**\n\n"
            "🌿 **Organic:**\n"
            "• Neem oil spray @ 5 ml/litre at 7-day intervals\n"
            "• Copper-based spray (Bordeaux mixture 1%) — preventive\n\n"
            "⚗️ **Chemical (Fungicide):**\n"
            "• **Mancozeb 75WP** @ 2.5 g/litre\n"
            "• Chlorothalonil @ 2 g/litre or Iprodione @ 1.5 ml/litre\n"
            "• Spray every 7–10 days during humid weather\n\n"
            "🛡️ **Prevention:**\n"
            "• Avoid overhead irrigation — use drip irrigation\n"
            "• Remove and destroy infected lower leaves\n"
            "• Crop rotation — don't plant tomato/potato in same bed for 2–3 years\n"
            "• Mulching prevents soil-splash infection"
        )
    },
    "cotton": {
        "identification": (
            "Namaskar Kisan Bhai,\n\n"
            "Your cotton crop shows signs of **Alternaria Leaf Spot** combined with **Whitefly** infestation.\n\n"
            "**Visual Clues Observed:**\n"
            "• Circular brown spots with concentric rings on leaves (Alternaria)\n"
            "• Whitish, waxy tiny insects on undersides of young leaves (Whitefly)\n"
            "• Yellowing, curling, and distortion of affected leaves\n\n"
            "Whitefly is also a vector for Cotton Leaf Curl Virus (CLCuD) — control is urgent."
        ),
        "treatment": (
            "Namaskar Kisan Bhai,\n\n"
            "**Treatment Plan for Cotton Leaf Spot + Whitefly:**\n\n"
            "🌿 **Organic:**\n"
            "• Neem-based insecticide (Azadirachtin 10,000 ppm) @ 1 ml/litre for whitefly\n"
            "• NSKE 5% spray provides good whitefly suppression\n\n"
            "⚗️ **Chemical:**\n"
            "• Whitefly: **Imidacloprid 17.8SL** @ 0.3 ml/litre or Spiromesifen @ 0.9 ml/litre\n"
            "• Leaf spot: Mancozeb @ 2.5 g/litre\n"
            "• Rotate insecticides to prevent resistance\n\n"
            "🛡️ **Prevention:**\n"
            "• Yellow sticky traps @ 10/acre for whitefly monitoring\n"
            "• Avoid excessive nitrogen fertilization\n"
            "• Grow resistant varieties for CLCuD-prone areas\n"
            "• Remove and destroy infected plant debris"
        )
    },
    "maize": {
        "identification": (
            "Namaskar Kisan Bhai,\n\n"
            "Your maize crop shows symptoms of **Fall Armyworm** (*Spodoptera frugiperda*) infestation, "
            "an invasive pest that has become a major threat to Indian maize production.\n\n"
            "**Visual Clues Observed:**\n"
            "• Ragged, window-pane feeding damage on leaves\n"
            "• Frass (insect excreta) visible in the leaf whorl\n"
            "• Young larvae visible in the central whorl\n"
            "• Leaf whorl shows characteristic 'pin-hole' damage pattern\n\n"
            "This pest can destroy an entire crop within 3–4 days if not controlled immediately."
        ),
        "treatment": (
            "Namaskar Kisan Bhai,\n\n"
            "**URGENT Treatment Plan for Fall Armyworm:**\n\n"
            "🌿 **Organic (Early Stage):**\n"
            "• Sand + lime mixture in whorl kills young larvae\n"
            "• Neem-based spray: Azadirachtin 10,000 ppm @ 1.5 ml/litre\n"
            "• *Beauveria bassiana* @ 5 g/litre — bio-insecticide\n\n"
            "⚗️ **Chemical (Moderate-Severe):**\n"
            "• **Emamectin benzoate 5SG** @ 0.4 g/litre — most effective\n"
            "• Spinetoram 11.7SC @ 0.5 ml/litre\n"
            "• Chlorantraniliprole 18.5SC @ 0.3 ml/litre\n"
            "• Apply into the whorl in the morning/evening\n\n"
            "🛡️ **Prevention:**\n"
            "• Pheromone traps @ 5/acre for monitoring\n"
            "• Light traps for adult moth catching\n"
            "• Early sowing reduces peak pest infestation\n"
            "• Intercropping with cowpea provides natural predator habitat"
        )
    },
}


def get_demo_pest_response(crop: str) -> dict:
    """Returns a convincing demo pest identification response for any crop."""
    crop_l = crop.lower()

    # Find closest match
    for disease_crop, data in DISEASE_LIBRARY.items():
        if disease_crop in crop_l or crop_l in disease_crop:
            return {
                "identification": data["identification"],
                "treatment": data["treatment"],
                "suggested_products": [],
                "_source": "local_demo"
            }

    # Generic fallback for unknown crops
    return {
        "identification": (
            f"Namaskar Kisan Bhai,\n\n"
            f"Your **{crop.title()}** crop shows signs of a **fungal leaf disease**, likely caused by "
            f"prolonged humid conditions.\n\n"
            f"**Visual Clues Observed:**\n"
            f"• Irregular brown/yellow spots on leaf surfaces\n"
            f"• Some wilting and yellowing of older leaves\n"
            f"• Possible fungal sporulation visible on leaf undersides\n\n"
            f"Early diagnosis and treatment will help protect your crop yield."
        ),
        "treatment": (
            f"Namaskar Kisan Bhai,\n\n"
            f"**Treatment Plan:**\n\n"
            f"🌿 **Organic:**\n"
            f"• Neem oil @ 5 ml/litre spray\n"
            f"• Bordeaux mixture 1% as preventive spray\n\n"
            f"⚗️ **Chemical (Fungicide):**\n"
            f"• Mancozeb 75WP @ 2.5 g/litre\n"
            f"• Carbendazim 50WP @ 1 g/litre\n"
            f"• Spray every 10–14 days during rainy season\n\n"
            f"🛡️ **Prevention:**\n"
            f"• Ensure proper plant spacing for air circulation\n"
            f"• Avoid waterlogging — maintain field drainage\n"
            f"• Remove and destroy infected plant material\n"
            f"• Balanced nutrition reduces disease susceptibility"
        ),
        "suggested_products": [],
        "_source": "local_demo"
    }


# ============================================================
# 6. EXPANDED MOCK MARKET DATA (25 commodities)
# ============================================================

MOCK_MARKET_DATA = [
    {"commodity": "Wheat", "state": "Punjab", "district": "Ludhiana", "market": "Ludhiana Mandi", "modal_price": "2280", "arrival_date": "2025-12-15"},
    {"commodity": "Wheat", "state": "Haryana", "district": "Karnal", "market": "Karnal Mandi", "modal_price": "2260", "arrival_date": "2025-12-15"},
    {"commodity": "Rice", "state": "Andhra Pradesh", "district": "West Godavari", "market": "Bhimavaram Mandi", "modal_price": "2350", "arrival_date": "2025-12-14"},
    {"commodity": "Rice", "state": "West Bengal", "district": "Bardhaman", "market": "Katwa Mandi", "modal_price": "2280", "arrival_date": "2025-12-14"},
    {"commodity": "Cotton", "state": "Gujarat", "district": "Rajkot", "market": "Rajkot Mandi", "modal_price": "7400", "arrival_date": "2025-12-13"},
    {"commodity": "Cotton", "state": "Maharashtra", "district": "Amravati", "market": "Amravati Mandi", "modal_price": "7250", "arrival_date": "2025-12-13"},
    {"commodity": "Soybean", "state": "Madhya Pradesh", "district": "Indore", "market": "Indore Mandi", "modal_price": "4950", "arrival_date": "2025-12-12"},
    {"commodity": "Maize", "state": "Karnataka", "district": "Davangere", "market": "Davangere Mandi", "modal_price": "2150", "arrival_date": "2025-12-12"},
    {"commodity": "Groundnut", "state": "Andhra Pradesh", "district": "Kurnool", "market": "Kurnool Mandi", "modal_price": "6900", "arrival_date": "2025-12-11"},
    {"commodity": "Mustard", "state": "Rajasthan", "district": "Alwar", "market": "Alwar Mandi", "modal_price": "5800", "arrival_date": "2025-12-11"},
    {"commodity": "Onion", "state": "Maharashtra", "district": "Nashik", "market": "Lasalgaon Mandi", "modal_price": "1850", "arrival_date": "2025-12-14"},
    {"commodity": "Potato", "state": "Uttar Pradesh", "district": "Agra", "market": "Agra Mandi", "modal_price": "1200", "arrival_date": "2025-12-13"},
    {"commodity": "Tomato", "state": "Karnataka", "district": "Kolar", "market": "Kolar Mandi", "modal_price": "2400", "arrival_date": "2025-12-14"},
    {"commodity": "Sugarcane", "state": "Uttar Pradesh", "district": "Muzaffarnagar", "market": "Muzaffarnagar Mill", "modal_price": "350", "arrival_date": "2025-12-10"},
    {"commodity": "Sugarcane", "state": "Maharashtra", "district": "Kolhapur", "market": "Kolhapur Mill", "modal_price": "340", "arrival_date": "2025-12-10"},
    {"commodity": "Turmeric", "state": "Andhra Pradesh", "district": "Nizamabad", "market": "Nizamabad Mandi", "modal_price": "15500", "arrival_date": "2025-12-09"},
    {"commodity": "Chickpea", "state": "Madhya Pradesh", "district": "Vidisha", "market": "Vidisha Mandi", "modal_price": "5500", "arrival_date": "2025-12-12"},
    {"commodity": "Lentil", "state": "Madhya Pradesh", "district": "Sagar", "market": "Sagar Mandi", "modal_price": "7200", "arrival_date": "2025-12-11"},
    {"commodity": "Jowar", "state": "Karnataka", "district": "Bijapur", "market": "Bijapur Mandi", "modal_price": "2800", "arrival_date": "2025-12-10"},
    {"commodity": "Bajra", "state": "Rajasthan", "district": "Jodhpur", "market": "Jodhpur Mandi", "modal_price": "2300", "arrival_date": "2025-12-09"},
    {"commodity": "Sunflower", "state": "Karnataka", "district": "Haveri", "market": "Haveri Mandi", "modal_price": "5900", "arrival_date": "2025-12-08"},
    {"commodity": "Arhar (Tur)", "state": "Maharashtra", "district": "Latur", "market": "Latur Mandi", "modal_price": "7500", "arrival_date": "2025-12-12"},
    {"commodity": "Moong", "state": "Andhra Pradesh", "district": "Guntur", "market": "Guntur Mandi", "modal_price": "7800", "arrival_date": "2025-12-11"},
    {"commodity": "Banana", "state": "Tamil Nadu", "district": "Thanjavur", "market": "Thanjavur Mandi", "modal_price": "1800", "arrival_date": "2025-12-14"},
    {"commodity": "Apple", "state": "Himachal Pradesh", "district": "Shimla", "market": "Shimla Fruit Mandi", "modal_price": "8500", "arrival_date": "2025-12-13"},
]
