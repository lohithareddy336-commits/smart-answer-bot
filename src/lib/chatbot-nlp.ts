// Simple NLP intent classifier using bag-of-words + cosine similarity.
// Trains on labeled example phrases per intent, then classifies user input.

export type Intent = {
  tag: string;
  question: string;
  patterns: string[];
  response: string;
};

export const INTENTS: Intent[] = [
  {
    tag: "prime_minister",
    question: "Who is our Prime Minister?",
    patterns: [
      "who is our prime minister",
      "current prime minister of india",
      "name of pm",
      "who is the pm",
      "india prime minister",
    ],
    response:
      "The current Prime Minister of India is Shri Narendra Modi, serving his third consecutive term since 2024. He leads the Bharatiya Janata Party (BJP) and assumed office for the first time in May 2014.",
  },
  {
    tag: "dhoni",
    question: "Tell me about Dhoni.",
    patterns: [
      "tell me about dhoni",
      "who is ms dhoni",
      "mahendra singh dhoni",
      "dhoni cricketer",
      "captain cool",
    ],
    response:
      "Mahendra Singh Dhoni (MSD), born 7 July 1981 in Ranchi, is a legendary Indian cricketer and former captain of the Indian national team. Known as 'Captain Cool', he led India to the 2007 T20 World Cup, the 2011 ODI World Cup, and the 2013 Champions Trophy — the only captain to win all three ICC white-ball trophies. He also captains Chennai Super Kings in the IPL.",
  },
  {
    tag: "startup",
    question: "How to start a startup?",
    patterns: [
      "how to start a startup",
      "starting a business",
      "how do i build a startup",
      "launch a company",
      "create startup steps",
    ],
    response:
      "To start a startup: (1) Identify a real problem worth solving, (2) Validate the idea with potential customers, (3) Build a minimum viable product (MVP), (4) Choose a co-founder and form a legal entity, (5) Get early users and iterate on feedback, (6) Raise funding (bootstrapping, angel, or VC) when you have traction, and (7) Scale your team, product, and distribution. Focus on solving the problem — the business follows.",
  },
  {
    tag: "booming_sectors",
    question: "Which sectors will boom in the next 10 years?",
    patterns: [
      "which sectors will boom in the next 10 years",
      "future booming industries",
      "best industries to invest in",
      "growth sectors next decade",
      "top sectors future",
    ],
    response:
      "Sectors expected to boom in the next 10 years include: Artificial Intelligence & Machine Learning, Renewable Energy (solar, EV, green hydrogen), Electric Vehicles, HealthTech & Biotech, FinTech, Cybersecurity, Space Technology, Semiconductors, EdTech, and Climate Tech. India-specific bets include manufacturing (PLI schemes), defence, and digital public infrastructure.",
  },
  {
    tag: "travel_india",
    question: "Good places to travel in India",
    patterns: [
      "good places to travel in india",
      "best tourist destinations in india",
      "where to visit in india",
      "india travel spots",
      "top places india",
    ],
    response:
      "Top travel destinations in India: Leh-Ladakh (mountains & monasteries), Goa (beaches), Kerala (backwaters & Munnar), Rajasthan (Jaipur, Udaipur, Jaisalmer), Himachal Pradesh (Manali, Spiti), Uttarakhand (Rishikesh, Nainital), Andaman Islands, Varanasi (spiritual), Meghalaya (Cherrapunji, Shillong), and Hampi (heritage). Each offers a unique mix of culture, nature, and adventure.",
  },
  {
    tag: "ai_meaning",
    question: "What does AI mean?",
    patterns: [
      "what is ai",
      "ai meaning",
      "what does artificial intelligence mean",
      "define ai",
      "explain artificial intelligence",
    ],
    response:
      "Artificial Intelligence (AI) is the branch of computer science that builds machines and software capable of performing tasks that usually require human intelligence — such as understanding language, recognizing images, making decisions, and learning from data. Modern AI is largely powered by machine learning and deep neural networks.",
  },
  {
    tag: "ml_meaning",
    question: "What is Machine Learning?",
    patterns: [
      "what is machine learning",
      "machine learning meaning",
      "define ml",
      "explain machine learning",
      "ml definition",
    ],
    response:
      "Machine Learning (ML) is a subfield of AI where computers learn patterns from data instead of being explicitly programmed. Given examples, an ML model adjusts its internal parameters to make predictions or decisions. Common types are supervised learning, unsupervised learning, and reinforcement learning.",
  },
  {
    tag: "data_science_scope",
    question: "What is the scope of Data Science?",
    patterns: [
      "what is the scope of data science",
      "data science scope",
      "future of data science",
      "career in data science",
      "is data science a good field",
    ],
    response:
      "Data Science has an excellent scope. Every industry — finance, healthcare, e-commerce, manufacturing, sports, entertainment — needs data scientists to extract insights from data. Roles include Data Analyst, Data Scientist, ML Engineer, and AI Researcher, with strong salary growth and global demand expected to keep rising through the 2030s.",
  },
  {
    tag: "cybersecurity_importance",
    question: "Why is cybersecurity important?",
    patterns: [
      "why is cybersecurity important",
      "importance of cyber security",
      "cybersecurity importance",
      "why do we need cybersecurity",
      "cyber security significance",
    ],
    response:
      "Cybersecurity is critical because almost every part of our life — banking, healthcare, communication, government services — runs on connected digital systems. It protects sensitive data, prevents financial losses, defends against ransomware and identity theft, ensures business continuity, and safeguards national security. As attacks grow more sophisticated, strong cybersecurity is non-negotiable.",
  },
  {
    tag: "best_language",
    question: "What is the best programming language?",
    patterns: [
      "best programming language",
      "which programming language should i learn",
      "top programming language",
      "best coding language to learn",
      "what language is best for beginners",
    ],
    response:
      "There is no single 'best' language — it depends on your goal. Python is best for AI/ML, data science, and beginners. JavaScript/TypeScript dominate web development. Java and Kotlin are used for Android and enterprise. Swift is for iOS. C++ powers games and systems. Go and Rust shine in backend and systems. For most newcomers in 2025, start with Python or JavaScript.",
  },
];

