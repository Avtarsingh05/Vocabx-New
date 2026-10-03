
/**
 * VocabX Data Loader Utility
 * Synchronizes local JSON nodes with the application state.
 * Hardened with high-density embedded fallbacks to ensure zero-failure variety.
 */

export interface WordEntry {
  word: string;
  meaning: string;
  example: string;
  antonym: string;
  level?: string;
  subject?: string;
}

export interface QuizEntry {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface LanguageData {
  words: WordEntry[];
  quizzes: QuizEntry[];
}

export interface SubjectGradeData {
  words: WordEntry[];
  quizzes: QuizEntry[];
}

export interface SubjectData {
  grades: Record<string, SubjectGradeData>;
}

export interface ArenaQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  requirements: string[];
  starterCode: Record<string, string>;
}

const languageCache: Record<string, LanguageData> = {};
const subjectCache: Record<string, SubjectData> = {};
const collegePrepCache: Record<string, LanguageData> = {};

/** Robust fallback data for emergency synchronization */
const DEFAULT_FALLBACK: LanguageData = {
  words: [
    { word: "Resilient", meaning: "Strong, able to recover quickly", example: "Scholars must be resilient during exams.", antonym: "Fragile", level: "Intermediate" },
    { word: "Pragmatic", meaning: "Dealing with things sensibly", example: "Take a pragmatic approach to coding.", antonym: "Idealistic", level: "Advanced" },
    { word: "Luminous", meaning: "Full of or shedding light", example: "The terminal display was luminous.", antonym: "Dim", level: "Beginner" },
    { word: "Cognitive", meaning: "Related to mental processes", example: "The AI enhances cognitive function.", antonym: "Physical", level: "Advanced" },
    { word: "Ephemeral", meaning: "Lasting for a very short time", example: "Fame is often ephemeral.", antonym: "Eternal", level: "Advanced" },
    { word: "Diligent", meaning: "Showing care and conscientiousness", example: "A diligent student masters all nodes.", antonym: "Lazy", level: "Intermediate" }
  ],
  quizzes: [
    { question: "What is the meaning of 'Resilient'?", options: ["Fragile", "Strong", "Slow", "Fast"], correctAnswer: "Strong" }
  ]
};

