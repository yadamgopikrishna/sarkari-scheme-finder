const Scheme = require('../models/Scheme');

/**
 * Common national government helplines & official grievance portals
 */
const GOV_HELPLINES = {
  nationalConsumer: '1915 (National Consumer Helpline)',
  pmKisan: '155261 / 1800-11-5526 / 011-24300606',
  kisanCallCenter: '1800-180-1551 (All India Farmer Toll-Free)',
  ayushmanBharat: '14555 / 1800-111-565 (PM-JAY Health Toll-Free)',
  nspScholarship: '0120-6619540 (National Scholarship Portal Helpdesk)',
  cpgrams: 'https://pgportal.gov.in (Central Grievance Redressal)',
  seniorCitizens: '14567 (Elder Line - Senior Citizen Helpline)',
  womenHelpline: '181 (Women in Distress / Domestic Violence)',
  childline: '1098 (National Childline Service)',
  disabilityHelpline: '1800-111-180 (Accessible India / Divyangjan)',
};

/**
 * Standard document requirements reference for Indian welfare schemes
 */
const STANDARD_DOCUMENTS_INFO = `
Here is the official document checklist typically required for Indian Central & State Government Welfare Schemes:

1. **Identity & Demographic Verification:**
   • Aadhaar Card (Used exclusively for biometric/OTP eKYC verification at official government counters; *Sarkari Scheme Finder never asks for or stores your Aadhaar number*).
   • Voter ID / PAN Card / Driving License (Secondary photo ID).

2. **Residence & Domicile Proof:**
   • Domicile / Nativity Certificate (issued by Tahsildar / Revenue Department / MeeSeva / e-District).
   • Electricity bill, water bill, or valid rental agreement.

3. **Income & Economic Category Proof:**
   • Annual Income Certificate issued by the competent Revenue Authority / Tahsildar within the last 1 year.
   • BPL Ration Card (Antyodaya Anna Yojana / White Ration Card / Priority Household card).

4. **Category & Community Certificates (If Applicable):**
   • SC / ST / OBC / EWS / Minority community certificate issued by the Sub-Divisional Magistrate / Tehsildar.

5. **Direct Benefit Transfer (DBT) Bank Account:**
   • Bank Passbook copy with clear Account Number and IFSC Code.
   • **Mandatory:** Bank account must be seeded with Aadhaar and mapped to the NPCI (National Payments Corporation of India) mapper for DBT transfers.

6. **Occupation & Special Criteria Documents:**
   • **Farmers:** Pattadar Passbook / Land Record (ROR-1B) / Encumbrance Certificate / Khasra-Khatauni.
   • **Students:** Current institutional Bonafide Certificate, previous year marksheets, fee receipts.
   • **Divyangjan (PwD):** Disability Certificate with benchmark percentage (40%+) / UDID (Unique Disability ID) card.
   • **Senior Citizens:** Age proof (Birth Certificate / School Transfer Certificate / Aadhaar / Voter ID).
   • **Artisans / MSME:** Udyam Registration Number / Artisan ID / PM Vishwakarma verification letter.
`;

/**
 * Application procedure walkthrough
 */
const APPLICATION_PROCEDURE_INFO = `
Government schemes can be applied for through two primary channels across India:

### 1. Online Channel (Official Government Portals)
1. **Identify the Official Portal:** Always use verified domains ending in \`.gov.in\` or \`.nic.in\` (available on our Scheme Details pages).
2. **Citizen Registration:** Register using your mobile number and perform OTP verification (via DigiLocker or MeriPehchaan / Jan Parichay).
3. **Fill Application Form:** Enter your demographic, educational, bank, and land/income details accurately.
4. **Upload Scanned Documents:** Attach self-attested PDF/JPEG copies of required certificates (usually under 200KB-500KB each).
5. **Aadhaar e-Sign / Submit:** Submit the application and save the generated **Acknowledgment / Application Reference Number (ARN)** for tracking.

### 2. Offline / Assisted Channel (Local Citizen Centers)
If you do not have internet access or need assistance with scanning and biometric authentication:
• **Common Service Centres (CSC / Digital Seva Kendras):** Available in every village/panchayat.
• **State Centers:**
  - Andhra Pradesh: **Grama / Ward Sachivalayam (Village Secretariats)**
  - Telangana: **MeeSeva Centers**
  - Karnataka: **Bangalore One / Karnataka One / Grama One**
  - Maharashtra: **Maha e-Seva Kendras / Aaple Sarkar**
  - Tamil Nadu: **e-Sevai Centers**
  - Uttar Pradesh: **Jan Seva Kendras**
• **Block / Taluk Offices:** Visit your local Tehsildar, Block Development Officer (BDO), or District Social Welfare Office.
`;

