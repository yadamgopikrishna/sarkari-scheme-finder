const Scheme = require('../models/Scheme');

/**
 * Common national government helplines & official grievance portals
 */
const GOV_HELPLINES = {
  nationalConsumer: '1915 (National Consumer Helpline)',
  pmKisan: '155261 / 1800-11-5526 (Kisan Helpline)',
  kisanCallCenter: '1800-180-1551 (All India Farmer Toll-Free)',
  ayushmanBharat: '14555 / 1800-111-565 (PM-JAY Health Toll-Free)',
  nspScholarship: '0120-6619540 (National Scholarship Helpdesk)',
  cpgrams: 'https://pgportal.gov.in (Central Grievance Redressal)',
  seniorCitizens: '14567 (Elder Line - Senior Citizens)',
  womenHelpline: '181 (Women in Distress / Domestic Helpline)',
  childline: '1098 (National Childline Service)',
  disabilityHelpline: '1800-111-180 (Accessible India / Divyangjan)',
};

/**
 * Comprehensive list of 36 States and Union Territories with colloquial aliases
 */
const STATE_MAPPINGS = [
  { name: 'Andhra Pradesh', aliases: ['andhra pradesh', 'andhra', 'ap', 'amaravati', 'vizag'] },
  { name: 'Arunachal Pradesh', aliases: ['arunachal pradesh', 'arunachal', 'itanagar'] },
  { name: 'Assam', aliases: ['assam', 'asom', 'guwahati'] },
  { name: 'Bihar', aliases: ['bihar', 'patna'] },
  { name: 'Chhattisgarh', aliases: ['chhattisgarh', 'chattisgarh', 'raipur'] },
  { name: 'Goa', aliases: ['goa', 'panaji'] },
  { name: 'Gujarat', aliases: ['gujarat', 'ahmedabad', 'surat', 'gandhinagar'] },
  { name: 'Haryana', aliases: ['haryana', 'gurgaon', 'gurugram', 'faridabad'] },
  { name: 'Himachal Pradesh', aliases: ['himachal pradesh', 'himachal', 'hp', 'shimla'] },
  { name: 'Jharkhand', aliases: ['jharkhand', 'ranchi', 'jamshedpur'] },
  { name: 'Karnataka', aliases: ['karnataka', 'bangalore', 'bengaluru', 'mysore'] },
  { name: 'Kerala', aliases: ['kerala', 'kochi', 'trivandrum', 'thiruvananthapuram'] },
  { name: 'Madhya Pradesh', aliases: ['madhya pradesh', 'mp', 'bhopal', 'indore'] },
  { name: 'Maharashtra', aliases: ['maharashtra', 'mumbai', 'pune', 'nagpur'] },
  { name: 'Manipur', aliases: ['manipur', 'imphal'] },
  { name: 'Meghalaya', aliases: ['meghalaya', 'shillong'] },
  { name: 'Mizoram', aliases: ['mizoram', 'aizawl'] },
  { name: 'Nagaland', aliases: ['nagaland', 'kohima'] },
  { name: 'Odisha', aliases: ['odisha', 'orissa', 'bhubaneswar'] },
  { name: 'Punjab', aliases: ['punjab', 'amritsar', 'ludhiana'] },
  { name: 'Rajasthan', aliases: ['rajasthan', 'jaipur', 'jodhpur', 'udaipur'] },
  { name: 'Sikkim', aliases: ['sikkim', 'gangtok'] },
  { name: 'Tamil Nadu', aliases: ['tamil nadu', 'tamilnadu', 'chennai', 'tn', 'coimbatore'] },
  { name: 'Telangana', aliases: ['telangana', 'hyderabad', 'tg', 'ts', 'warangal'] },
  { name: 'Tripura', aliases: ['tripura', 'agartala'] },
  { name: 'Uttar Pradesh', aliases: ['uttar pradesh', 'up', 'lucknow', 'kanpur', 'noida', 'varanasi'] },
  { name: 'Uttarakhand', aliases: ['uttarakhand', 'uttaranchal', 'dehradun'] },
  { name: 'West Bengal', aliases: ['west bengal', 'bengal', 'kolkata', 'wb'] },
  { name: 'Delhi', aliases: ['delhi', 'new delhi', 'ncr'] },
  { name: 'Jammu and Kashmir', aliases: ['jammu and kashmir', 'jammu & kashmir', 'j&k', 'kashmir', 'srinagar', 'jammu'] },
  { name: 'Ladakh', aliases: ['ladakh', 'leh'] },
  { name: 'Puducherry', aliases: ['puducherry', 'pondicherry'] },
];