/** High-density subject-specific hardcoded fallbacks to ensure 100+ variety for Maths */
const SUBJECT_FALLBACKS: Record<string, WordEntry[]> = {
  maths: [
    { word: "Addition", meaning: "Finding the total or sum of two or more numbers", example: "2 + 3 = 5 is a basic addition.", antonym: "Subtraction" },
    { word: "Subtraction", meaning: "Taking one number away from another", example: "Subtraction helps find the difference.", antonym: "Addition" },
    { word: "Multiplication", meaning: "Repeated addition of a number", example: "Multiplication is faster than adding multiple times.", antonym: "Division" },
    { word: "Division", meaning: "Splitting a number into equal parts", example: "Division determines how many groups are formed.", antonym: "Multiplication" },
    { word: "Sum", meaning: "The result of an addition operation", example: "The sum of 10 and 20 is 30.", antonym: "Difference" },
    { word: "Difference", meaning: "The result of a subtraction operation", example: "The difference between 10 and 4 is 6.", antonym: "Sum" },
    { word: "Product", meaning: "The result of a multiplication operation", example: "The product of 5 and 5 is 25.", antonym: "Quotient" },
    { word: "Quotient", meaning: "The result of a division operation", example: "In 10 / 2, 5 is the quotient.", antonym: "Product" },
    { word: "Fraction", meaning: "A part of a whole number", example: "A half is a common fraction.", antonym: "Whole" },
    { word: "Decimal", meaning: "A number expressed in the scale of tens", example: "0.5 is the decimal form of a half.", antonym: "Integer" },
    { word: "Percentage", meaning: "A rate or amount in each hundred", example: "50% represents half of a total.", antonym: "Ratio" },
    { word: "Ratio", meaning: "Relationship between two amounts", example: "The ratio of boys to girls is 2:1.", antonym: "Equality" },
    { word: "Proportion", meaning: "Part, share, or number considered in comparative relation", example: "The proportion of sugar is too high.", antonym: "Disproportion" },
    { word: "Integer", meaning: "A whole number, not a fraction", example: "-5, 0, and 10 are all integers.", antonym: "Fraction" },
    { word: "Prime Number", meaning: "Number divisible only by 1 and itself", example: "7 is a prime number.", antonym: "Composite Number" },
    { word: "Composite Number", meaning: "Positive integer with more than two factors", example: "4 and 6 are composite numbers.", antonym: "Prime Number" },
    { word: "Even Number", meaning: "Number divisible by 2", example: "2, 4, and 6 are even numbers.", antonym: "Odd Number" },
    { word: "Odd Number", meaning: "Number not divisible by 2", example: "1, 3, and 5 are odd numbers.", antonym: "Even Number" },
    { word: "Factor", meaning: "Number that divides another number exactly", example: "3 is a factor of 12.", antonym: "Multiple" },
    { word: "Multiple", meaning: "Number that can be divided by another without remainder", example: "12 is a multiple of 3.", antonym: "Factor" },
    { word: "Exponent", meaning: "Power to which a number is raised", example: "In 2 to the 3rd power, 3 is the exponent.", antonym: "Base" },
    { word: "Square Root", meaning: "Value that when multiplied by itself gives the number", example: "The square root of 9 is 3.", antonym: "Square" },
    { word: "Variable", meaning: "Symbol representing an unknown value", example: "Solving for x, where x is a variable.", antonym: "Constant" },
    { word: "Constant", meaning: "A value that does not change", example: "In x + 5, 5 is the constant.", antonym: "Variable" },
    { word: "Coefficient", meaning: "Numerical factor of a term with a variable", example: "In 3x, 3 is the coefficient.", antonym: "Exponent" },
    { word: "Equation", meaning: "Statement that two expressions are equal", example: "2x + 5 = 11 is an equation.", antonym: "Expression" },
    { word: "Inequality", meaning: "Statement that one value is larger than another", example: "x > 5 is an inequality.", antonym: "Equality" },
    { word: "Polynomial", meaning: "Expression consisting of many terms", example: "x squared + 2x + 1 is a polynomial.", antonym: "Monomial" },
    { word: "Function", meaning: "Relation where each input has one output", example: "f(x) = 2x is a simple function.", antonym: "Relation" },
    { word: "Domain", meaning: "Set of all possible input values", example: "The domain of x is all real numbers.", antonym: "Range" },
    { word: "Range", meaning: "Set of all possible output values", example: "The range of x squared is y >= 0.", antonym: "Domain" },
    { word: "Limit", meaning: "Value a function approaches", example: "Calculus starts with the study of limits.", antonym: "Infinity" },
    { word: "Derivative", meaning: "Rate of change of a function", example: "The derivative of distance is velocity.", antonym: "Integral" },
    { word: "Integral", meaning: "Area under a curve", example: "Integration is the inverse of differentiation.", antonym: "Derivative" },
    { word: "Slope", meaning: "Steepness of a line", example: "Slope is rise over run.", antonym: "Flatness" },
    { word: "Intercept", meaning: "Point where a graph crosses an axis", example: "The y-intercept is where x equals zero.", antonym: "Slope" },
    { word: "Parabola", meaning: "U-shaped curve of a quadratic function", example: "A thrown ball follows a parabola.", antonym: "Line" },
    { word: "Circle", meaning: "Set of all points equidistant from center", example: "Geometry begins with the study of the circle.", antonym: "Square" },
    { word: "Radius", meaning: "Distance from center to edge of a circle", example: "The radius is half the diameter.", antonym: "Diameter" },
    { word: "Diameter", meaning: "Straight line passing through center of circle", example: "Diameter is twice the radius.", antonym: "Radius" },
    { word: "Circumference", meaning: "Perimeter of a circle", example: "C = 2 * pi * r calculates circumference.", antonym: "Area" },
    { word: "Area", meaning: "Space inside a 2D shape", example: "Multiply length by width for rectangle area.", antonym: "Perimeter" },
    { word: "Perimeter", meaning: "Distance around the outside of a shape", example: "Add all sides for triangle perimeter.", antonym: "Area" },
    { word: "Volume", meaning: "Space occupied by a 3D object", example: "Fill the tank to calculate volume.", antonym: "Surface Area" },
    { word: "Triangle", meaning: "Polygon with three sides and three angles", example: "The sum of triangle angles is 180 degrees.", antonym: "Square" },
    { word: "Hypotenuse", meaning: "Longest side of a right triangle", example: "a squared plus b squared equals c squared.", antonym: "Leg" },
    { word: "Angle", meaning: "Space between two intersecting lines", example: "Measure the angle in degrees.", antonym: "Line" },
    { word: "Sine", meaning: "Trigonometric ratio: opposite over hypotenuse", example: "Sine is used to find triangle sides.", antonym: "Cosine" },
    { word: "Cosine", meaning: "Trigonometric ratio: adjacent over hypotenuse", example: "Cosine is the horizontal component.", antonym: "Sine" },
    { word: "Tangent", meaning: "Line that touches a curve at one point", example: "The tangent line shows instantaneous direction.", antonym: "Secant" },
    { word: "Logarithm", meaning: "Inverse operation to exponentiation", example: "Logarithms help solve for powers.", antonym: "Exponent" },
    { word: "Matrix", meaning: "Array of numbers in rows and columns", example: "Linear algebra uses matrices to solve equations.", antonym: "Scalar" },
    { word: "Vector", meaning: "Quantity with magnitude and direction", example: "Force is a vector quantity.", antonym: "Scalar" },
    { word: "Probability", meaning: "Likelihood of an event happening", example: "Probability ranges from 0 to 1.", antonym: "Certainty" },
    { word: "Mean", meaning: "Average of a set of numbers", example: "Find the mean by dividing sum by count.", antonym: "Median" },
    { word: "Median", meaning: "Middle value in a sorted data set", example: "The median is resistant to outliers.", antonym: "Mean" },
    { word: "Mode", meaning: "Most frequent value in a data set", example: "Some sets have more than one mode.", antonym: "Average" },
    { word: "Variance", meaning: "Measure of how far numbers are spread out", example: "Calculate variance for data dispersion.", antonym: "Stability" },
    { word: "Sequence", meaning: "Ordered list of numbers", example: "1, 3, 5... is an arithmetic sequence.", antonym: "Randomness" },
    { word: "Set", meaning: "Collection of distinct objects", example: "A set of natural numbers.", antonym: "Element" },
    { word: "Union", meaning: "Combination of all elements in two sets", example: "The union includes everything from A and B.", antonym: "Intersection" },
    { word: "Intersection", meaning: "Elements common to two sets", example: "The intersection is the overlap.", antonym: "Union" },
    { word: "Theorem", meaning: "Statement that has been proven", example: "Pythagoras' Theorem is fundamental.", antonym: "Hypothesis" },
    { word: "Axiom", meaning: "Self-evident truth requiring no proof", example: "Maths is built on logical axioms.", antonym: "Theorem" },
    { word: "Binary", meaning: "Number system with base 2", example: "Computers use binary logic.", antonym: "Decimal" },
    { word: "Factorial", meaning: "Product of an integer and all integers below it", example: "5 factorial is 120.", antonym: "Addition" },
    { word: "Permutation", meaning: "Arrangement of items in a specific order", example: "Order matters in a permutation.", antonym: "Combination" },
    { word: "Combination", meaning: "Selection of items where order doesn't matter", example: "Pick any 3 cards for a combination.", antonym: "Permutation" },
    { word: "Correlation", meaning: "Relationship between two variables", example: "Positive correlation means both increase.", antonym: "Independence" },
    { word: "Asymptote", meaning: "Line a curve approaches but never touches", example: "Hyperbolas have vertical asymptotes.", antonym: "Intersection" },
    { word: "Symmetry", meaning: "Exact correspondence on opposite sides", example: "A circle has infinite symmetry.", antonym: "Asymmetry" },
    { word: "Coordinate", meaning: "Pair of numbers showing position on a grid", example: "The coordinate (0,0) is the origin.", antonym: "Vector" },
    { word: "Bisect", meaning: "To cut into two equal parts", example: "Bisect the angle with a compass.", antonym: "Join" },
    { word: "Congruent", meaning: "Identical in shape and size", example: "These two triangles are congruent.", antonym: "Similar" },
    { word: "Parallel", meaning: "Lines that never intersect", example: "Parallel lines have the same slope.", antonym: "Perpendicular" },
    { word: "Perpendicular", meaning: "Lines intersecting at 90 degrees", example: "The cross is made of perpendicular lines.", antonym: "Parallel" },
    { word: "Polygon", meaning: "Flat shape with many straight sides", example: "A hexagon is a six-sided polygon.", antonym: "Circle" },
    { word: "Vertex", meaning: "Corner or point where lines meet", example: "A triangle has three vertices.", antonym: "Side" },
    { word: "Scalar", meaning: "Quantity with magnitude but no direction", example: "Mass and time are scalars.", antonym: "Vector" },
    { word: "Reciprocal", meaning: "Inverse of a number", example: "The reciprocal of 2 is 1/2.", antonym: "Square" },
    { word: "Remainder", meaning: "Amount left over after division", example: "7 divided by 2 has a remainder of 1.", antonym: "Quotient" },
    { word: "Infinity", meaning: "Concept of something without end", example: "Numbers go on to infinity.", antonym: "Finite" },
    { word: "Determinant", meaning: "Value calculated from a square matrix", example: "The determinant tells if a matrix is invertible.", antonym: "Inverse" },
    { word: "Iteration", meaning: "Repeating a process to approach a goal", example: "Algorithms use iteration to solve.", antonym: "Single Step" },
    { word: "Prime Factor", meaning: "Factor of a number that is prime", example: "2 and 3 are prime factors of 12.", antonym: "Composite Factor" },
    { word: "Standard Form", meaning: "Way of writing very large or small numbers", example: "Scientific notation is a standard form.", antonym: "Expanded Form" },
    { word: "Secant", meaning: "Line that cuts a curve at two or more points", example: "The secant line shows the average rate of change.", antonym: "Tangent" },
    { word: "Cosecant", meaning: "Reciprocal of the sine function", example: "Cosecant is undefined when sine is zero.", antonym: "Sine" },
    { word: "Cotangent", meaning: "Reciprocal of the tangent function", example: "Cotangent is adjacent over opposite.", antonym: "Tangent" },
    { word: "Radian", meaning: "Standard unit of angular measure", example: "A full circle is 2 pi radians.", antonym: "Degree" },
    { word: "Unit Circle", meaning: "Circle with a radius of one", example: "The unit circle is used for trig functions.", antonym: "Oval" },
    { word: "Identity Matrix", meaning: "Square matrix with ones on diagonal and zeros elsewhere", example: "Multiplying by the identity matrix leaves a matrix unchanged.", antonym: "Zero Matrix" },
    { word: "Standard Deviation", meaning: "Amount of variation in a data set", example: "Low standard deviation means data is consistent.", antonym: "Mean" },
    { word: "Normal Distribution", meaning: "Bell-shaped curve representing probability", example: "Most IQ scores follow a normal distribution.", antonym: "Skewed Distribution" },
    { word: "Outlier", meaning: "Observation that is far from other values", example: "The outlier skewed the mean.", antonym: "Average" },
    { word: "Sample Space", meaning: "The set of all possible outcomes", example: "The sample space of a coin flip is {H, T}.", antonym: "Event" },
    { word: "Histogram", meaning: "Chart representing data distribution", example: "The histogram showed the age range of users.", antonym: "Pie Chart" },
    { word: "Concavity", meaning: "The state of being curved inward", example: "Check the concavity of the parabola.", antonym: "Convexity" },
    { word: "Inflection Point", meaning: "Point where concavity changes", example: "The function has an inflection point at x=0.", antonym: "Vertex" },
    { word: "Convergence", meaning: "Coming together at a point", example: "The series shows convergence to zero.", antonym: "Divergence" },
    { word: "Divergence", meaning: "Separating or moving apart", example: "A harmonic series shows divergence.", antonym: "Convergence" },
    { word: "Complex Number", meaning: "Sum of a real and imaginary part", example: "3 + 4i is a complex number.", antonym: "Real Number" },
    { word: "Transpose", meaning: "Switching rows and columns of a matrix", example: "The transpose of a row vector is a column vector.", antonym: "Inverse" },
    { word: "Acute Angle", meaning: "Angle less than 90 degrees", example: "The triangle has three acute angles.", antonym: "Obtuse Angle" },
    { word: "Obtuse Angle", meaning: "Angle greater than 90 degrees", example: "An obtuse triangle has one obtuse angle.", antonym: "Acute Angle" },
    { word: "Right Angle", meaning: "Angle of exactly 90 degrees", example: "A square has four right angles.", antonym: "Reflex Angle" },
    { word: "Polyhedron", meaning: "Solid shape with many flat faces", example: "A cube is a regular polyhedron.", antonym: "Sphere" }
  ],
  physics: [
    { word: "Velocity", meaning: "Speed in a specific direction", example: "The rocket attained escape velocity.", antonym: "Stasis" },
    { word: "Entropy", meaning: "A measure of disorder in a system", example: "Entropy increases in isolated systems.", antonym: "Order" },
    { word: "Gravity", meaning: "The force that attracts bodies to the center of the earth", example: "Gravity keeps us on the ground.", antonym: "Weightlessness" },
    { word: "Inertia", meaning: "Resistance of an object to change its state of motion", example: "Inertia keeps the car moving.", antonym: "Responsiveness" },
    { word: "Momentum", meaning: "Quantity of motion of a moving body", example: "The heavy truck has a lot of momentum.", antonym: "Rest" },
    { word: "Frequency", meaning: "The rate at which something occurs over time", example: "The frequency of the wave is 50Hz.", antonym: "Period" },
    { word: "Voltage", meaning: "Electric potential difference", example: "High voltage is dangerous.", antonym: "Current" },
    { word: "Friction", meaning: "Resistance encountered when surfaces rub", example: "Friction generates heat.", antonym: "Lubrication" },
    { word: "Photon", meaning: "A particle of light", example: "Light behaves as both a wave and a photon.", antonym: "Dark Matter" },
    { word: "Relativity", meaning: "Physics of high speed or massive bodies", example: "Einstein's theory of relativity changed everything.", antonym: "Classical Mechanics" },
    { word: "Acceleration", meaning: "Rate of change of velocity", example: "Step on the gas for acceleration.", antonym: "Deceleration" },
    { word: "Current", meaning: "The flow of electric charge", example: "Electric current flows through the wire.", antonym: "Resistance" }
  ],
  ai: [
    { word: "Neural Link", meaning: "A direct connection between brain and machine", example: "The neural link is active.", antonym: "Disconnect" },
    { word: "Machine Learning", meaning: "AI that learns from data patterns", example: "ML optimizes the vocabulary feed.", antonym: "Manual Input" },
    { word: "Algorithm", meaning: "A set of rules for solving a problem", example: "The sorting algorithm is efficient.", antonym: "Chaos" },
    { word: "Big Data", meaning: "Extremely large data sets analyzed computationally", example: "AI thrives on big data.", antonym: "Sparse Data" },
    { word: "Deep Learning", meaning: "AI based on artificial neural networks", example: "Deep learning powers image recognition.", antonym: "Surface Learning" },
    { word: "Chatbot", meaning: "A program that simulates conversation", example: "The AI chatbot answered my query.", antonym: "Human Agent" },
    { word: "Bias", meaning: "Prejudice in favor of or against something", example: "We must avoid bias in AI models.", antonym: "Objectivity" },
    { word: "Automation", meaning: "The use of technology to perform tasks", example: "Automation increases efficiency.", antonym: "Manual Labor" },
    { word: "Dataset", meaning: "A collection of data for training", example: "The dataset contains millions of images.", antonym: "Single Data Point" },
    { word: "NLP", meaning: "Natural Language Processing", example: "NLP allows machines to understand text.", antonym: "Binary Code" },
    { word: "Inference", meaning: "The process of making predictions with AI", example: "The model made an accurate inference.", antonym: "Fact" },
    { word: "Turing Test", meaning: "A test of a machine's ability to exhibit intelligent behavior", example: "Did the AI pass the Turing Test?", antonym: "Simple Script" }
  ],
  gk: [
    { word: "Constitution", meaning: "The basic principles and laws of a nation", example: "The constitution protects our rights.", antonym: "Anarchy" },
    { word: "Ecosystem", meaning: "A biological community of interacting organisms", example: "The rainforest is a diverse ecosystem.", antonym: "Void" },
    { word: "Democracy", meaning: "Government by the people", example: "India is the largest democracy.", antonym: "Dictatorship" },
    { word: "Currency", meaning: "A system of money in use in a country", example: "The Yen is the currency of Japan.", antonym: "Barter" },
    { word: "Latitude", meaning: "Distance north or south of the equator", example: "The equator is at 0 degrees latitude.", antonym: "Longitude" },
    { word: "Hemisphere", meaning: "Half of the earth", example: "We live in the Northern Hemisphere.", antonym: "Whole Sphere" },
    { word: "Sovereignty", meaning: "Supreme power or authority", example: "The nation fought for its sovereignty.", antonym: "Dependency" },
    { word: "Civilization", meaning: "An advanced stage of social development", example: "The Indus Valley civilization was highly advanced.", antonym: "Barbarism" },
    { word: "Judiciary", meaning: "The system of courts of justice", example: "The judiciary ensures laws are followed.", antonym: "Legislature" },
    { word: "Preamble", meaning: "An introduction to a document", example: "The Preamble states the goals of the constitution.", antonym: "Epilogue" }
  ],
  chemistry: [
    { word: "Molecule", meaning: "A group of atoms bonded together", example: "H2O is a water molecule.", antonym: "Atom" },
    { word: "Catalyst", meaning: "A substance that speeds up a reaction", example: "Enzymes are biological catalysts.", antonym: "Inhibitor" },
    { word: "Isotope", meaning: "Atoms with same protons but different neutrons", example: "Carbon-14 is an isotope.", antonym: "Standard Atom" },
    { word: "Acidity", meaning: "The level of acid in a substance", example: "Lemon juice has high acidity.", antonym: "Alkalinity" },
    { word: "Bonding", meaning: "The force that holds atoms together", example: "Ionic bonding occurs between salts.", antonym: "Dissociation" },
    { word: "Solvent", meaning: "A substance that dissolves another", example: "Water is the universal solvent.", antonym: "Solute" },
    { word: "Oxidation", meaning: "Loss of electrons during a reaction", example: "Rusting is a slow oxidation process.", antonym: "Reduction" },
    { word: "Polymer", meaning: "Large molecule made of repeating units", example: "Plastic is a synthetic polymer.", antonym: "Monomer" }
  ],
  "social-studies": [
    { word: "Archeology", meaning: "Study of human history through artifacts", example: "Archeology reveals ancient cultures.", antonym: "Futurism" },
    { word: "Urbanization", meaning: "Growth of cities", example: "Industrialization led to rapid urbanization.", antonym: "Ruralization" },
    { word: "Imperialism", meaning: "Extending a country's power through force", example: "Many nations suffered under imperialism.", antonym: "Self-determination" },
    { word: "Revolution", meaning: "A forcible overthrow of a government", example: "The French Revolution changed Europe.", antonym: "Stability" },
    { word: "Migration", meaning: "Movement of people to a new place", example: "Economic migration is common today.", antonym: "Settlement" },
    { word: "Human Rights", meaning: "Basic rights that belong to everyone", example: "Freedom of speech is a human right.", antonym: "Oppression" }
  ]
};