/**
 * Extracts comprehensive demographic and intent profile from user prompt
 */
function extractProfileFromQuery(message) {
  const text = message.toLowerCase();
  const profile = {};

  // 1. Age extraction
  const ageMatch = text.match(/\b(\d{1,3})\s*(?:-|–|\s)?(?:years?|yrs?|year-old|yr-old|yo)\b/i) ||
                   text.match(/\b(?:age|aged)\s*[:=]?\s*(\d{1,3})\b/i) ||
                   text.match(/(?:i am|am a|i'm)\s+(\d{1,3})\b/i);
  if (ageMatch) {
    const val = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (val >= 0 && val <= 110) profile.age = val;
  }

  // 2. Gender extraction
  if (/\b(female|woman|women|girl|mother|widow|lady|mahila|beti)\b/i.test(text)) {
    profile.gender = 'Female';
  } else if (/\b(male|man|boy|father|purush)\b/i.test(text) && !/female|woman/i.test(text)) {
    profile.gender = 'Male';
  } else if (/\b(transgender|trans)\b/i.test(text)) {
    profile.gender = 'Transgender';
  }

  // 3. State extraction
  const stateMappings = [
    { name: 'Andhra Pradesh', aliases: ['andhra pradesh', 'andhra', 'ap'] },
    { name: 'Arunachal Pradesh', aliases: ['arunachal pradesh', 'arunachal'] },
    { name: 'Assam', aliases: ['assam', 'asom'] },
    { name: 'Bihar', aliases: ['bihar'] },
    { name: 'Chhattisgarh', aliases: ['chhattisgarh', 'chattisgarh'] },
    { name: 'Goa', aliases: ['goa'] },
    { name: 'Gujarat', aliases: ['gujarat'] },
    { name: 'Haryana', aliases: ['haryana'] },
    { name: 'Himachal Pradesh', aliases: ['himachal pradesh', 'himachal', 'hp'] },
    { name: 'Jharkhand', aliases: ['jharkhand'] },
    { name: 'Karnataka', aliases: ['karnataka', 'bangalore', 'bengaluru'] },
    { name: 'Kerala', aliases: ['kerala'] },
    { name: 'Madhya Pradesh', aliases: ['madhya pradesh', 'mp'] },
    { name: 'Maharashtra', aliases: ['maharashtra', 'mumbai', 'pune'] },
    { name: 'Manipur', aliases: ['manipur'] },
    { name: 'Meghalaya', aliases: ['meghalaya'] },
    { name: 'Mizoram', aliases: ['mizoram'] },
    { name: 'Nagaland', aliases: ['nagaland'] },
    { name: 'Odisha', aliases: ['odisha', 'orissa'] },
    { name: 'Punjab', aliases: ['punjab'] },
    { name: 'Rajasthan', aliases: ['rajasthan', 'jaipur'] },
    { name: 'Sikkim', aliases: ['sikkim'] },
    { name: 'Tamil Nadu', aliases: ['tamil nadu', 'tamilnadu', 'chennai', 'tn'] },
    { name: 'Telangana', aliases: ['telangana', 'hyderabad', 'tg', 'ts'] },
    { name: 'Tripura', aliases: ['tripura'] },
    { name: 'Uttar Pradesh', aliases: ['uttar pradesh', 'up', 'lucknow', 'noida'] },
    { name: 'Uttarakhand', aliases: ['uttarakhand', 'uttaranchal'] },
    { name: 'West Bengal', aliases: ['west bengal', 'bengal', 'kolkata', 'wb'] },
    { name: 'Delhi', aliases: ['delhi', 'new delhi', 'ncr'] },
    { name: 'Jammu and Kashmir', aliases: ['jammu and kashmir', 'jammu & kashmir', 'j&k', 'kashmir'] },
    { name: 'Ladakh', aliases: ['ladakh', 'leh'] },
    { name: 'Puducherry', aliases: ['puducherry', 'pondicherry'] },
  ];

  for (const item of stateMappings) {
    for (const alias of item.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(text)) {
        profile.state = item.name;
        break;
      }
    }
    if (profile.state) break;
  }

  // 4. Occupation / Category extraction
  if (/\b(farmer|farmers|kisan|rythu|krishi|agriculture|farming|crop|landholding|cultivator)\b/i.test(text)) {
    profile.occupation = 'Farmer';
    profile.category = 'Agriculture';
  } else if (/\b(student|scholarship|college|university|school|study|fees|fee reimbursement|graduation|matric|btech|bsc|degree)\b/i.test(text)) {
    profile.occupation = 'Student';
    profile.category = 'Education';
  } else if (/\b(senior|pension|old age|retired|elderly|60 plus|vridha|vriddha)\b/i.test(text)) {
    profile.category = 'Pension';
    if (!profile.age) profile.age = 62;
  } else if (/\b(health|hospital|medical|treatment|disease|illness|doctor|medicine|ayushman|cashless)\b/i.test(text)) {
    profile.category = 'Healthcare';
  } else if (/\b(house|housing|awas|home|pucca house|slum|homeless)\b/i.test(text)) {
    profile.category = 'Housing';
  } else if (/\b(widow|single mother|pregnant|lactating|girl child|kanya|mahila|ladki)\b/i.test(text)) {
    profile.category = 'Women & Child Welfare';
    profile.gender = 'Female';
  } else if (/\b(artisan|craftsperson|carpenter|blacksmith|goldsmith|potter|sculptor|cobbler|tailor|weaver|vishwakarma)\b/i.test(text)) {
    profile.occupation = 'Artisan/Craftsperson';
    profile.category = 'Employment & Skills';
  } else if (/\b(vendor|street vendor|thela|rehri|dukaan|shopkeeper|hawker|svanidhi)\b/i.test(text)) {
    profile.occupation = 'Street Vendor';
    profile.category = 'MSME & Entrepreneurship';
  } else if (/\b(business|msme|startup|entrepreneur|mudra|loan|shop|enterprise)\b/i.test(text)) {
    profile.occupation = 'Business owner';
    profile.category = 'MSME & Entrepreneurship';
  } else if (/\b(disabled|disability|handicapped|divyang|divyangjan|pwd|blind|deaf)\b/i.test(text)) {
    profile.category = 'Disability Welfare';
    profile.isDifferentlyAbled = true;
  } else if (/\b(unemployed|job seeker|skill|training|pmkvy)\b/i.test(text)) {
    profile.occupation = 'Unemployed';
    profile.category = 'Employment & Skills';
  }

  // 5. Income extraction (e.g. 50000, 2.5 lakh, 80,000)
  const lakhMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakhs?|lacs?|l)/i);
  if (lakhMatch) {
    profile.income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const rawIncomeMatch = text.match(/(?:income|earning|salary|earns)[^0-9]*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{4,8})/i);
    if (rawIncomeMatch) {
      profile.income = parseInt(rawIncomeMatch[1].replace(/,/g, ''), 10);
    }
  }

  return profile;
}

