const Scheme = require('../models/Scheme');

/**
 * Parses user prompt to extract intent, demographics, and query keywords
 */
function extractProfileFromQuery(message) {
  const text = message.toLowerCase();
  const profile = {};

  // Extract age e.g. "65 years old", "age 65", "65-year-old", "65 yr"
  const ageMatch = text.match(/(?:age\s*[:=]?\s*|i am\s+|aged?\s*)(\d{1,3})|(?:(\d{1,3})\s*(?:years?|yrs?|year-old|yr-old))/i);
  if (ageMatch) {
    profile.age = parseInt(ageMatch[1] || ageMatch[2], 10);
  }

  // Extract State
  const states = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
  ];
  for (const s of states) {
    if (text.includes(s.toLowerCase())) {
      profile.state = s;
      break;
    }
  }

  // Extract Occupation / Category
  if (text.includes('farm') || text.includes('kisan') || text.includes('agriculture') || text.includes('crop')) {
    profile.occupation = 'Farmer';
    profile.category = 'Agriculture';
  } else if (text.includes('student') || text.includes('scholarship') || text.includes('study') || text.includes('college') || text.includes('school')) {
    profile.occupation = 'Student';
    profile.category = 'Education';
  } else if (text.includes('pension') || text.includes('old age') || text.includes('senior')) {
    profile.category = 'Pension';
    if (!profile.age) profile.age = 62;
  } else if (text.includes('health') || text.includes('hospital') || text.includes('medical') || text.includes('treatment') || text.includes('ayushman')) {
    profile.category = 'Healthcare';
  } else if (text.includes('house') || text.includes('housing') || text.includes('awas') || text.includes('home')) {
    profile.category = 'Housing';
  } else if (text.includes('woman') || text.includes('women') || text.includes('girl') || text.includes('female') || text.includes('mother')) {
    profile.gender = 'Female';
    profile.category = 'Women & Child Welfare';
  } else if (text.includes('business') || text.includes('loan') || text.includes('msme') || text.includes('vendor') || text.includes('mudra') || text.includes('dukaan')) {
    profile.occupation = 'Business owner';
    profile.category = 'MSME & Entrepreneurship';
  }

  // Extract Income e.g. "80,000", "80000", "2.5 lakh"
  const incomeMatch = text.match(/(?:income|earning|earns|salary)[^0-9]*([0-9]+(?:,[0-9]+)*)/i);
  if (incomeMatch) {
    profile.income = parseInt(incomeMatch[1].replace(/,/g, ''), 10);
  }

  return profile;
}

/**
 * Generates an AI response strictly grounded in verified database schemes
 */
async function generateAssistantResponse(userMessage, language = 'en') {
  const profile = extractProfileFromQuery(userMessage);

  // Build MongoDB query
  const queryConditions = [{ status: 'Active' }];

  if (profile.state) {
    queryConditions.push({
      $or: [{ state: 'All' }, { state: new RegExp(profile.state, 'i') }],
    });
  }

  if (profile.category) {
    queryConditions.push({
      $or: [
        { category: new RegExp(profile.category, 'i') },
        { schemeName: new RegExp(profile.category, 'i') },
      ],
    });
  }

  // Also search text in schemeName or description if specific keyword mentioned
  const words = userMessage.split(/\s+/).filter(w => w.length > 3 && !['what', 'which', 'schemes', 'from', 'with', 'annual', 'income', 'check'].includes(w.toLowerCase()));
  if (words.length > 0 && !profile.category) {
    queryConditions.push({
      $or: words.map(w => ({
        $or: [
          { schemeName: new RegExp(w, 'i') },
          { category: new RegExp(w, 'i') },
          { department: new RegExp(w, 'i') },
        ],
      })),
    });
  }

  let matchedSchemes = await Scheme.find({ $and: queryConditions }).limit(6).lean();

  // Fallback to top active schemes if specific query yielded 0
  if (matchedSchemes.length === 0) {
    matchedSchemes = await Scheme.find({ status: 'Active' })
      .sort({ viewCount: -1 })
      .limit(4)
      .lean();
  }

  // Build grounded response
  let replyText = `Hello! Based on your query`;
  if (profile.age || profile.state || profile.occupation) {
    const details = [];
    if (profile.age) details.push(`Age: ${profile.age}`);
    if (profile.state) details.push(`State: ${profile.state}`);
    if (profile.occupation) details.push(`Occupation: ${profile.occupation}`);
    replyText += ` (${details.join(', ')}), here are the most relevant verified government schemes from our database:\n\n`;
  } else {
    replyText += `, here are key welfare schemes that you can explore:\n\n`;
  }

  matchedSchemes.forEach((scheme, idx) => {
    replyText += `**${idx + 1}. ${scheme.schemeName} (${scheme.governmentLevel} Government)**\n`;
    replyText += `• **Department:** ${scheme.department}\n`;
    replyText += `• **Primary Benefits:** ${Array.isArray(scheme.benefits) ? scheme.benefits.slice(0, 2).join('; ') : scheme.benefits}\n`;
    
    // Eligibility highlights
    const elig = scheme.eligibilityCriteria;
    const conds = [];
    if (elig.age?.min > 0 || elig.age?.max < 100) conds.push(`Age ${elig.age.min}-${elig.age.max} years`);
    if (elig.income?.max > 0) conds.push(`Max Annual Income ₹${elig.income.max.toLocaleString('en-IN')}`);
    if (elig.occupations?.length && !elig.occupations.includes('All')) conds.push(`Occupation: ${elig.occupations.join(', ')}`);
    
    replyText += `• **Key Eligibility Rules:** ${conds.length ? conds.join(' | ') : 'General citizen criteria'}\n`;
    replyText += `• **Required Documents:** ${scheme.requiredDocuments.slice(0, 4).join(', ')}\n`;
    replyText += `• **Official Portal / Link:** [Apply Here](${scheme.applicationLink})\n\n`;
  });

  replyText += `\n⚠️ **Important Disclaimer:** Eligibility calculations and recommendations provided here are for informational guidance based on verified guidelines. Final eligibility and approvals are decided exclusively by the respective Government Department. Please verify your documents and criteria on the official website before applying.`;

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
};