export async function getLanguageData(language: string = 'English'): Promise<LanguageData> {
  const normalizedLang = language.toLowerCase().trim();
  if (languageCache[normalizedLang]) return languageCache[normalizedLang];
  const path = `/data/${normalizedLang}.json`;
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error();
    const data = await response.json();
    languageCache[normalizedLang] = data;
    return data;
  } catch (err) {
    if (normalizedLang === 'haryanvi') {
      return {
        words: [
          { word: "Baawal", meaning: "Crazy or silly person", example: "Kati baawal ho rya h k?", antonym: "Syaana" },
          { word: "Ghaana", meaning: "A lot or too much", example: "Ghaana mitha na khaya kar.", antonym: "Thoda" },
          { word: "Ib", meaning: "Now", example: "Ib k karega?", antonym: "Pahlan" },
          { word: "Kati", meaning: "Absolutely or completely", example: "Kati zehar lag rya h bhai.", antonym: "Thoda sa" },
          { word: "Kade", meaning: "Sometime", example: "Kade mahre gaam m aaiye.", antonym: "Abhi" },
          { word: "Gelya", meaning: "Along with", example: "Uske gelya mat jaiye.", antonym: "Alag" },
          { word: "Paali", meaning: "Kept or raised", example: "Maine mhensh paali h.", antonym: "Chhodi" },
          { word: "Suthra", meaning: "Beautiful or clean", example: "Ghana suthra balak h.", antonym: "Ganda" }
        ],
        quizzes: [
          { question: "What does 'Ib' mean in Haryanvi?", options: ["Then", "Now", "Soon", "Never"], correctAnswer: "Now" }
        ]
      };
    }
    return DEFAULT_FALLBACK;
  }
}

