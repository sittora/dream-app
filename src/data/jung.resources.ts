export type ResourceKind = "book" | "collected_work" | "essay" | "research";

export interface JungResource {
  id: string;
  title: string;
  author: "C. G. Jung";
  year?: number;
  cw?: string;
  publisher?: string;
  resourceType: ResourceKind;
  tags: string[];
  description: string;
  link?: string;
}

export const JUNG_PRIMARY_RESOURCES: JungResource[] = [
  {
    id: "symbols-of-transformation",
    title: "Symbols of Transformation",
    author: "C. G. Jung",
    year: 1956,
    cw: "CW 5",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["libido","myth","symbolism","development"],
    description: "Major early work reinterpreting libido as symbolic energy, tracing mythic motifs and their role in psychic development."
  },
  {
    id: "psychological-types",
    title: "Psychological Types",
    author: "C. G. Jung",
    year: 1923,
    cw: "CW 6",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["typology","extraversion","introversion","thinking","feeling","sensation","intuition"],
    description: "Foundational typology introducing attitudes and functions of consciousness; basis for later type theory."
  },
  {
    id: "two-essays-on-analytical-psychology",
    title: "Two Essays on Analytical Psychology",
    author: "C. G. Jung",
    year: 1953,
    cw: "CW 7",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["individuation","complexes","self","ego"],
    description: "Synthesizes Jung's core ideas on the structure of the psyche and the individuation process."
  },
  {
    id: "the-structure-and-dynamics-of-the-psyche",
    title: "The Structure and Dynamics of the Psyche",
    author: "C. G. Jung",
    year: 1960,
    cw: "CW 8",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["psyche","synchronicity","complexes","dynamics"],
    description: 'Key theoretical essays on psychic energy, complexes, and synchronicity ("An Acausal Connecting Principle").'
  },
  {
    id: "the-archetypes-and-the-collective-unconscious",
    title: "The Archetypes and the Collective Unconscious",
    author: "C. G. Jung",
    year: 1959,
    cw: "CW 9i",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["archetypes","collective-unconscious","myth"],
    description: "Definitive statement on archetypes and their symbolic expression across myth, religion, and dreams."
  },
  {
    id: "aion",
    title: "Aion: Researches into the Phenomenology of the Self",
    author: "C. G. Jung",
    year: 1959,
    cw: "CW 9ii",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["self","shadow","anima-animus","symbolism"],
    description: "Explores the Self, shadow, and anima/animus through historical symbolism and Christian imagery."
  },
  {
    id: "civilization-in-transition",
    title: "Civilization in Transition",
    author: "C. G. Jung",
    year: 1964,
    cw: "CW 10",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["culture","society","modernity"],
    description: "Essays on the psychological situation of modern society; includes 'The Undiscovered Self'."
  },
  {
    id: "psychology-and-religion",
    title: "Psychology and Religion: West and East",
    author: "C. G. Jung",
    year: 1969,
    cw: "CW 11",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["religion","east-west","symbol","answer-to-job"],
    description: "Studies in comparative religion and symbolism; includes 'Answer to Job'."
  },
  {
    id: "psychology-and-alchemy",
    title: "Psychology and Alchemy",
    author: "C. G. Jung",
    year: 1968,
    cw: "CW 12",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["alchemy","individuation","symbol"],
    description: "Shows alchemy as a historical projection of individuation processes revealed in dreams and images."
  },
  {
    id: "alchemical-studies",
    title: "Alchemical Studies",
    author: "C. G. Jung",
    year: 1967,
    cw: "CW 13",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["alchemy","symbol","myth"],
    description: "Papers deepening Jung's symbolic reading of alchemical texts and imagery."
  },
  {
    id: "mysterium-coniunctionis",
    title: "Mysterium Coniunctionis",
    author: "C. G. Jung",
    year: 1970,
    cw: "CW 14",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["coniunctio","alchemy","self","integration"],
    description: "Jung's late masterwork on the coniunctio - the union of opposites - as the symbolic endpoint of individuation."
  },
  {
    id: "the-practice-of-psychotherapy",
    title: "The Practice of Psychotherapy",
    author: "C. G. Jung",
    year: 1966,
    cw: "CW 16",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["therapy","transference","technique"],
    description: "Clinical papers on method, transference, and practical conduct of analysis."
  },
  {
    id: "the-development-of-personality",
    title: "The Development of Personality",
    author: "C. G. Jung",
    year: 1954,
    cw: "CW 17",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["child-development","education","individuation"],
    description: "Essays on child development, education, and factors shaping personality."
  },
  {
    id: "modern-man-in-search-of-a-soul",
    title: "Modern Man in Search of a Soul",
    author: "C. G. Jung",
    year: 1933,
    publisher: "Harcourt / later Princeton UP editions",
    resourceType: "book",
    tags: ["clinical","religion","culture"],
    description: "Accessible collection introducing core Jungian themes in therapy, culture, and religion."
  },
  {
    id: "memories-dreams-reflections",
    title: "Memories, Dreams, Reflections",
    author: "C. G. Jung",
    year: 1961,
    publisher: "Vintage / Pantheon; later Princeton editions",
    resourceType: "book",
    tags: ["autobiography","dreams","development"],
    description: "Autobiographical reflections (with Aniela Jaffé) on Jung's inner life, dreams, and the evolution of his ideas."
  },
  {
    id: "the-undiscovered-self",
    title: "The Undiscovered Self",
    author: "C. G. Jung",
    year: 1957,
    publisher: "Signet / Princeton editions; also in CW 10",
    resourceType: "book",
    tags: ["individual-society","freedom","mass-psychology"],
    description: "Short work on the individual's task amid mass society; later included in Civilization in Transition (CW 10)."
  },
  {
    id: "answer-to-job",
    title: "Answer to Job",
    author: "C. G. Jung",
    year: 1952,
    cw: "CW 11",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "essay",
    tags: ["theology","symbol","shadow","divine"],
    description: "A provocative symbolic reading of the Book of Job and the problem of evil."
  }
];

export default JUNG_PRIMARY_RESOURCES;
