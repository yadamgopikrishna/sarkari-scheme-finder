/**
 * Sarkari Scheme Finder - Core Eligibility Engine
 * Dynamically compares citizen demographic, economic, and occupational profile
 * against structured scheme eligibility rules.
 */

function evaluateSchemeEligibility(userProfile, scheme) {
  const criteria = scheme.eligibilityCriteria || {};
  
  let totalWeight = 0;
  let earnedWeight = 0;
  let hardDisqualified = false;
  
  const matchedConditions = [];
  const verificationConditions = [];
  const unmetConditions = [];

  // 1. State / Location Evaluation
  const schemeStates = criteria.states || ['All'];
  const isCentral = scheme.governmentLevel === 'Central';
  const schemeState = scheme.state || 'All';

  totalWeight += 20;
  if (isCentral || schemeState === 'All' || schemeStates.includes('All')) {
    earnedWeight += 20;
    matchedConditions.push('Applicable across all States & Union Territories');
  } else {
    const userState = (userProfile.state || '').trim().toLowerCase();
    const targetState = (schemeState || '').trim().toLowerCase();
    const inStatesList = schemeStates.some(s => s.trim().toLowerCase() === userState);

    if (userState && (userState === targetState || inStatesList)) {
      earnedWeight += 20;
      matchedConditions.push(`State requirement satisfied (${userProfile.state})`);
    } else {
      hardDisqualified = true;
      unmetConditions.push(`Scheme is exclusively for residents of ${schemeState}`);
    }
  }

  // 2. Age Evaluation
  const minAge = criteria.age?.min ?? 0;
  const maxAge = criteria.age?.max ?? 120;
  const userAge = Number(userProfile.age);

  if (minAge > 0 || maxAge < 120) {
    totalWeight += 20;
    if (!isNaN(userAge) && userAge > 0) {
      if (userAge >= minAge && userAge <= maxAge) {
        earnedWeight += 20;
        matchedConditions.push(`Age requirement satisfied (${userAge} years within eligible range of ${minAge}-${maxAge} years)`);
      } else {
        if (userAge < minAge) {
          unmetConditions.push(`Minimum age required is ${minAge} years (User age: ${userAge})`);
        } else {
          unmetConditions.push(`Maximum age limit is ${maxAge} years (User age: ${userAge})`);
        }
      }
    } else {
      verificationConditions.push(`Age verification required (${minAge}-${maxAge} years)`);
      earnedWeight += 10;
    }
  }

  // 3. Gender Evaluation
  const schemeGenders = criteria.genders || ['All'];
  if (!schemeGenders.includes('All') && schemeGenders.length > 0) {
    totalWeight += 15;
    const userGender = (userProfile.gender || '').trim();
    if (userGender && schemeGenders.some(g => g.toLowerCase() === userGender.toLowerCase())) {
      earnedWeight += 15;
      matchedConditions.push(`Gender requirement satisfied (${userProfile.gender})`);
    } else if (!userGender) {
      verificationConditions.push(`Reserved specifically for ${schemeGenders.join(', ')} beneficiaries`);
    } else {
      unmetConditions.push(`Scheme is specifically for ${schemeGenders.join(', ')} beneficiaries`);
    }
  }

  // 4. Annual Income Evaluation
  const maxIncome = criteria.income?.max ?? 0;
  const userIncome = Number(userProfile.annualIncome ?? userProfile.income ?? 0);

  if (maxIncome > 0) {
    totalWeight += 20;
    if (userIncome > 0) {
      if (userIncome <= maxIncome) {
        earnedWeight += 20;
        matchedConditions.push(
          `Annual family income criteria satisfied (₹${userIncome.toLocaleString('en-IN')} ≤ ₹${maxIncome.toLocaleString('en-IN')})`
        );
      } else {
        unmetConditions.push(
          `Annual income (₹${userIncome.toLocaleString('en-IN')}) exceeds scheme limit of ₹${maxIncome.toLocaleString('en-IN')}`
        );
      }
    } else {
      earnedWeight += 10;
      verificationConditions.push(`Valid family income certificate required (Ceiling: ₹${maxIncome.toLocaleString('en-IN')})`);
    }
  }

  // 5. Occupation Evaluation
  const schemeOccupations = criteria.occupations || ['All'];
  if (!schemeOccupations.includes('All') && schemeOccupations.length > 0) {
    totalWeight += 20;
    const userOcc = (userProfile.occupation || '').trim();
    if (userOcc && schemeOccupations.some(o => o.toLowerCase() === userOcc.toLowerCase())) {
      earnedWeight += 20;
      matchedConditions.push(`Occupation requirement satisfied (${userProfile.occupation})`);
    } else if (userOcc === 'Other' || !userOcc) {
      verificationConditions.push(`Intended for ${schemeOccupations.join(', ')}; check if current work qualifies`);
      earnedWeight += 8;
    } else {
      unmetConditions.push(`Scheme is designed specifically for ${schemeOccupations.join(', ')}`);
    }
  }

  // 6. Farmer Specific Landholding Rules
  if (criteria.farmerSpecific?.landRequired || criteria.farmerSpecific?.maxLandAcres > 0) {
    totalWeight += 15;
    const isFarmer = (userProfile.occupation || '').toLowerCase() === 'farmer' || userProfile.isFarmer === true;
    const userLand = Number(userProfile.landSize ?? 0);

    if (isFarmer) {
      const maxAcres = criteria.farmerSpecific.maxLandAcres;
      if (maxAcres > 0) {
        if (userLand > 0 && userLand <= maxAcres) {
          earnedWeight += 15;
          matchedConditions.push(`Landholding requirement satisfied (${userLand} acres ≤ ${maxAcres} acres)`);
        } else if (userLand > maxAcres) {
          unmetConditions.push(`Landholding of ${userLand} acres exceeds scheme ceiling of ${maxAcres} acres`);
        } else {
          earnedWeight += 10;
          verificationConditions.push(`Cultivable landholding must not exceed ${maxAcres} acres (subject to RoR / Passbook verification)`);
        }
      } else {
        earnedWeight += 15;
        matchedConditions.push('Farmer category recognized');
      }
      verificationConditions.push('Valid Land Revenue Records / Pattadar Passbook required for verification');
    } else {
      unmetConditions.push('Scheme requires applicant or family to be an active landholding farmer');
    }
  }

  // 7. Student / Education Criteria
  if (criteria.studentOnly || (criteria.educationLevels && !criteria.educationLevels.includes('All'))) {
    totalWeight += 15;
    const isStudent = userProfile.isStudent === true || userProfile.studentStatus === 'Yes';
    if (criteria.studentOnly) {
      if (isStudent) {
        earnedWeight += 15;
        matchedConditions.push('Applicant is enrolled as an active student');
      } else {
        unmetConditions.push('Exclusively available for actively studying students');
      }
    }
    if (criteria.educationLevels && !criteria.educationLevels.includes('All')) {
      const userEdu = userProfile.educationLevel || '';
      if (userEdu && criteria.educationLevels.includes(userEdu)) {
        matchedConditions.push(`Education level matched (${userEdu})`);
      } else {
        verificationConditions.push(`Requires enrolment / completion of: ${criteria.educationLevels.join(', ')}`);
      }
    }
  }

  // 8. Disability Status
  if (criteria.disabilityOnly) {
    totalWeight += 15;
    const hasDisability = userProfile.isDisability === true || userProfile.hasDisability === 'Yes';
    const userPercent = Number(userProfile.disabilityPercentage ?? 0);
    const minPercent = criteria.minDisabilityPercentage || 40;

    if (hasDisability) {
      if (userPercent >= minPercent) {
        earnedWeight += 15;
        matchedConditions.push(`Disability criteria satisfied (${userPercent}% ≥ ${minPercent}% benchmark)`);
      } else {
        earnedWeight += 10;
        verificationConditions.push(`UDID / Medical Board Certificate with minimum ${minPercent}% disability required`);
      }
    } else {
      unmetConditions.push('Reserved for Persons with Benchmark Disabilities (PwD)');
    }
  }

  // 9. BPL / Ration Card Criteria
  if (criteria.bplOnly || (criteria.rationCardCategories && !criteria.rationCardCategories.includes('Any'))) {
    totalWeight += 10;
    const isBpl = userProfile.isBpl === true || userProfile.bplStatus === 'Yes';
    const userRation = (userProfile.rationCardCategory || '').toUpperCase();
    const priorityCards = ['BPL', 'AAY', 'ANTYODAYA', 'WHITE', 'PHH'];

    if (isBpl || priorityCards.includes(userRation)) {
      earnedWeight += 10;
      matchedConditions.push('Priority / BPL Ration Card status verified');
    } else {
      verificationConditions.push('BPL certificate or eligible food security ration card required');
      earnedWeight += 4;
    }
  }

  // 10. Special Categories (Widow, Orphan, Senior Citizen, Pregnant woman, etc.)
  if (criteria.specialCategories && criteria.specialCategories.length > 0) {
    totalWeight += 10;
    const userSpecials = Array.isArray(userProfile.specialCategories) ? userProfile.specialCategories : [];
    const matchedSpecials = criteria.specialCategories.filter(sc => 
      userSpecials.includes(sc) ||
      (sc === 'Senior citizen' && userAge >= 60) ||
      (sc === 'Widow' && userProfile.maritalStatus === 'Widow') ||
      (sc === 'Pregnant woman' && userProfile.isPregnant === true)
    );

    if (matchedSpecials.length > 0) {
      earnedWeight += 10;
      matchedConditions.push(`Special category priority matched: ${matchedSpecials.join(', ')}`);
    } else {
      verificationConditions.push(`Preference / eligibility applies for: ${criteria.specialCategories.join(', ')}`);
      earnedWeight += 3;
    }
  }

  // Default document verification reminder based on scheme's required documents
  if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
    verificationConditions.push(`Ensure you hold: ${scheme.requiredDocuments.slice(0, 3).join(', ')}`);
  }

  // Calculate matching percentage
  if (totalWeight === 0) totalWeight = 10;
  let matchPercentage = Math.round((earnedWeight / totalWeight) * 100);

  if (hardDisqualified) {
    matchPercentage = Math.min(matchPercentage, 25);
  }

  // Cap between 15% and 98% (avoid 100% since no algorithmic portal can guarantee government sanction)
  if (matchPercentage > 95) matchPercentage = 95;
  if (matchPercentage < 20 && !hardDisqualified) matchPercentage = 25;

  const isEligible = matchPercentage >= 60 && !hardDisqualified;

  return {
    schemeId: scheme._id,
    schemeName: scheme.schemeName,
    schemeCode: scheme.schemeCode,
    category: scheme.category,
    governmentLevel: scheme.governmentLevel,
    state: scheme.state,
    department: scheme.department,
    benefits: scheme.benefits,
    benefitAmount: scheme.benefitAmount,
    matchPercentage,
    isEligible,
    statusLabel: isEligible ? 'You may be eligible' : 'Low match based on current criteria',
    matchedConditions,
    verificationConditions,
    unmetConditions,
    officialWebsite: scheme.officialWebsite,
    applicationLink: scheme.applicationLink,
    applicationMode: scheme.applicationMode,
    helplineNumber: scheme.helplineNumber,
    lastVerified: scheme.lastVerified,
  };
}

module.exports = {
  evaluateSchemeEligibility,
};
