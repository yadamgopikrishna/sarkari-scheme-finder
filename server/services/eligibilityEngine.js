/**
 * Sarkari Scheme Finder - Core Eligibility & Recommendation Engine
 * Dynamically compares citizen demographic, economic, geographic, and occupational profile
 * against verified Central and State government welfare scheme eligibility criteria.
 */

function evaluateSchemeEligibility(userProfile, scheme) {
  const criteria = scheme.eligibilityCriteria || {};

  let totalWeight = 0;
  let earnedWeight = 0;
  let hardDisqualified = false;

  const matchedConditions = [];
  const verificationConditions = [];
  const unmetConditions = [];

  // Normalize user inputs
  const userAge = Number(userProfile.age);
  const userGender = (userProfile.gender || '').trim().toLowerCase();
  const userState = (userProfile.state || '').trim().toLowerCase();
  const userOcc = (userProfile.occupation || '').trim().toLowerCase();
  const userIncome = Number(userProfile.annualIncome ?? userProfile.income ?? 0);
  const userSpecials = Array.isArray(userProfile.specialCategories) ? userProfile.specialCategories : [];

  const isBpl = userProfile.isBpl === true || userProfile.bplStatus === 'Yes';
  const userRation = (userProfile.rationCardCategory || '').toUpperCase();
  const priorityCards = ['BPL', 'AAY', 'ANTYODAYA', 'WHITE', 'PHH'];
  const hasBplCard = isBpl || priorityCards.includes(userRation);

  const hasDisability = userProfile.isDisability === true ||
                        userProfile.hasDisability === 'Yes' ||
                        userSpecials.includes('Person with Disability (PwD)');
  const userDisabilityPct = Number(userProfile.disabilityPercentage ?? 0);

  const isUserStudent = userProfile.isStudent === true ||
                        userProfile.studentStatus === 'Yes' ||
                        userOcc === 'student';

  const isUserFarmer = userOcc === 'farmer' ||
                       userOcc === 'agricultural worker' ||
                       userProfile.isFarmer === true;

  const isUserArtisan = userProfile.isArtisan === true ||
                        userSpecials.includes('Artisan/Craftsperson') ||
                        userOcc.includes('artisan') ||
                        userOcc.includes('craft') ||
                        userOcc.includes('handicraft') ||
                        userOcc.includes('weaver') ||
                        userOcc.includes('carpenter') ||
                        userOcc.includes('blacksmith') ||
                        userOcc.includes('potter') ||
                        userOcc.includes('sculptor') ||
                        userOcc.includes('cobbler') ||
                        userOcc.includes('tailor');

  const isUserVendor = userProfile.isStreetVendor === true ||
                       userSpecials.includes('Street vendor') ||
                       userOcc.includes('street vendor') ||
                       userOcc.includes('vendor') ||
                       userOcc.includes('hawker');

  // -------------------------------------------------------------
  // 1. STATE & GEOGRAPHIC RESIDENCY EVALUATION
  // -------------------------------------------------------------
  const schemeStates = criteria.states || (scheme.state ? [scheme.state] : ['All']);
  const isCentral = scheme.governmentLevel === 'Central' || scheme.state === 'All' || schemeStates.includes('All');

  totalWeight += 25;
  if (isCentral) {
    earnedWeight += 25;
    matchedConditions.push('Central Scheme / Nationwide eligibility across all States & UTs');
  } else {
    const targetState = (scheme.state || '').trim().toLowerCase();
    const stateMatches = userState && (
      userState === targetState ||
      schemeStates.some(s => s.trim().toLowerCase() === userState)
    );

    if (stateMatches) {
      earnedWeight += 25;
      matchedConditions.push(`State residency requirement satisfied (${userProfile.state})`);
    } else {
      hardDisqualified = true;
      unmetConditions.push(`Exclusively for residents of ${scheme.state} (Applicant state: ${userProfile.state || 'Not provided'})`);
    }
  }

  // -------------------------------------------------------------
  // 2. DISABILITY WELFARE CRITERIA (Benchmark PwD)
  // -------------------------------------------------------------
  const isDisabilityScheme = criteria.disabilityOnly === true || scheme.category === 'Disability Welfare';
  if (isDisabilityScheme) {
    totalWeight += 25;
    const minDisabilityPct = criteria.minDisabilityPercentage || 40;

    if (!hasDisability) {
      hardDisqualified = true;
      unmetConditions.push('Scheme is exclusively reserved for Persons with Benchmark Disabilities (PwD) holding UDID / Medical Certificate');
    } else {
      if (userDisabilityPct >= minDisabilityPct) {
        earnedWeight += 25;
        matchedConditions.push(`Disability criteria satisfied (${userDisabilityPct}% ≥ ${minDisabilityPct}% benchmark)`);
      } else if (userDisabilityPct > 0) {
        hardDisqualified = true;
        unmetConditions.push(`Minimum ${minDisabilityPct}% certified benchmark disability required (Applicant reported: ${userDisabilityPct}%)`);
      } else {
        earnedWeight += 15;
        verificationConditions.push(`UDID card or State Medical Board Certificate with ≥ ${minDisabilityPct}% benchmark required`);
      }
    }
  }

  // -------------------------------------------------------------
  // 3. GENDER CRITERIA
  // -------------------------------------------------------------
  const schemeGenders = (criteria.genders || ['All']).map(g => g.trim().toLowerCase());
  if (!schemeGenders.includes('all') && schemeGenders.length > 0) {
    totalWeight += 20;
    if (userGender && schemeGenders.includes(userGender)) {
      earnedWeight += 20;
      matchedConditions.push(`Gender requirement satisfied (${userProfile.gender})`);
    } else if (!userGender) {
      verificationConditions.push(`Reserved specifically for ${criteria.genders.join(', ')} beneficiaries`);
    } else {
      hardDisqualified = true;
      unmetConditions.push(`Scheme is exclusively for ${criteria.genders.join(', ')} beneficiaries (Applicant is ${userProfile.gender})`);
    }
  }

  // -------------------------------------------------------------
  // 4. AGE CRITERIA
  // -------------------------------------------------------------
  const minAge = criteria.age?.min ?? 0;
  const maxAge = criteria.age?.max ?? 120;

  if (minAge > 0 || maxAge < 120) {
    totalWeight += 20;
    if (!isNaN(userAge) && userAge > 0) {
      if (userAge >= minAge && userAge <= maxAge) {
        earnedWeight += 20;
        matchedConditions.push(`Age requirement satisfied (${userAge} years within eligible range of ${minAge}-${maxAge} years)`);
      } else {
        hardDisqualified = true;
        if (userAge < minAge) {
          unmetConditions.push(`Minimum entry age required is ${minAge} years (Applicant age: ${userAge})`);
        } else {
          unmetConditions.push(`Maximum age ceiling is ${maxAge} years (Applicant age: ${userAge})`);
        }
      }
    } else {
      verificationConditions.push(`Age verification required (${minAge}-${maxAge} years)`);
      earnedWeight += 10;
    }
  }

  // -------------------------------------------------------------
  // 5. STUDENT & EDUCATION STATUS CRITERIA
  // -------------------------------------------------------------
  const isStudentScheme = criteria.studentOnly === true || 
                          (Array.isArray(criteria.occupations) && criteria.occupations.length === 1 && criteria.occupations[0].toLowerCase() === 'student');

  if (isStudentScheme) {
    totalWeight += 25;
    if (!isUserStudent) {
      hardDisqualified = true;
      unmetConditions.push('Scheme is exclusively for actively enrolled students in recognized institutions');
    } else {
      earnedWeight += 25;
      matchedConditions.push('Applicant is currently enrolled as an active student');

      if (criteria.educationLevels && !criteria.educationLevels.includes('All')) {
        const userEdu = userProfile.educationLevel || '';
        if (userEdu && criteria.educationLevels.includes(userEdu)) {
          matchedConditions.push(`Education level matched (${userEdu})`);
        } else {
          verificationConditions.push(`Target course levels: ${criteria.educationLevels.join(', ')}`);
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 6. TRADITIONAL ARTISAN & HANDICRAFT CRITERIA (PM Vishwakarma, etc.)
  // -------------------------------------------------------------
  const isArtisanScheme = criteria.artisanOnly === true ||
                          scheme.schemeCode === 'PM-VISHWAKARMA' ||
                          (Array.isArray(criteria.specialCategories) && criteria.specialCategories.includes('Artisan/Craftsperson'));

  if (isArtisanScheme) {
    totalWeight += 25;
    if (!isUserArtisan) {
      hardDisqualified = true;
      unmetConditions.push('Scheme is exclusively reserved for traditional artisans and craftspersons across recognized trades (carpenters, blacksmiths, potters, weavers, tailors, etc.)');
    } else {
      earnedWeight += 25;
      matchedConditions.push('Traditional artisan / craftsperson trade qualification recognized');
    }
  }

  // -------------------------------------------------------------
  // 7. STREET VENDOR CRITERIA (PM SVANidhi, etc.)
  // -------------------------------------------------------------
  const isStreetVendorScheme = criteria.streetVendorOnly === true ||
                               scheme.schemeCode === 'PM-SVANIDHI' ||
                               (Array.isArray(criteria.specialCategories) && criteria.specialCategories.includes('Street vendor'));

  if (isStreetVendorScheme) {
    totalWeight += 25;
    if (!isUserVendor) {
      hardDisqualified = true;
      unmetConditions.push('Scheme is exclusively reserved for urban / semi-urban street vendors holding ULB vending certification or LoR');
    } else {
      earnedWeight += 25;
      matchedConditions.push('Street vendor category recognized for working capital credit support');
    }
  }

  // -------------------------------------------------------------
  // 8. FARMER & AGRICULTURE LANDHOLDING CRITERIA
  // -------------------------------------------------------------
  const isFarmerScheme = criteria.farmerSpecific?.landRequired === true ||
                         (criteria.farmerSpecific?.maxLandAcres > 0) ||
                         (scheme.category === 'Agriculture' && Array.isArray(criteria.occupations) && criteria.occupations.some(o => o.toLowerCase() === 'farmer'));

  if (isFarmerScheme) {
    totalWeight += 25;
    if (!isUserFarmer) {
      hardDisqualified = true;
      unmetConditions.push('Scheme is reserved strictly for active farmers and agricultural landholders');
    } else {
      const userLand = Number(userProfile.landSize ?? 0);
      const maxAcres = criteria.farmerSpecific?.maxLandAcres ?? 0;

      if (maxAcres > 0) {
        if (userLand > 0 && userLand <= maxAcres) {
          earnedWeight += 25;
          matchedConditions.push(`Landholding requirement satisfied (${userLand} acres ≤ ${maxAcres} acres ceiling)`);
        } else if (userLand > maxAcres) {
          hardDisqualified = true;
          unmetConditions.push(`Landholding of ${userLand} acres exceeds scheme ceiling of ${maxAcres} acres`);
        } else {
          earnedWeight += 15;
          verificationConditions.push(`Landholding must not exceed ${maxAcres} acres (subject to RoR / Passbook verification)`);
        }
      } else {
        earnedWeight += 25;
        matchedConditions.push('Farmer category recognized');
      }
      verificationConditions.push('Valid Land Revenue Records / Pattadar Passbook required for DBT transfer');
    }
  }

  // -------------------------------------------------------------
  // 9. GENERAL OCCUPATION EVALUATION (For other specialized schemes)
  // -------------------------------------------------------------
  if (!isFarmerScheme && !isArtisanScheme && !isStreetVendorScheme && !isStudentScheme) {
    const schemeOccupations = criteria.occupations || ['All'];
    if (!schemeOccupations.includes('All') && schemeOccupations.length > 0) {
      totalWeight += 20;
      const normSchemeOccs = schemeOccupations.map(o => o.trim().toLowerCase());
      const occMatched = normSchemeOccs.some(o => 
        o === userOcc || 
        (userOcc && o.includes(userOcc)) || 
        (userOcc && userOcc.includes(o))
      );

      if (occMatched) {
        earnedWeight += 20;
        matchedConditions.push(`Occupation requirement satisfied (${userProfile.occupation})`);
      } else if (userOcc === 'other' || !userOcc) {
        earnedWeight += 8;
        verificationConditions.push(`Scheme targets: ${schemeOccupations.join(', ')}; verification of work profile required`);
      } else {
        // Occupation does not match scheme target
        unmetConditions.push(`Scheme targets: ${schemeOccupations.join(', ')} (Applicant is: ${userProfile.occupation})`);
        hardDisqualified = true;
      }
    }
  }

  // -------------------------------------------------------------
  // 10. ANNUAL FAMILY INCOME CEILING
  // -------------------------------------------------------------
  const maxIncome = criteria.income?.max ?? 0;
  if (maxIncome > 0) {
    totalWeight += 20;
    if (userIncome > 0) {
      if (userIncome <= maxIncome) {
        earnedWeight += 20;
        matchedConditions.push(`Annual family income criteria satisfied (₹${userIncome.toLocaleString('en-IN')} ≤ ₹${maxIncome.toLocaleString('en-IN')})`);
      } else {
        unmetConditions.push(`Annual income of ₹${userIncome.toLocaleString('en-IN')} exceeds scheme ceiling of ₹${maxIncome.toLocaleString('en-IN')}`);
        if (userIncome > maxIncome * 1.25) {
          hardDisqualified = true;
        }
      }
    } else {
      earnedWeight += 10;
      verificationConditions.push(`Valid family income certificate required (Ceiling: ₹${maxIncome.toLocaleString('en-IN')})`);
    }
  }

  // -------------------------------------------------------------
  // 11. BPL / RATION CARD CATEGORY
  // -------------------------------------------------------------
  if (criteria.bplOnly) {
    totalWeight += 15;
    if (hasBplCard) {
      earnedWeight += 15;
      matchedConditions.push(`Priority / BPL Ration Card status verified (${userProfile.rationCardCategory || 'BPL'})`);
    } else {
      hardDisqualified = true;
      unmetConditions.push('Scheme is exclusively reserved for Below Poverty Line (BPL) / Priority Household ration card holders');
    }
  }

  // -------------------------------------------------------------
  // 12. SPECIAL CATEGORIES (Widow, Senior Citizen, Pregnant Woman, etc.)
  // -------------------------------------------------------------
  if (criteria.specialCategories && criteria.specialCategories.length > 0) {
    const specialFilters = criteria.specialCategories.filter(
      sc => sc !== 'Artisan/Craftsperson' && sc !== 'Street vendor'
    );
    if (specialFilters.length > 0) {
      totalWeight += 10;
      const matchedSpecials = specialFilters.filter(sc =>
        userSpecials.includes(sc) ||
        (sc === 'Senior citizen' && userAge >= 60) ||
        (sc === 'Widow' && userProfile.maritalStatus === 'Widow') ||
        (sc === 'Pregnant woman' && userProfile.isPregnant === true)
      );

      if (matchedSpecials.length > 0) {
        earnedWeight += 10;
        matchedConditions.push(`Special priority matched: ${matchedSpecials.join(', ')}`);
      } else {
        if (specialFilters.includes('Widow') && specialFilters.length === 1 && userProfile.maritalStatus !== 'Widow') {
          hardDisqualified = true;
          unmetConditions.push('Exclusively for Widows / destitute women');
        } else if (specialFilters.includes('Senior citizen') && specialFilters.length === 1 && userAge < 60) {
          hardDisqualified = true;
          unmetConditions.push('Exclusively for Senior Citizens (aged 60+)');
        } else {
          verificationConditions.push(`Preference / affirmative eligibility applies for: ${specialFilters.join(', ')}`);
        }
      }
    }
  }

  // Document verification reminder
  if (scheme.requiredDocuments && scheme.requiredDocuments.length > 0) {
    verificationConditions.push(`Key documents to prepare: ${scheme.requiredDocuments.slice(0, 3).join(', ')}`);
  }

  // -------------------------------------------------------------
  // FINAL SCORE & ELIGIBILITY COMPUTATION
  // -------------------------------------------------------------
  if (totalWeight === 0) totalWeight = 10;
  let matchPercentage = Math.round((earnedWeight / totalWeight) * 100);

  if (hardDisqualified) {
    matchPercentage = Math.min(matchPercentage, 12);
  } else {
    if (matchPercentage > 95) matchPercentage = 95;
    if (matchPercentage < 25) matchPercentage = 25;
  }

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
    hardDisqualified,
    statusLabel: isEligible
      ? 'You may be eligible'
      : (hardDisqualified ? 'Not eligible (Criteria unmet)' : 'Low match based on current criteria'),
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