const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "am",
  "i", "you", "we", "they", "he", "she", "it", "me", "us", "them",
  "my", "your", "our", "their", "his", "her", "its",
  "to", "of", "in", "on", "at", "by", "for", "with", "from", "as",
  "and", "or", "but", "if", "then", "so", "do", "does", "did",
  "have", "has", "had", "can", "could", "would", "should", "will",
  "about", "tell", "please", "hey", "hi", "hello",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, " ")
    .replace(/_/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOPWORDS.has(t));
}

function vectorize(tokens: string[], vocab: Map<string, number>): number[] {
  const v = new Array(vocab.size).fill(0);
  for (const t of tokens) {
    const idx = vocab.get(t);
    if (idx !== undefined) v[idx] += 1;
  }
  return v;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Build vocabulary + per-intent average vector at module load (training).
const VOCAB = new Map<string, number>();
for (const intent of INTENTS) {
  for (const p of intent.patterns) {
    for (const tok of tokenize(p)) {
      if (!VOCAB.has(tok)) VOCAB.set(tok, VOCAB.size);
    }
  }
}

const INTENT_VECTORS = INTENTS.map((intent) => {
  const vecs = intent.patterns.map((p) => vectorize(tokenize(p), VOCAB));
  const avg = new Array(VOCAB.size).fill(0);
  for (const v of vecs) for (let i = 0; i < v.length; i++) avg[i] += v[i];
  for (let i = 0; i < avg.length; i++) avg[i] /= vecs.length;
  return avg;
});

export type ClassifyResult = {
  intent: Intent | null;
  confidence: number;
  response: string;
};

export function classify(input: string): ClassifyResult {
  const tokens = tokenize(input);
  if (tokens.length === 0) {
    return {
      intent: null,
      confidence: 0,
      response: "Please type a question so I can help.",
    };
  }
  const vec = vectorize(tokens, VOCAB);
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < INTENT_VECTORS.length; i++) {
    const s = cosine(vec, INTENT_VECTORS[i]);
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }
  if (bestIdx === -1 || bestScore < 0.2) {
    return {
      intent: null,
      confidence: bestScore,
      response:
        "I'm trained on 10 specific questions. Try asking about: India's PM, MS Dhoni, startups, booming sectors, travel in India, AI, Machine Learning, Data Science, Cybersecurity, or the best programming language.",
    };
  }
  const intent = INTENTS[bestIdx];
  return { intent, confidence: bestScore, response: intent.response };
}