/**
 * Extracts demographic and economic profile by inspecting current query AND prior conversation turns
 */
function extractProfileFromConversation(conversationHistory = [], currentMessage = '') {
  // Combine all user utterances for cumulative context memory
  const allUserTexts = conversationHistory
    .filter(m => m.sender === 'user' || m.role === 'user')
    .map(m => m.text || m.content || '')
    .concat([currentMessage])
    .join(' ')
    .toLowerCase();

  const profile = {};

  // 1. Age extraction
  const ageMatch = allUserTexts.match(/\b(\d{1,3})\s*(?:-|–|\s)?(?:years?|yrs?|year-old|yr-old|yo)\b/i) ||
                   allUserTexts.match(/\b(?:age|aged)\s*[:=]?\s*(\d{1,3})\b/i) ||
                   allUserTexts.match(/(?:i am|am a|i'm)\s+(\d{1,3})\b/i);
  if (ageMatch) {
    const val = parseInt(ageMatch[1] || ageMatch[2], 10);
    if (val >= 0 && val <= 110) profile.age = val;
  }

  // 2. Gender extraction
  if (/\b(female|woman|women|girl|mother|widow|lady|mahila|beti|sister|daughter|pregnant|lactating)\b/i.test(allUserTexts)) {
    profile.gender = 'Female';
  } else if (/\b(male|man|boy|father|son|brother|purush)\b/i.test(allUserTexts) && !/female|woman/i.test(allUserTexts)) {
    profile.gender = 'Male';
  }

  // 3. State extraction
  for (const item of STATE_MAPPINGS) {
    for (const alias of item.aliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(allUserTexts)) {
        profile.state = item.name;
        break;
      }
    }
    if (profile.state) break;
  }

  // 4. Occupation & Domain extraction
  if (/\b(farmer|farmers|kisan|rythu|krishi|agriculture|farming|crop|landholding|cultivator|paddy|wheat)\b/i.test(allUserTexts)) {
    profile.occupation = 'Farmer';
    profile.category = 'Agriculture';
  } else if (/\b(student|scholarship|college|university|school|study|fees|fee reimbursement|graduation|matric|btech|degree|exam)\b/i.test(allUserTexts)) {
    profile.occupation = 'Student';
    profile.category = 'Education';
  } else if (/\b(senior|pension|old age|retired|elderly|60 plus|65|70|vridha|vriddha|grandpa|grandma|parents)\b/i.test(allUserTexts)) {
    profile.category = 'Pension';
    if (!profile.age) profile.age = 65;
  } else if (/\b(health|hospital|medical|treatment|disease|illness|doctor|medicine|ayushman|cashless|surgery)\b/i.test(allUserTexts)) {
    profile.category = 'Healthcare';
  } else if (/\b(house|housing|awas|home|pucca house|slum|homeless|kaccha|roof)\b/i.test(allUserTexts)) {
    profile.category = 'Housing';
  } else if (/\b(tea stall|thela|rehri|vendor|street vendor|push cart|dukaan|small shop|hawker|svanidhi)\b/i.test(allUserTexts)) {
    profile.occupation = 'Street Vendor';
    profile.category = 'MSME & Entrepreneurship';
  } else if (/\b(artisan|craftsperson|carpenter|blacksmith|goldsmith|potter|sculptor|cobbler|tailor|weaver|vishwakarma)\b/i.test(allUserTexts)) {
    profile.occupation = 'Artisan/Craftsperson';
    profile.category = 'Employment & Skills';
  } else if (/\b(business|msme|startup|entrepreneur|mudra|loan|shop|enterprise|capital)\b/i.test(allUserTexts)) {
    profile.occupation = 'Business owner';
    profile.category = 'MSME & Entrepreneurship';
  } else if (/\b(disabled|disability|handicapped|divyang|divyangjan|pwd|blind|deaf)\b/i.test(allUserTexts)) {
    profile.category = 'Disability Welfare';
    profile.isDifferentlyAbled = true;
  } else if (/\b(jobless|unemployed|job seeker|skill|training|pmkvy|work)\b/i.test(allUserTexts)) {
    profile.occupation = 'Unemployed';
    profile.category = 'Employment & Skills';
  }

  // 5. Income extraction
  const lakhMatch = allUserTexts.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakhs?|lacs?|l)\b/i);
  if (lakhMatch) {
    profile.income = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else {
    const rawIncomeMatch = allUserTexts.match(/(?:income|earning|salary|earns)[^0-9]*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{4,8})/i);
    if (rawIncomeMatch) {
      profile.income = parseInt(rawIncomeMatch[1].replace(/,/g, ''), 10);
    }
  }

  return profile;
}