/**
 * Detects the high-level intent of the user's message
 */
function detectIntent(message) {
  const text = message.toLowerCase().trim();

  // 1. Greetings
  if (/^(hi|hello|hey|namaste|vanakkam|namaskara|pranam|good\s*(morning|afternoon|evening)|help\b)/i.test(text) && text.split(/\s+/).length <= 4) {
    return 'GREETING';
  }

  // 2. Identity / Capabilities
  if (/^(who are you|what is this|what can you do|about this portal|who made you|how can you help)/i.test(text) ||
      (/\b(who are you|what can you do)\b/i.test(text) && text.split(/\s+/).length <= 7)) {
    return 'IDENTITY_CAPABILITIES';
  }

  // 3. Portal Workflow / How to check eligibility
  if (/\b(how to use|how do i check|how to check eligibility|7 steps?|wizard|compare schemes?|how does this work|features of portal)\b/i.test(text)) {
    return 'HOW_TO_USE_PORTAL';
  }

  // 4. Document requirements
  if (/\b(what documents|documents required|list of documents|document checklist|aadhaar needed|income certificate needed|caste certificate needed)\b/i.test(text)) {
    return 'DOCUMENT_GUIDANCE';
  }

  // 5. Application procedure
  if (/\b(how to apply|application process|where to apply|apply online|apply offline|csc center|meeseva|grama sachivalayam|application form)\b/i.test(text)) {
    return 'APPLICATION_PROCEDURE';
  }

  // 6. Helplines & Complaints
  if (/\b(helpline|toll free|customer care|complaint|grievance|money not received|not credited|contact number|support)\b/i.test(text)) {
    return 'HELPLINES_AND_GRIEVANCES';
  }

  // 7. Specific Scheme Lookup check
  const popularSchemes = [
    'pm-kisan', 'pm kisan', 'pmkisan', 'ayushman', 'pm-jay', 'pmjay', 'pm awas', 'pmay',
    'atal pension', 'apy', 'mudra', 'pm svanidhi', 'svanidhi', 'vishwakarma', 'pm-vishwakarma',
    'sukanya', 'thalliki vandanam', 'ntr bharosa', 'rythu bharosa', 'ladki bahin',
    'gruha lakshmi', 'pudhumai penn', 'kanya sumangala', 'national scholarship', 'nsp'
  ];
  for (const s of popularSchemes) {
    if (text.includes(s)) {
      return 'SPECIFIC_SCHEME_LOOKUP';
    }
  }

  return 'GENERAL_QUERY';
}