export async function getSubjectData(subject: string, grade: number): Promise<SubjectGradeData> {
  const normalizedSubject = subject.toLowerCase().replace(/\s+/g, '-').trim();
  const gradeKey = grade.toString();

  if (subjectCache[normalizedSubject]) {
    const data = subjectCache[normalizedSubject].grades[gradeKey];
    if (data) return data;
  }

  try {
    const path = `/data/subjects/${normalizedSubject}.json`;
    const response = await fetch(path);
    if (!response.ok) throw new Error();
    const data: SubjectData = await response.json();
    subjectCache[normalizedSubject] = data;
    
    const gradeData = data.grades[gradeKey];
    if (!gradeData || !gradeData.words || gradeData.words.length === 0) {
      const allGrades = Object.keys(data.grades);
      const fallbackKey = allGrades[0];
      return data.grades[fallbackKey] || { words: [], quizzes: [] };
    }
    return gradeData;
  } catch (err) {
    const fallbackWords = SUBJECT_FALLBACKS[normalizedSubject] || DEFAULT_FALLBACK.words;
    // Deliver a shuffled large subset to ensure variety every session
    return {
      words: getRandomItems(fallbackWords, fallbackWords.length).map(w => ({ ...w, subject: subject })),
      quizzes: [] // Clear static quizzes to force dynamic generation from words
    };
  }
}