/**
 * Detects user intent and situational context
 */
function detectIntent(message) {
  const text = message.toLowerCase().trim();

  // 1. Gratitude
  if (/^(thank you|thanks|thx|dhanyawad|shukriya|great help|awesome|appreciate it)\b/i.test(text)) {
    return 'GRATITUDE';
  }

  // 2. Greetings
  if (/^(hi|hello|hey|namaste|vanakkam|namaskara|pranam|good\s*(morning|afternoon|evening)|sup\b|howdy)/i.test(text) && text.split(/\s+/).length <= 4) {
    return 'GREETING';
  }

  // 3. Identity / Capabilities
  if (/^(who are you|what are you|what can you do|about this portal|who made you|are you an ai|are you chatgpt|introduce yourself)/i.test(text) ||
      (/\b(who are you|what can you do)\b/i.test(text) && text.split(/\s+/).length <= 6)) {
    return 'IDENTITY_CAPABILITIES';
  }

  // 4. Financial Hardship / Urgent Need
  if (/\b(broke|no money|poor|poverty|financial help|in debt|starving|cannot afford|no food|urgent help|family is poor)\b/i.test(text)) {
    return 'FINANCIAL_HARDSHIP';
  }

  // 5. Portal Navigation / 7 Steps
  if (/\b(how to use|how do i check|check eligibility|7 steps?|wizard|how does this website work|features of portal)\b/i.test(text)) {
    return 'HOW_TO_USE_PORTAL';
  }

  // 6. Documents required
  if (/\b(what documents|documents required|list of documents|document checklist|is aadhaar mandatory|income certificate needed|caste certificate)\b/i.test(text)) {
    return 'DOCUMENT_GUIDANCE';
  }

  // 7. Application process
  if (/\b(how to apply|application process|where to apply|apply online|apply offline|csc center|meeseva|grama sachivalayam|application form)\b/i.test(text)) {
    return 'APPLICATION_PROCEDURE';
  }

  // 8. Helplines & Grievances
  if (/\b(helpline|toll free|customer care|complaint|grievance|money not received|not credited|contact number|support)\b/i.test(text)) {
    return 'HELPLINES_AND_GRIEVANCES';
  }

  // 9. Specific Scheme Inquiry
  const popularSchemes = [
    'pm-kisan', 'pm kisan', 'pmkisan', 'ayushman', 'pm-jay', 'pmjay', 'pm awas', 'pmay',
    'atal pension', 'apy', 'mudra', 'pm svanidhi', 'svanidhi', 'vishwakarma', 'pm-vishwakarma',
    'sukanya', 'thalliki vandanam', 'ntr bharosa', 'rythu bharosa', 'ladki bahin',
    'gruha lakshmi', 'pudhumai penn', 'kanya sumangala', 'national scholarship', 'nsp'
  ];
  for (const s of popularSchemes) {
    if (text.includes(s)) return 'SPECIFIC_SCHEME_LOOKUP';
  }

  return 'GENERAL_QUERY';
}