/**
 * Calls Google Gemini Generative API if GEMINI_API_KEY is configured in server environment
 */
async function callGeminiIfAvailable(userMessage, systemContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;
    const payload = {
      systemInstruction: {
        parts: [
          {
            text: `You are the official Sarkari Scheme Assistant AI for the "Sarkari Scheme Finder" portal. 
Your role is to guide Indian citizens regarding Central, State, and UT welfare schemes, eligibility criteria, required documents, and official application procedures.
Rules:
1. Always be polite, respectful, and authoritative yet empathetic. Use Indian terminology where helpful (e.g. DBT, Aadhaar-seeded account, Ration Card, Tahsildar).
2. Ground all specific scheme information on authentic Indian Government guidelines.
3. Explicitly clarify that eligibility assessments are informational guidance, and final approvals rest exclusively with the respective Government Department.
4. Sarkari Scheme Finder strictly NEVER asks for, stores, or transmits Aadhaar numbers or biometrics.
5. Provide clear, structured bullet points with official portal links (.gov.in) where applicable.

PORTAL SCHEMES DATABASE CONTEXT:
${systemContext}`
          }
        ]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1200,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`[Gemini API Warning] Status: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidate && candidate.trim().length > 0) {
      return candidate.trim();
    }
    return null;
  } catch (err) {
    console.warn('[Gemini API Call Failed, falling back to local grounded engine]:', err.message);
    return null;
  }
}

/**
 * Generates an AI response strictly grounded in verified database schemes
 */
async function generateAssistantResponse(userMessage, language = 'en') {
  const text = userMessage.trim();
  const intent = detectIntent(text);
  const profile = extractProfileFromQuery(text);

  // 1. Handle Greetings
  if (intent === 'GREETING') {
    return {
      reply: `🙏 **Namaste & Welcome to Sarkari Scheme Finder!**

I am your dedicated **Government Scheme Assistant AI**. I help Indian citizens discover, understand, and apply for Central and State Government welfare schemes tailored to their demographic and financial profile.

**Here is what you can ask me right now:**
• *"I am a 65-year-old farmer from Andhra Pradesh with an annual income of ₹80,000."*
• *"What scholarship schemes are available for college students?"*
• *"Tell me about Ayushman Bharat PM-JAY and how to get cashless hospital treatment."*
• *"What documents are needed to apply for government housing schemes?"*
• *"How do I check my eligibility using the 7-step wizard?"*

How may I assist you today?`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 2. Handle Identity & Capabilities
  if (intent === 'IDENTITY_CAPABILITIES') {
    return {
      reply: `🏛️ **About Sarkari Scheme Finder & Assistant AI**

**Sarkari Scheme Finder** is a modern, citizen-centric digital portal designed to bridge the gap between Indian citizens and hundreds of Government welfare initiatives.

**Key Features of the Portal:**
1. **7-Step Eligibility Wizard:** Evaluates Personal, Location, Financial, Employment, Education, Priority/Vulnerability, and Landholding details to determine scheme eligibility.
2. **Match Percentage Calculation:** Displays realistic match rates (e.g. *95% Match*, *82% Match*) and a transparent checklist of satisfied vs. pending conditions.
3. **Multilingual Interface:** Fully accessible in **8 Indian languages** (English, Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali).
4. **Direct Official Application Links:** All schemes link directly to verified official \`.gov.in\` and \`.nic.in\` portals to prevent citizen exploitation by intermediaries.
5. **Side-by-Side Scheme Comparison:** Compare up to 4 schemes across benefits, income ceilings, age limits, and requirements.
6. **Zero Biometric / Aadhaar Storage:** The portal prioritizes citizen privacy and never collects or stores Aadhaar numbers.

Feel free to ask about any specific scheme, demographic eligibility, or application procedure!`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 3. Handle Portal Walkthrough
  if (intent === 'HOW_TO_USE_PORTAL') {
    return {
      reply: `📋 **How to Use the Sarkari Scheme Finder Portal**

Finding the right government schemes takes only 2 minutes on our portal:

### Step 1: Launch the 7-Step Eligibility Wizard
Click on **"Check Eligibility"** in the top navigation bar.

### Step 2: Answer 7 Simple Demographic Steps
1. **Personal Details:** Age, Gender, Marital Status.
2. **Location:** State/UT, District, Urban/Rural area.
3. **Financial Profile:** Annual Family Income, Ration Card Category (AAY, BPL, Non-BPL).
4. **Employment:** Occupation (Farmer, Student, Street Vendor, Artisan, Salaried, Unemployed, etc.).
5. **Education:** Highest qualification & current student status.
6. **Priority / Vulnerability:** Disability benchmark (40%+), Minority community, EWS status.
7. **Agriculture (Conditional):** If you selected Farmer, specify your agricultural landholding in acres.

### Step 3: Review Tailored Recommendations
The system matches your profile against all active Central and State schemes. You will see:
• **Match Score:** (e.g. *95% Match* for fully satisfied rules).
• **Eligibility Breakdown:** Detailed green checkmarks (satisfied) and yellow notices (documents required).
• **Direct Apply Button:** Takes you directly to the official government portal.

### Step 4: Compare or Bookmark
• Use the **"Compare"** button on any card to compare multiple schemes side-by-side.
• Log in to save schemes to your **Citizen Dashboard** for future reference.`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 4. Handle Document Guidance
  if (intent === 'DOCUMENT_GUIDANCE') {
    return {
      reply: `📑 **Required Documents Checklist for Government Schemes**

${STANDARD_DOCUMENTS_INFO}

💡 **Security Note:** You will only present these documents directly at official Government offices (Tahsildar, CSC, MeeSeva) or upload them to authenticated \`.gov.in\` portals. This portal never stores your identity documents.`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 5. Handle Application Procedure
  if (intent === 'APPLICATION_PROCEDURE') {
    return {
      reply: `📝 **How and Where to Apply for Government Schemes**

${APPLICATION_PROCEDURE_INFO}

⚠️ **Important Tip:** Ensure your Bank Account is linked to your Aadhaar card through the **NPCI DBT Mapper** at your bank branch. Over 90% of welfare funds in India are now disbursed exclusively via Direct Benefit Transfer (DBT).`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 6. Handle Helplines & Grievances
  if (intent === 'HELPLINES_AND_GRIEVANCES') {
    return {
      reply: `📞 **Official National Government Helplines & Grievance Portals**

If you have questions regarding scheme approvals, delayed DBT disbursements, or wish to register a grievance, please use these verified official channels:

• **National Consumer Helpline:** \`${GOV_HELPLINES.nationalConsumer}\`
• **PM-KISAN Helpline:** \`${GOV_HELPLINES.pmKisan}\`
• **Kisan Call Centre (Agriculture):** \`${GOV_HELPLINES.kisanCallCenter}\` (Toll-Free, 6 AM to 10 PM)
• **Ayushman Bharat (PM-JAY Health):** \`${GOV_HELPLINES.ayushmanBharat}\`
• **National Scholarship Portal (NSP):** \`${GOV_HELPLINES.nspScholarship}\`
• **Senior Citizen Helpline (Elder Line):** \`${GOV_HELPLINES.seniorCitizens}\`
• **Women in Distress Helpline:** \`${GOV_HELPLINES.womenHelpline}\`
• **Childline:** \`${GOV_HELPLINES.childline}\`
• **Divyangjan (Disability) Helpline:** \`${GOV_HELPLINES.disabilityHelpline}\`

🏛️ **Central Public Grievance Redress and Monitoring System (CPGRAMS):**
You can file an official complaint online with any Central Ministry or State Department at [pgportal.gov.in](https://pgportal.gov.in).`,
      matchedSchemes: [],
      detectedProfile: profile,
    };
  }

  // 7. Grounded Database Retrieval
  // Build dynamic MongoDB conditions
  const andConditions = [{ status: 'Active' }];

  if (profile.state) {
    andConditions.push({
      $or: [{ state: 'All' }, { state: new RegExp(`^${profile.state}$`, 'i') }, { state: new RegExp(profile.state, 'i') }],
    });
  }

  if (profile.category) {
    andConditions.push({
      $or: [
        { category: new RegExp(profile.category, 'i') },
        { schemeName: new RegExp(profile.category, 'i') },
        { tags: new RegExp(profile.category, 'i') },
      ],
    });
  }

  // Keyword extraction for scheme name or department
  const stopWords = ['what', 'which', 'schemes', 'from', 'with', 'annual', 'income', 'check', 'available', 'eligibility', 'detail', 'details', 'tell', 'about', 'some', 'please', 'give', 'list', 'government', 'sarkari', 'yojana', 'yojanas'];
  const queryTokens = text
    .replace(/[^\w\s-]/gi, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !stopWords.includes(w.toLowerCase()));

  if (queryTokens.length > 0 && !profile.category) {
    andConditions.push({
      $or: queryTokens.slice(0, 4).map(token => ({
        $or: [
          { schemeName: new RegExp(token, 'i') },
          { shortDescription: new RegExp(token, 'i') },
          { department: new RegExp(token, 'i') },
          { tags: new RegExp(token, 'i') },
        ],
      })),
    });
  }

  let matchedSchemes = await Scheme.find({ $and: andConditions }).limit(6).lean();

  // If strict query yielded 0, relax category/state to find top active schemes
  if (matchedSchemes.length === 0) {
    if (profile.state) {
      matchedSchemes = await Scheme.find({
        status: 'Active',
        $or: [{ state: 'All' }, { state: new RegExp(profile.state, 'i') }],
      })
        .sort({ viewCount: -1 })
        .limit(4)
        .lean();
    } else if (profile.category) {
      matchedSchemes = await Scheme.find({
        status: 'Active',
        category: new RegExp(profile.category, 'i'),
      })
        .sort({ viewCount: -1 })
        .limit(4)
        .lean();
    } else {
      matchedSchemes = await Scheme.find({ status: 'Active' })
        .sort({ viewCount: -1 })
        .limit(4)
        .lean();
    }
  }

  // Prepare database schemes context summary for Gemini or rule engine
  const schemesContextSummary = matchedSchemes.map((s, idx) => {
    const elig = s.eligibilityCriteria || {};
    const rules = [];
    if (elig.age?.min > 0 || elig.age?.max < 100) rules.push(`Age: ${elig.age.min || 0}-${elig.age.max || 100} yrs`);
    if (elig.income?.max > 0) rules.push(`Max Annual Income: ₹${elig.income.max.toLocaleString('en-IN')}`);
    if (elig.gender && elig.gender !== 'All') rules.push(`Gender: ${elig.gender}`);
    if (elig.occupations?.length && !elig.occupations.includes('All')) rules.push(`Occupation: ${elig.occupations.join(', ')}`);
    if (elig.landHolding?.maxAcres > 0) rules.push(`Max Landholding: ${elig.landHolding.maxAcres} acres`);

    return `${idx + 1}. ${s.schemeName} (${s.governmentLevel} Govt - State: ${s.state})
- Department: ${s.department}
- Category: ${s.category}
- Key Benefits: ${Array.isArray(s.benefits) ? s.benefits.join('; ') : s.benefits}
- Eligibility Criteria: ${rules.length > 0 ? rules.join(' | ') : 'General citizen criteria'}
- Required Documents: ${Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join(', ') : s.requiredDocuments}
- Official Application Link: ${s.applicationLink}
- Official Website: ${s.officialWebsite}`;
  }).join('\n\n');

  // Attempt Gemini generative response if API key is present
  const geminiReply = await callGeminiIfAvailable(text, schemesContextSummary);
  if (geminiReply) {
    return {
      reply: geminiReply,
      matchedSchemes: matchedSchemes.map(s => ({
        _id: s._id,
        schemeName: s.schemeName,
        category: s.category,
        governmentLevel: s.governmentLevel,
        state: s.state,
        applicationLink: s.applicationLink,
        officialWebsite: s.officialWebsite,
      })),
      detectedProfile: profile,
    };
  }

  // Local Grounded Engine Response
  let replyText = `🙏 **Namaste!** Based on your query`;

  const profileSummary = [];
  if (profile.age) profileSummary.push(`Age: ${profile.age} yrs`);
  if (profile.gender) profileSummary.push(`Gender: ${profile.gender}`);
  if (profile.state) profileSummary.push(`State: ${profile.state}`);
  if (profile.occupation) profileSummary.push(`Occupation: ${profile.occupation}`);
  if (profile.category && !profile.occupation) profileSummary.push(`Category: ${profile.category}`);
  if (profile.income) profileSummary.push(`Income: ₹${profile.income.toLocaleString('en-IN')}/yr`);

  if (profileSummary.length > 0) {
    replyText += ` (**${profileSummary.join(' | ')}**), here are the most relevant verified government welfare schemes from our official database:\n\n`;
  } else {
    replyText += `, here are key verified government welfare schemes you can explore:\n\n`;
  }

  matchedSchemes.forEach((scheme, idx) => {
    replyText += `### ${idx + 1}. ${scheme.schemeName} (${scheme.governmentLevel} Government)\n`;
    replyText += `• **Department / Ministry:** ${scheme.department}\n`;
    replyText += `• **Primary Benefits:** ${Array.isArray(scheme.benefits) ? scheme.benefits.slice(0, 2).join('; ') : scheme.benefits}\n`;

    const elig = scheme.eligibilityCriteria || {};
    const conds = [];
    if (elig.age?.min > 0 || elig.age?.max < 100) conds.push(`Age: ${elig.age.min || 0} to ${elig.age.max || 100} yrs`);
    if (elig.income?.max > 0) conds.push(`Max Annual Income: ₹${elig.income.max.toLocaleString('en-IN')}`);
    if (elig.gender && elig.gender !== 'All') conds.push(`Gender: ${elig.gender}`);
    if (elig.occupations?.length && !elig.occupations.includes('All')) conds.push(`Occupation: ${elig.occupations.join(', ')}`);
    if (elig.landHolding?.maxAcres > 0) conds.push(`Max Land: ${elig.landHolding.maxAcres} acres`);

    replyText += `• **Eligibility Highlights:** ${conds.length ? conds.join(' | ') : 'General citizen criteria'}\n`;
    replyText += `• **Essential Documents:** ${Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.slice(0, 4).join(', ') : scheme.requiredDocuments}\n`;
    replyText += `• **Official Portal:** [Apply on Official Website](${scheme.applicationLink})\n\n`;
  });

  replyText += `\n💡 **Next Step:** You can run our full **7-Step Eligibility Wizard** for an in-depth score, or click any official link above to start your application.\n\n`;
  replyText += `⚠️ **Important Disclaimer:** All eligibility assessments provided by this assistant are for informational guidance based on verified guidelines. Final eligibility and financial disbursements are determined exclusively by the respective Government Department after document verification.`;

  return {
    reply: replyText,
    matchedSchemes: matchedSchemes.map(s => ({
      _id: s._id,
      schemeName: s.schemeName,
      category: s.category,
      governmentLevel: s.governmentLevel,
      state: s.state,
      applicationLink: s.applicationLink,
      officialWebsite: s.officialWebsite,
    })),
    detectedProfile: profile,
  };
}

module.exports = {
  generateAssistantResponse,
  extractProfileFromQuery,
  detectIntent,
  GOV_HELPLINES,
};
