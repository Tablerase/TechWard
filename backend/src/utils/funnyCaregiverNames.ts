const firstNames = [
  "Phil",
  "Anne",
  "Neil",
  "Will",
  "Sue",
  "Pat",
  "Ben",
  "Al",
  "Tess",
  "Clara",
  "Norma",
  "Ella",
  "Paige",
  "Joy",
  "Luke",
  "Hugh",
  "Gene",
];

const medicalRoots = [
  "Medi",
  "Cardio",
  "Neuro",
  "Derma",
  "Ortho",
  "Pharma",
  "Psycho",
  "Oto",
  "Ophtha",
  "Rhino",
  "Gastro",
  "Patho",
  "Anesth",
  "Onco",
  "Uro",
  "Cysto",
  "Immuno",
  "Cerebro",
];

const funnySuffixes = [
  "sinn",
  "cillin",
  "tibiotic",
  "pathy",
  "pathic",
  "myback",
  "ache",
  "pain",
  "osis",
  "oma",
  "itis",
  "graine",
  "cure",
  "syringe",
  "cutler",
  "spayne",
  "numb",
  "mune",
  "logic",
  "stol",
];

function randomItem<T>(arr: T[]): T {
  if (!arr.length) throw new Error("Array cannot be empty");
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function funnyCaregiverNameGenerator() {
  const firstName = randomItem(firstNames);

  const medicalRoot = randomItem(medicalRoots);
  let pun = Math.random() > 0.4 ? randomItem(funnySuffixes) : "";
  const mc = Math.random() > 0.8 ? "Mc" : "";
  if (medicalRoot[medicalRoot.length - 1] === "o" && pun[0] === "o") {
    pun = pun.slice(1, pun.length)
  }
  const lastName = mc + medicalRoot + pun;

  return { firstName: firstName, lastName: lastName }
}