/**
 * Calls Google Gemini Generative API if GEMINI_API_KEY is configured in server environment
 */
async function callGeminiIfAvailable(currentMessage, conversationHistory = [], systemContext = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

    // Format conversation history for Gemini API
    const contents = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach(msg => {
        const role = msg.sender === 'user' || msg.role === 'user' ? 'user' : 'model';
        const text = msg.text || msg.content || '';
        if (text) {
          contents.push({ role, parts: [{ text }] });
        }
      });
    }

    // Append latest query
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage }],
    });

    const payload = {
      systemInstruction: {
        parts: [
          {
            text: `You are the Sarkari Scheme Assistant AI for the "Sarkari Scheme Finder" portal.
Your personality is warm, friendly, empathetic, respectful, and engaging—just like ChatGPT, but tailored to Indian citizens.
Guidelines:
1. Speak naturally like a knowledgeable friend and advisor. Use warm Indian greetings ("Namaste!", "Hey there!", "I'd be delighted to help you!").
2. Validate the user's situation with genuine human empathy (e.g. for farmers, students, mothers, or seniors).
3. Ground all specific scheme details in authentic Indian Government guidelines (DBT, Aadhaar-seeded accounts, Ration Cards, MeeSeva/CSC).
4. Clearly state that calculations are informational guidance, and final approvals rest with the respective Government Department.
5. Reassure users that Sarkari Scheme Finder strictly NEVER asks for or stores Aadhaar numbers.
6. Provide clear, visually appealing bullet points and include official .gov.in links.
7. Always conclude with a friendly follow-up question or helpful suggestion to keep the conversation flowing smoothly.

VERIFIED PORTAL SCHEMES DATABASE CONTEXT:
${systemContext}`
          }
        ]
      },
      contents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1200,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate ? candidate.trim() : null;
  } catch (err) {
    console.warn('[Gemini API Call Failed, using local conversational engine]:', err.message);
    return null;
  }
}

/**
 * Main Assistant Response Generator with friendly, ChatGPT-style natural dialogue
 */
