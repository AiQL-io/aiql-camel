export const BREEDS = [
  {
    id: "majahim",
    name: "Majaheem",
    nameArabic: "مجاهيم",
    group: "indigenous",
    coat: "Black",
    divergence: 0.18,
  },
  {
    id: "maghateer",
    name: "Maghateer",
    nameArabic: "مغاتير",
    group: "indigenous",
    coat: "White",
    divergence: 0.18,
  },
  {
    id: "sofr",
    name: "Sofr",
    nameArabic: "صفر",
    group: "indigenous",
    coat: "Blond",
    divergence: 0.2,
  },
  {
    id: "shaul",
    name: "Shaul",
    nameArabic: "شعل",
    group: "indigenous",
    coat: "Mixed",
    divergence: 0.2,
  },
  {
    id: "sawahli",
    name: "Sawahli",
    nameArabic: "سواحلي",
    group: "exotic",
    coat: "Light",
    divergence: 0.55,
  },
  {
    id: "somali",
    name: "Somali",
    nameArabic: "صومالي",
    group: "exotic",
    coat: "Cream",
    divergence: 0.6,
  },
];

export const REGIONS = [
  "Riyadh",
  "Makkah",
  "Eastern Province",
  "Qassim",
  "Hail",
  "Tabuk",
  "Najran",
  "Asir",
  "Al Jouf",
  "Madinah",
];

export const MALE_NAMES = [
  "Shaheen",
  "Faris",
  "Hamdan",
  "Mishari",
  "Rakan",
  "Sultan",
  "Talal",
  "Waleed",
  "Ziyad",
  "Dhabi",
];
export const FEMALE_NAMES = [
  "Wadha",
  "Noura",
  "Hessa",
  "Latifa",
  "Maha",
  "Reem",
  "Sara",
  "Aljohara",
  "Dalal",
  "Ghala",
];
export const MALE_NAMES_AR = [
  "شاهين",
  "فارس",
  "حمدان",
  "مشاري",
  "راكان",
  "سلطان",
  "طلال",
  "وليد",
  "زياد",
  "ظبي",
];
export const FEMALE_NAMES_AR = [
  "وضحى",
  "نورة",
  "حصة",
  "لطيفة",
  "مها",
  "ريم",
  "سارة",
  "الجوهرة",
  "دلال",
  "غلا",
];

export const ROLES = [
  { id: "geneticist", name: "Geneticist", org: "KFSH" },
  { id: "technician", name: "Lab Technician", org: "KFSH" },
  { id: "registrar", name: "Registrar", org: "Saudi Camel Club" },
  { id: "executive", name: "Executive", org: "Saudi Camel Club" },
  { id: "admin", name: "Platform Admin", org: "AiQL" },
];

export function buildBreedFrequencies(panel, rng) {
  const byBreed = {};
  for (const breed of BREEDS) {
    const perLocus = {};
    for (const locus of panel.loci) {
      const base = locus.populationAlleleFrequencies;
      const alleles = Object.keys(base);
      const w = {};
      let total = 0;
      for (const a of alleles) {
        const rnd = Math.pow(rng.next(), 2);
        const val = (1 - breed.divergence) * base[a] + breed.divergence * rnd;
        w[a] = val;
        total += val;
      }
      for (const a of alleles) w[a] /= total;
      perLocus[locus.locusName] = Object.entries(w);
    }
    byBreed[breed.id] = perLocus;
  }
  return byBreed;
}
