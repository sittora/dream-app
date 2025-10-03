export type ResourceKind = "book" | "collected_work" | "essay" | "research" | "video" | "article";

export interface JungResource {
  id: string;
  title: string;
  author: string; // Changed from "C. G. Jung" to allow other authors
  year?: number;
  cw?: string;
  publisher?: string;
  resourceType: ResourceKind;
  tags: string[];
  description: string;
  link?: string;
}

export const JUNG_PRIMARY_RESOURCES: JungResource[] = [
  // Essential Books by Jung
  {
    id: "modern-man-in-search-of-a-soul",
    title: "Modern Man in Search of a Soul",
    author: "C. G. Jung",
    year: 1933,
    publisher: "Harcourt",
    resourceType: "book",
    tags: ["clinical","religion","culture","intro"],
    description: "An accessible introduction to Jung's core concepts, perfect for newcomers to Jungian psychology.",
    link: "https://archive.org/details/in.ernet.dli.2015.177983"
  },
  {
    id: "memories-dreams-reflections",
    title: "Memories, Dreams, Reflections",
    author: "C. G. Jung",
    year: 1961,
    publisher: "Vintage",
    resourceType: "book",
    tags: ["autobiography","dreams","development","personal"],
    description: "Jung's autobiographical masterpiece revealing his inner life, dreams, and the evolution of his psychological theories.",
    link: "https://archive.org/details/memoriesdreasref0000jung"
  },
  {
    id: "man-and-his-symbols",
    title: "Man and His Symbols",
    author: "C. G. Jung",
    year: 1964,
    publisher: "Dell Publishing",
    resourceType: "book",
    tags: ["symbols","unconscious","dreams","accessible"],
    description: "Jung's most accessible work on symbols and their meaning, written for the general public and richly illustrated.",
    link: "https://archive.org/details/manhissymbols0000jung"
  },
  {
    id: "the-undiscovered-self",
    title: "The Undiscovered Self",
    author: "C. G. Jung",
    year: 1957,
    publisher: "Princeton University Press",
    resourceType: "book",
    tags: ["individual-society","freedom","mass-psychology","modern"],
    description: "A profound examination of the individual's role in mass society and the importance of psychological understanding.",
    link: "https://archive.org/details/undiscoveredself0000jung"
  },

  // Collected Works (Essential Volumes)
  {
    id: "psychological-types",
    title: "Psychological Types",
    author: "C. G. Jung",
    year: 1921,
    cw: "CW 6",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["typology","extraversion","introversion","thinking","feeling","sensation","intuition","MBTI"],
    description: "The foundational work on psychological types that became the basis for the Myers-Briggs Type Indicator.",
    link: "https://archive.org/details/psychologicaltyp0000jung"
  },
  {
    id: "two-essays-on-analytical-psychology",
    title: "Two Essays on Analytical Psychology",
    author: "C. G. Jung",
    year: 1953,
    cw: "CW 7",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["individuation","complexes","self","ego","analytical"],
    description: "Essential reading on the structure of the psyche and the individuation process.",
    link: "https://archive.org/details/twoessaysonanalytic0000jung"
  },
  {
    id: "the-archetypes-and-the-collective-unconscious",
    title: "The Archetypes and the Collective Unconscious",
    author: "C. G. Jung",
    year: 1959,
    cw: "CW 9i",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["archetypes","collective-unconscious","myth","anima","animus","shadow"],
    description: "The definitive work on archetypes and their symbolic expression across cultures and individuals.",
    link: "https://archive.org/details/archetypescollec0000jung"
  },
  {
    id: "psychology-and-alchemy",
    title: "Psychology and Alchemy",
    author: "C. G. Jung",
    year: 1968,
    cw: "CW 12",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["alchemy","individuation","symbol","transformation"],
    description: "Jung's exploration of alchemy as a historical projection of individuation processes revealed in dreams and images.",
    link: "https://archive.org/details/psychologyalchem0000jung"
  },

  // Additional Important Works - Free PDF Sources
  {
    id: "symbols-of-transformation",
    title: "Symbols of Transformation",
    author: "C. G. Jung",
    year: 1912,
    cw: "CW 5",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "collected_work",
    tags: ["libido","myth","symbolism","development","transformation"],
    description: "Jung's breakthrough work that led to his split with Freud, exploring the symbolic nature of libido and transformation.",
    link: "https://archive.org/details/symbolsoftransfo0000jung"
  },
  {
    id: "the-red-book",
    title: "The Red Book (Liber Novus) - Preview",
    author: "C. G. Jung",
    year: 2009,
    publisher: "W. W. Norton",
    resourceType: "book",
    tags: ["red-book","visions","active-imagination","personal","visionary"],
    description: "Jung's private journal of visions and active imagination, a foundational document of depth psychology. (Preview version)",
    link: "https://www.scribd.com/document/43832066/C-G-Jung-The-Red-Book-Liber-Novus"
  },

  // Essential Secondary Sources
  {
    id: "jung-essential-reader",
    title: "The Essential Jung",
    author: "Anthony Storr (Editor)",
    year: 1983,
    publisher: "Princeton University Press",
    resourceType: "book",
    tags: ["anthology","essential","introduction","selected-works"],
    description: "A carefully curated selection of Jung's most important writings, ideal for understanding his core concepts.",
    link: "https://archive.org/details/essentialjungsel0000stor"
  },
  {
    id: "jung-biography-deirdre-bair",
    title: "Jung: A Biography",
    author: "Deirdre Bair",
    year: 2003,
    publisher: "Back Bay Books",
    resourceType: "book",
    tags: ["biography","life","comprehensive","scholarly"],
    description: "The most comprehensive and balanced biography of Jung, based on extensive research and previously unavailable materials.",
    link: "https://archive.org/details/jung0000bair"
  },
  {
    id: "jung-lexicon",
    title: "A Critical Dictionary of Jungian Analysis",
    author: "Andrew Samuels, Bani Shorter, Fred Plaut",
    year: 1986,
    publisher: "Routledge",
    resourceType: "book",
    tags: ["dictionary","reference","concepts","analysis","terminology"],
    description: "An essential reference work defining and explaining key Jungian concepts and terminology.",
    link: "https://archive.org/details/criticaldictiona0000samu"
  },

  // Free Online Books and PDFs
  {
    id: "psychology-of-unconscious",
    title: "Psychology of the Unconscious",
    author: "C. G. Jung",
    year: 1912,
    publisher: "Moffat, Yard and Company",
    resourceType: "book",
    tags: ["unconscious","early-work","freud","break","libido"],
    description: "Jung's early masterwork that marked his departure from Freudian psychoanalysis.",
    link: "https://www.gutenberg.org/ebooks/15414"
  },
  {
    id: "studies-word-association",
    title: "Studies in Word Association",
    author: "C. G. Jung",
    year: 1918,
    publisher: "William Heinemann",
    resourceType: "book",
    tags: ["word-association","experiments","complexes","early-research"],
    description: "Jung's pioneering experimental work on word association and the discovery of complexes.",
    link: "https://archive.org/details/studiesinwordass0000jung"
  },
  {
    id: "answer-to-job",
    title: "Answer to Job",
    author: "C. G. Jung",
    year: 1952,
    cw: "CW 11",
    publisher: "Princeton University Press (Bollingen Series)",
    resourceType: "essay",
    tags: ["theology","symbol","shadow","divine","religion"],
    description: "A provocative symbolic reading of the Book of Job and the problem of evil.",
    link: "https://archive.org/details/answertojob0000jung"
  },

  // Additional Free Jung Works
  {
    id: "analytical-psychology-theory-practice",
    title: "Analytical Psychology: Its Theory and Practice",
    author: "C. G. Jung",
    year: 1968,
    publisher: "Vintage Books",
    resourceType: "book",
    tags: ["analytical","theory","practice","lectures","tavistock"],
    description: "Jung's Tavistock Lectures, providing a comprehensive overview of analytical psychology for professionals.",
    link: "https://ia801605.us.archive.org/3/items/AnalyticalPsychologyItsTheoryAndPractice/Analytical%20Psychology%20Its%20Theory%20and%20Practice.pdf"
  },
  {
    id: "flying-saucers",
    title: "Flying Saucers: A Modern Myth",
    author: "C. G. Jung",
    year: 1958,
    publisher: "Princeton University Press",
    resourceType: "book",
    tags: ["ufos","modern-myth","projection","collective-unconscious"],
    description: "Jung's analysis of the UFO phenomenon as a modern psychological and mythological manifestation.",
    link: "https://ia800503.us.archive.org/22/items/pdfy-Ml_VkF0ZFMd3si8t/Flying%20Saucers-%20A%20Modern%20Myth%20of%20Things%20Seen%20in%20the%20Skies.pdf"
  },
  {
    id: "aion-researches-phenomenology-self",
    title: "Aion: Researches into the Phenomenology of the Self",
    author: "C. G. Jung",
    year: 1951,
    cw: "CW 9ii",
    publisher: "Princeton University Press",
    resourceType: "book",
    tags: ["aion","self","christ","archetype","shadow"],
    description: "Jung's exploration of the archetype of the Self through the symbol of Christ and the development of consciousness.",
    link: "https://ia800504.us.archive.org/35/items/C.G.Jung-CollectedWorks/C.G.%20Jung%20-%20Collected%20Works%20Volume%2009ii%20-%20Aion%20-%20Researches%20into%20the%20Phenomenology%20of%20the%20Self.pdf"
  },
  {
    id: "synchronicity-acausal-principle",
    title: "Synchronicity: An Acausal Connecting Principle",
    author: "C. G. Jung",
    year: 1952,
    publisher: "Princeton University Press",
    resourceType: "essay",
    tags: ["synchronicity","acausal","meaningful-coincidence","physics"],
    description: "Jung's groundbreaking essay introducing the concept of synchronicity and meaningful coincidence.",
    link: "https://ia600503.us.archive.org/27/items/SynchronicityAnAcausalConnectingPrincipleAudiobook/Synchronicity-%20An%20Acausal%20Connecting%20Principle.pdf"
  },

  // Video Resources
  {
    id: "jung-matter-of-heart",
    title: "Jung: A Matter of Heart",
    author: "Mark Whitney (Director)",
    year: 1985,
    resourceType: "video",
    tags: ["documentary","interviews","analysts","biography"],
    description: "A comprehensive documentary featuring interviews with Jung's colleagues and insights into his work and influence.",
    link: "https://www.youtube.com/watch?v=YiXBqBeFhGY"
  },
  {
    id: "jung-bbc-interview",
    title: "Jung's BBC Interview: Face to Face",
    author: "BBC",
    year: 1959,
    resourceType: "video",
    tags: ["interview","rare","personal","beliefs","god"],
    description: "Rare interview where Jung discusses his beliefs about God, UFOs, and the nature of the psyche.",
    link: "https://www.youtube.com/watch?v=2AMu-G51yTY"
  },
  {
    id: "jordan-peterson-jung-maps",
    title: "Maps of Meaning: Jung's Psychology",
    author: "Jordan Peterson",
    year: 2017,
    resourceType: "video",
    tags: ["lecture","modern","interpretation","maps-of-meaning","mythology"],
    description: "Modern interpretation of Jungian concepts through the lens of evolutionary psychology and mythology.",
    link: "https://www.youtube.com/watch?v=I8Xc2_FtpHI"
  },
  {
    id: "academy-of-ideas-jung",
    title: "Carl Jung's Psychology: Understanding the Shadow",
    author: "Academy of Ideas",
    year: 2019,
    resourceType: "video",
    tags: ["shadow","educational","animated","psychology"],
    description: "Clear, animated explanation of Jung's concept of the Shadow and its role in personal development.",
    link: "https://www.youtube.com/watch?v=janOI8_gYLM"
  },

  // Academic Articles and Essays
  {
    id: "jung-stanford-encyclopedia",
    title: "Carl Gustav Jung (Stanford Encyclopedia of Philosophy)",
    author: "Stanford Encyclopedia of Philosophy",
    year: 2020,
    resourceType: "article",
    tags: ["academic","philosophy","overview","scholarly"],
    description: "Comprehensive academic overview of Jung's life, work, and philosophical contributions.",
    link: "https://plato.stanford.edu/entries/jung/"
  },
  {
    id: "jung-active-imagination",
    title: "Active Imagination: Jung's Method of Dialogue with the Unconscious",
    author: "Jungian Center",
    year: 2021,
    resourceType: "article",
    tags: ["active-imagination","technique","practice","unconscious"],
    description: "Detailed explanation of Jung's active imagination technique and its practical applications.",
    link: "https://cgjungpage.org/learn/articles/analytical-psychology/active-imagination"
  },
  {
    id: "jung-synchronicity-explained",
    title: "Understanding Synchronicity: Jung's Concept of Meaningful Coincidence",
    author: "Carl Jung Depth Psychology",
    year: 2022,
    resourceType: "article",
    tags: ["synchronicity","coincidence","meaning","acausal"],
    description: "In-depth exploration of Jung's concept of synchronicity with practical examples and applications.",
    link: "https://carljungdepthpsychology.blogspot.com/2014/11/carl-jung-synchronicity.html"
  },
  {
    id: "jung-dreams-interpretation",
    title: "Dream Analysis in Jungian Psychology",
    author: "Society of Analytical Psychology",
    year: 2023,
    resourceType: "article",
    tags: ["dreams","analysis","interpretation","methods"],
    description: "Professional guide to Jungian dream analysis techniques and interpretation methods.",
    link: "https://www.britannica.com/science/dream/Psychoanalytic-interpretations"
  },
  {
    id: "jung-shadow-work",
    title: "Shadow Work: Integrating the Dark Side",
    author: "Jungian Psychology Resources",
    year: 2023,
    resourceType: "article",
    tags: ["shadow","integration","personal-development","darkness"],
    description: "Comprehensive guide to understanding and working with the shadow in personal development.",
    link: "https://cgjungpage.org/learn/articles/the-psychology-of-carl-gustav-jung/the-shadow"
  },
  {
    id: "jung-collective-unconscious-explained",
    title: "The Collective Unconscious: Jung's Revolutionary Concept",
    author: "Psychology Today",
    year: 2022,
    resourceType: "article",
    tags: ["collective-unconscious","archetypes","universal","patterns"],
    description: "Clear explanation of Jung's theory of the collective unconscious and its implications.",
    link: "https://www.psychologytoday.com/us/basics/collective-unconscious"
  },

  // Institutions and Organizations
  {
    id: "cg-jung-institute-zurich",
    title: "C.G. Jung Institute Zurich",
    author: "C.G. Jung Institute",
    year: 2024,
    resourceType: "article",
    tags: ["institute","training","official","zurich","education"],
    description: "The premier institution for Jungian training and education, founded by Jung himself.",
    link: "https://www.jung-institut-zurich.ch/en/"
  },
  {
    id: "philemon-foundation",
    title: "Philemon Foundation - Jung Archives",
    author: "Philemon Foundation",
    year: 2024,
    resourceType: "research",
    tags: ["archive","manuscripts","red-book","research","foundation"],
    description: "Access to Jung's unpublished works, manuscripts, and the complete Red Book materials.",
    link: "https://philemonfoundation.org/"
  },
  {
    id: "iaap-resources",
    title: "International Association for Analytical Psychology",
    author: "IAAP",
    year: 2024,
    resourceType: "research",
    tags: ["professional","analysts","training","worldwide"],
    description: "Global organization of Jungian analysts providing training, certification, and resources.",
    link: "https://iaap.org/"
  },

  // Additional Reliable Free Resources
  {
    id: "jung-introduction-to-unconscious",
    title: "Introduction to the Religious and Psychological Problems of Alchemy",
    author: "C. G. Jung",
    year: 1944,
    publisher: "Princeton University Press",
    resourceType: "book",
    tags: ["alchemy","religious","psychological","introduction"],
    description: "Jung's accessible introduction to the psychological significance of alchemical symbolism.",
    link: "https://ia902609.us.archive.org/19/items/jungcollectedwor12cgju/jungcollectedwor12cgju.pdf"
  },
  {
    id: "jung-structure-dynamics-psyche",
    title: "The Structure and Dynamics of the Psyche",
    author: "C. G. Jung",
    year: 1960,
    cw: "CW 8",
    publisher: "Princeton University Press",
    resourceType: "collected_work",
    tags: ["structure","dynamics","psyche","energy","libido"],
    description: "Fundamental work on the structure and energetic principles of the psyche.",
    link: "https://ia902609.us.archive.org/35/items/C.G.Jung-CollectedWorks/C.G.%20Jung%20-%20Collected%20Works%20Volume%2008%20-%20The%20Structure%20and%20Dynamics%20of%20the%20Psyche.pdf"
  },
  {
    id: "jung-experimental-researches",
    title: "Experimental Researches",
    author: "C. G. Jung",
    year: 1973,
    cw: "CW 2",
    publisher: "Princeton University Press",
    resourceType: "collected_work",
    tags: ["experimental","research","word-association","complexes"],
    description: "Jung's early experimental work including the famous word association studies.",
    link: "https://ia902309.us.archive.org/35/items/C.G.Jung-CollectedWorks/C.G.%20Jung%20-%20Collected%20Works%20Volume%2002%20-%20Experimental%20Researches.pdf"
  },

  // Modern Applications
  {
    id: "jung-ai-therapy",
    title: "Jung and Modern Psychology: Contemporary Applications",
    author: "Jungian Society",
    year: 2023,
    resourceType: "article",
    tags: ["modern","therapy","technology","contemporary"],
    description: "Exploration of how Jungian concepts are being applied in modern therapeutic and educational settings.",
    link: "https://jungiansociety.org/jung-academy/what-is-jungian-analysis"
  }
];

export default JUNG_PRIMARY_RESOURCES;