async function generateAssistantResponse(userMessage, language = 'en', conversationHistory = []) {
  const text = userMessage.trim();
  const intent = detectIntent(text);
  const profile = extractProfileFromConversation(conversationHistory, text);

  // 1. Gratitude
  if (intent === 'GRATITUDE') {
    return {
      reply: `😊 **You are very welcome!** 

I'm truly happy I could help you today. Navigating government portals can sometimes feel overwhelming, but remember that these welfare schemes were created to support you and your family.

**Here's what you can explore next:**
• Need help knowing **which documents** you should prepare?
• Want step-by-step guidance on **how to submit an application**?
• Or would you like to run the **7-Step Eligibility Wizard** for an official percentage match?

Just let me know whenever you're ready! I'm right here with you. 🙏`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'What documents do I need to prepare?',
        'How do I apply for schemes online?',
        'Check schemes for my family members',
      ],
    };
  }

  // 2. Greetings
  if (intent === 'GREETING') {
    return {
      reply: `🙏 **Namaste! It's wonderful to connect with you.**

I am your friendly **Sarkari Scheme Assistant AI**. Think of me as your personal guide to navigating India's welfare initiatives—Central schemes, State programs, scholarships, pensions, and farmer assistance.

**Tell me a little about yourself or your family:**
• Are you looking for support as a **farmer**, a **student**, a **woman**, or a **senior citizen**?
• Which **State** do you live in?
• Or do you have a specific scheme in mind (like *PM-KISAN*, *Ayushman Bharat*, or *PMAY Housing*)?

How can I help you today? Feel free to ask in plain, everyday words! 😊`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'I am a farmer looking for support',
        'Scholarships for college students',
        'Healthcare and hospital coverage',
        'How does this portal work?',
      ],
    };
  }

  // 3. Identity & Capabilities
  if (intent === 'IDENTITY_CAPABILITIES') {
    return {
      reply: `🤖 **Hello! Let me introduce myself.**

I am the conversational AI assistant built for **Sarkari Scheme Finder**—India's citizen-centric welfare discovery portal.

**What I Can Do For You:**
1. **Understand Your Situation:** Just tell me your story—your occupation, age, state, or income—and I'll find schemes tailored to your exact profile.
2. **Explain Eligibility in Simple Words:** No complicated bureaucratic jargon. I'll tell you clearly who qualifies, what the age/income limits are, and how much assistance you can receive.
3. **Provide Document Checklists:** I'll list the exact papers you need so you don't face rejections at government counters.
4. **Direct Official Redirection:** I will only link you to authentic **.gov.in** and **.nic.in** portals so you are 100% safe from fake intermediary agents.
5. **Zero Aadhaar Storage:** Your privacy is sacred. We never collect or store your Aadhaar or biometric data.

What would you like to explore first?`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'How do I check my eligibility?',
        'What schemes are available for women?',
        'Schemes for small business owners',
      ],
    };
  }

  // 4. Financial Hardship / Immediate Help
  if (intent === 'FINANCIAL_HARDSHIP') {
    return {
      reply: `🤝 **I completely understand how stressful financial hardship can be.** 

Please take heart—the Central and State Governments have established direct safety nets specifically designed to support families facing financial pressure.

**Here are the most immediate welfare programs you should look into:**

1. **Direct Income Support & Food Security:**
   • **PM Garib Kalyan Anna Yojana (NFSA):** Free monthly foodgrains (rice/wheat) for Priority Household (PHH) and Antyodaya (AAY) ration cardholders.
   • **State Cash Transfers:** If you live in Andhra Pradesh, Maharashtra, Karnataka, or Tamil Nadu, there are state programs (like *NTR Bharosa*, *Majhi Ladki Bahin*, *Gruha Lakshmi*) providing direct monthly bank transfers of ₹1,500 to ₹4,000.

2. **Zero-Expense Hospital Treatment:**
   • **Ayushman Bharat PM-JAY:** Provides up to **₹5,00,000 per family per year** for free secondary and tertiary hospitalization so medical emergencies don't drain your savings.

3. **Livelihood & Small Business Capital:**
   • **PM SVANidhi:** Collateral-free working capital loan starting at ₹10,000 (going up to ₹50,000) for street vendors, small stalls, and daily earners.
   • **PM Mudra Yojana (Shishu):** Micro-loans up to ₹50,000 to start or stabilize small home enterprises.

💡 **My Recommendation:** Tell me which **State** you currently reside in and your primary source of work, and I'll pinpoint the exact schemes with open application links for you right now!`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'Schemes in Andhra Pradesh',
        'How to get an Ayushman health card?',
        'Micro-loans for small business (PM Mudra)',
      ],
    };
  }

  // 5. Portal Walkthrough
  if (intent === 'HOW_TO_USE_PORTAL') {
    return {
      reply: `📋 **Here is how you can use Sarkari Scheme Finder in 3 simple minutes:**

Finding schemes on our platform is completely free, private, and automated:

### 🌟 Step 1: Log In to Your Citizen Account
Log in (or register in 30 seconds) so that your recommendations and bookmarks can be saved securely to your personal dashboard.

### 🌟 Step 2: Open the 7-Step Eligibility Wizard
Click on **"Check Eligibility"** in the top navigation bar. You will be guided through 7 simple, accessible questions:
1. **Personal:** Age, gender, marital status.
2. **Location:** State/UT and District.
3. **Financial:** Annual family income & ration card category.
4. **Employment:** Occupation (Farmer, Student, Street Vendor, Artisan, Salaried, etc.).
5. **Education:** Highest qualification & current enrollment.
6. **Vulnerability:** Benchmark disability (40%+), minority community, or EWS priority.
7. **Agriculture (Conditional):** Landholding in acres (only for farmers).

### 🌟 Step 3: View Your Match Scores
Our intelligent rule engine compares your answers against active schemes and shows you:
• **Match Percentage:** (e.g. *95% Match* for fully satisfied criteria).
• **Condition Checklist:** Clear green checks for satisfied rules, and yellow notes for documents you'll need.
• **Direct Apply Link:** Takes you straight to the verified \`.gov.in\` application portal.

Would you like to try it now, or do you have any questions before starting?`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'What documents should I keep ready?',
        'Can I compare two schemes side-by-side?',
        'Is my Aadhaar number needed?',
      ],
    };
  }

  // 6. Documents Guidance
  if (intent === 'DOCUMENT_GUIDANCE') {
    return {
      reply: `📑 **Essential Documents Checklist for Government Schemes**

To ensure your application goes through smoothly without administrative delays or rejections, keep digital and physical copies of these standard documents ready:

1. **Identity & Demographics:**
   • **Aadhaar Card:** Used for biometric eKYC at official government desks (*Note: Our portal strictly never asks for or stores your Aadhaar number*).
   • **Voter ID / PAN Card:** Secondary photo identification.

2. **Proof of Residence (Nativity / Domicile):**
   • Domicile Certificate issued by your local Tahsildar / Revenue Department / MeeSeva.
   • Recent Electricity or Water bill.

3. **Income & Economic Category:**
   • **Income Certificate:** Issued within the last 12 months by the Revenue Department.
   • **Ration Card:** BPL / Antyodaya (AAY) / White Card.

4. **Category Certificate (If Applicable):**
   • SC / ST / OBC / EWS certificate issued by the competent Sub-Divisional Magistrate or Tahsildar.

5. **Direct Benefit Transfer (DBT) Bank Account:**
   • Bank Passbook copy with clear Account Number and IFSC Code.
   • **Crucial Step:** Your bank account **must be seeded with your Aadhaar** on the **NPCI mapper** at your bank branch. Over 95% of government funds are credited only via DBT!

6. **Special Documents by Category:**
   • **Farmers:** Pattadar Passbook / ROR-1B / Land Ownership Records.
   • **Students:** Institutional Bonafide Certificate & Previous Marksheets.
   • **Divyangjan (PwD):** Disability Certificate (40%+ benchmark) or UDID Card.

Would you like to know how to get an Income Certificate or check your NPCI bank status?`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'How to check Aadhaar-bank account link?',
        'How to apply for schemes online?',
        'What are the farmer document rules?',
      ],
    };
  }

  // 7. Application Procedure
  if (intent === 'APPLICATION_PROCEDURE') {
    return {
      reply: `📝 **How and Where to Apply for Government Schemes**

You can apply for any verified government scheme through either of these two official pathways:

### Option 1: Apply Online (From Home or Mobile)
1. **Find Your Scheme:** Search for the scheme on our portal and click **"Apply on Official Website"**.
2. **Official Government Portal:** You will land directly on the authenticated \`.gov.in\` or \`.nic.in\` site (e.g. *pmkisan.gov.in*, *pmjay.gov.in*, *scholarships.gov.in*).
3. **Register / Log In:** Enter your mobile number and authenticate with OTP (via DigiLocker or MeriPehchaan).
4. **Fill Application & Upload Documents:** Enter your demographic details, bank IFSC, and attach scanned PDF/JPEG certificates (usually <500 KB).
5. **Submit & Save ARN:** Always download the acknowledgment slip and write down your **Application Reference Number (ARN)** to track status!

### Option 2: Apply Offline with Local Assistance
If you prefer in-person assistance, visit your nearest local citizen service center:
• **Common Service Centres (CSC / Digital Seva Kendra):** Available in almost every village panchayat across India.
• **State-Specific Citizen Centers:**
  - **Andhra Pradesh:** Grama / Ward Sachivalayam (Village & Ward Secretariats)
  - **Telangana:** MeeSeva Centers
  - **Karnataka:** Grama One / Karnataka One / Bangalore One
  - **Maharashtra:** Maha e-Seva Kendras / Aaple Sarkar
  - **Tamil Nadu:** e-Sevai Centers
  - **Uttar Pradesh:** Jan Seva Kendras

💡 **Friendly Pro-Tip:** Never pay cash bribes to any unverified agent. Government welfare portal services at CSCs have fixed nominal citizen charges (usually ₹20-₹50).`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'What documents do I need to carry to CSC?',
        'How do I track my application status?',
        'Helplines for complaints if money is delayed',
      ],
    };
  }

  // 8. Helplines & Grievances
  if (intent === 'HELPLINES_AND_GRIEVANCES') {
    return {
      reply: `📞 **Official National Government Helplines & Support Portals**

If your scheme installment is delayed, your card is not yet generated, or you want to file a grievance, here are the direct toll-free numbers:

• **PM-KISAN Farmer Helpline:** \`${GOV_HELPLINES.pmKisan}\`
• **All India Kisan Call Centre:** \`${GOV_HELPLINES.kisanCallCenter}\` *(Available 6:00 AM to 10:00 PM daily in 22 languages)*
• **Ayushman Bharat (PM-JAY Health):** \`${GOV_HELPLINES.ayushmanBharat}\`
• **National Consumer Helpline:** \`${GOV_HELPLINES.nationalConsumer}\`
• **National Scholarship Portal (NSP):** \`${GOV_HELPLINES.nspScholarship}\`
• **Senior Citizen Helpline (Elder Line):** \`${GOV_HELPLINES.seniorCitizens}\`
• **Women in Distress Helpline:** \`${GOV_HELPLINES.womenHelpline}\`
• **National Childline:** \`${GOV_HELPLINES.childline}\`
• **Divyangjan (Disability) Helpline:** \`${GOV_HELPLINES.disabilityHelpline}\`

🏛️ **Central Public Grievance Portal (CPGRAMS):**
You can file an official grievance directly to any Ministry or State Department at [pgportal.gov.in](https://pgportal.gov.in). Government departments are mandated to respond to CPGRAMS complaints within 30 days!

Is there a specific scheme whose payment status you are trying to track?`,
      matchedSchemes: [],
      detectedProfile: profile,
      suggestedPrompts: [
        'Why was my PM-KISAN installment not credited?',
        'How do I file a complaint on CPGRAMS?',
        'Check farmer schemes in my state',
      ],
    };
  }

  // 9. Grounded Database Retrieval & Dynamic Matching
  const andConditions = [{ status: 'Active' }];

  if (profile.state) {
    andConditions.push({
      $or: [
        { state: 'All' },
        { state: new RegExp(`^${profile.state}$`, 'i') },
        { state: new RegExp(profile.state, 'i') },
      ],
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

  // Meaningful keywords extraction
  const stopWords = ['what', 'which', 'schemes', 'from', 'with', 'annual', 'income', 'check', 'available', 'eligibility', 'detail', 'details', 'tell', 'about', 'some', 'please', 'give', 'list', 'government', 'sarkari', 'yojana', 'yojanas', 'want', 'need', 'know', 'help'];
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

  // If query yielded 0, gracefully relax
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

  // Format database context summary
  const schemesContextSummary = matchedSchemes.map((s, idx) => {
    const elig = s.eligibilityCriteria || {};
    const rules = [];
    if (elig.age?.min > 0 || elig.age?.max < 100) rules.push(`Age: ${elig.age.min || 0}-${elig.age.max || 100} yrs`);
    if (elig.income?.max > 0) rules.push(`Max Annual Income: ₹${elig.income.max.toLocaleString('en-IN')}`);
    if (elig.gender && elig.gender !== 'All') rules.push(`Gender: ${elig.gender}`);
    if (elig.occupations?.length && !elig.occupations.includes('All')) rules.push(`Occupation: ${elig.occupations.join(', ')}`);
    if (elig.landHolding?.maxAcres > 0) rules.push(`Max Land: ${elig.landHolding.maxAcres} acres`);

    return `${idx + 1}. ${s.schemeName} (${s.governmentLevel} Govt - State: ${s.state})
- Department: ${s.department}
- Category: ${s.category}
- Key Benefits: ${Array.isArray(s.benefits) ? s.benefits.join('; ') : s.benefits}
- Criteria: ${rules.length > 0 ? rules.join(' | ') : 'General citizen criteria'}
- Required Documents: ${Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join(', ') : s.requiredDocuments}
- Official Application Link: ${s.applicationLink}
- Official Website: ${s.officialWebsite}`;
  }).join('\n\n');

  // Attempt Gemini API if configured
  const geminiReply = await callGeminiIfAvailable(text, conversationHistory, schemesContextSummary);
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
      suggestedPrompts: [
        'How do I apply for these?',
        'What documents are needed?',
        'Check schemes for my family',
      ],
    };
  }

  // ChatGPT-style Conversational Natural Response
  let replyText = `🌟 **Here is what I found for you!**\n\n`;

  const profileTags = [];
  if (profile.age) profileTags.push(`${profile.age} years old`);
  if (profile.gender) profileTags.push(`${profile.gender}`);
  if (profile.state) profileTags.push(`Resident of ${profile.state}`);
  if (profile.occupation) profileTags.push(`${profile.occupation}`);
  if (profile.income) profileTags.push(`Income ₹${profile.income.toLocaleString('en-IN')}/year`);

  if (profileTags.length > 0) {
    replyText += `Based on the details you mentioned (**${profileTags.join(' • ')}**), here are the top verified welfare schemes that match your profile:\n\n`;
  } else {
    replyText += `Here are the top verified welfare schemes matching your inquiry:\n\n`;
  }

  matchedSchemes.forEach((scheme, idx) => {
    replyText += `### ${idx + 1}. ${scheme.schemeName}\n`;
    replyText += `🏛️ **Level & Department:** ${scheme.governmentLevel} Government (${scheme.department})\n`;
    replyText += `💰 **What You Receive:** ${Array.isArray(scheme.benefits) ? scheme.benefits.slice(0, 2).join('; ') : scheme.benefits}\n`;

    const elig = scheme.eligibilityCriteria || {};
    const conds = [];
    if (elig.age?.min > 0 || elig.age?.max < 100) conds.push(`Age ${elig.age.min || 0} to ${elig.age.max || 100} yrs`);
    if (elig.income?.max > 0) conds.push(`Family Income up to ₹${elig.income.max.toLocaleString('en-IN')}/yr`);
    if (elig.gender && elig.gender !== 'All') conds.push(`For ${elig.gender}`);
    if (elig.occupations?.length && !elig.occupations.includes('All')) conds.push(`Occupation: ${elig.occupations.join(', ')}`);
    if (elig.landHolding?.maxAcres > 0) conds.push(`Landholding up to ${elig.landHolding.maxAcres} acres`);

    replyText += `🎯 **Who Qualifies:** ${conds.length ? conds.join(' | ') : 'All eligible citizens residing in ' + scheme.state}\n`;
    replyText += `📄 **Key Documents:** ${Array.isArray(scheme.requiredDocuments) ? scheme.requiredDocuments.slice(0, 4).join(', ') : scheme.requiredDocuments}\n`;
    replyText += `🔗 **Direct Link:** [Apply on Official Website](${scheme.applicationLink})\n\n`;
  });

  replyText += `\n💬 **What would you like to do next?**\n`;
  replyText += `• I can walk you through the **step-by-step application procedure** for any scheme above.\n`;
  replyText += `• Or if you have another family member (like a student or parent), tell me about them and we'll check their benefits too!\n\n`;
  replyText += `⚠️ *Note: Recommendations provided here are for informational guidance based on verified government criteria. Final approvals and disbursements rest exclusively with the respective Government Department.*`;

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
    suggestedPrompts: [
      'How do I apply for the first scheme?',
      'What documents do I need to prepare?',
      'Tell me about schemes in another state',
    ],
  };
}

module.exports = {
  generateAssistantResponse,
  extractProfileFromConversation,
  detectIntent,
  GOV_HELPLINES,
};