export async function getCollegePrepData(subject: string): Promise<LanguageData> {
  const normalized = subject.toLowerCase().trim();
  if (collegePrepCache[normalized]) return collegePrepCache[normalized];
  try {
    const response = await fetch(`/data/college-prep/${normalized}.json`);
    if (!response.ok) throw new Error();
    const data = await response.json();
    collegePrepCache[normalized] = data;
    return data;
  } catch (err) {
    return DEFAULT_FALLBACK;
  }
}

export function getRandomItems<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  // Use a more robust shuffle for better variety
  return [...arr].sort(() => Math.random() - 0.5).slice(0, count);
}

export async function getArenaQuestions(): Promise<ArenaQuestion[]> {
  return [
    {
      id: 'calc-01',
      title: 'Simple Calculator',
      description: 'Create a function that takes two numbers and an operator (+, -, *, /) and returns the result.',
      difficulty: 'Easy',
      requirements: ['Handle division by zero', 'Return result as a number'],
      starterCode: {
        python: 'def calculate(a, b, op):\n    # Write code here\n    pass',
        javascript: 'function calculate(a, b, op) {\n    // Write code here\n}',
        java: 'public class Main {\n    public static double calculate(double a, double b, String op) {\n        return 0;\n    }\n}',
        cpp: 'double calculate(double a, double b, char op) {\n    return 0;\n}'
      }
    },
    {
      id: 'pass-01',
      title: 'Password Guardian',
      description: 'Verify if a password is valid. Must be 8+ chars, have a number, and a special character.',
      difficulty: 'Medium',
      requirements: ['Check length', 'Check for numbers', 'Check for special chars'],
      starterCode: {
        python: 'def is_valid(p):\n    # Write code here\n    pass',
        javascript: 'function isValid(p) {\n    // Write code here\n}'
      }
    }
  ];
}
