// This array holds all your scheme information.
// You can easily add, remove, or edit schemes here.

export const schemes = [
  {
    id: 1,
    title: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    category: "Income Support",
    description: "Direct income support of ₹6,000 per year to all landholding farmer families.",
    eligibility: "All landholding farmers (including sharecroppers) with cultivable land.",
    benefits: "₹6,000 per year in three equal installments of ₹2,000 each.",
    howToApply: "Apply online at pmkisan.gov.in or visit nearest Common Service Centre (CSC)."
  },
  {
    id: 2,
    title: "Soil Health Card Scheme",
    category: "Soil Management",
    description: "Provides soil health cards to farmers containing crop-wise recommendations of nutrients and fertilizers.",
    eligibility: "All farmers across India.",
    benefits: "Free soil testing and personalized nutrient management recommendations.",
    howToApply: "Contact District Agriculture Office or visit soilhealth.dac.gov.in."
  },
  {
    id: 3,
    title: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "Insurance",
    description: "Comprehensive crop insurance scheme protecting farmers against crop loss.",
    eligibility: "All farmers including sharecroppers and tenant farmers.",
    benefits: "Coverage for crop loss due to natural calamities, pests, and diseases. Premium: 2% for Kharif, 1.5% for Rabi crops.",
    howToApply: "Through banks, CSCs, or online at pmfby.gov.in."
  },
  {
    id: 4,
    title: "Kisan Credit Card (KCC)",
    category: "Credit",
    description: "Credit facility for farmers to meet agricultural needs and related expenses.",
    eligibility: "Individual/joint borrowers who are owner cultivators, tenant farmers, sharecroppers.",
    benefits: "Flexible credit limit, low interest rate (4% for timely repayment), insurance coverage.",
    howToApply: "Apply at nearest bank branch with land documents and identity proof."
  },
  {
    id: 5,
    title: "PM Kisan Maandhan Yojana",
    category: "Pension",
    description: "Pension scheme for small and marginal farmers providing old age security.",
    eligibility: "Small and marginal farmers aged 18-40 years.",
    benefits: "Monthly pension of ₹3,000 after 60 years of age.",
    howToApply: "Visit CSC or apply online at maandhan.in."
  },
  {
    id: 6,
    title: "National Agriculture Market (e-NAM)",
    category: "Market Access",
    description: "Online trading platform for agricultural commodities across India.",
    eligibility: "All farmers and traders.",
    benefits: "Better price discovery, transparent auction process, online payment.",
    howToApply: "Register on enam.gov.in with required documents."
  },
  {
    id: 7,
    title: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    category: "Irrigation",
    description: "Scheme to improve irrigation coverage and water use efficiency.",
    eligibility: "All farmers.",
    benefits: "Subsidy on drip/sprinkler irrigation systems, improved water access.",
    howToApply: "Contact District Agriculture Office or State Agriculture Department."
  },
  {
    id: 8,
    title: "Paramparagat Krishi Vikas Yojana (PKVY)",
    category: "Organic Farming",
    description: "Promotes organic farming through cluster approach and organic certification.",
    eligibility: "Farmers interested in organic farming.",
    benefits: "₹50,000 per hectare over 3 years, organic certification support.",
    howToApply: "Form groups of 50 farmers and apply through District Agriculture Office."
  }
];

// Automatically generate the list of categories from the data
export const categories = [
  'All', 
  ...new Set(schemes.map(scheme => scheme.category))
];