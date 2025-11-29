
import {
    calculateBerkusValuation,
    calculateScorecardValuation,
    calculateVCValuation,
    calculateRiskFactorValuation,
    calculateCostToDuplicate,
    getSmartDefaults,
    ValuationContext
} from '../lib/valuation/valuationUtils';

const runTest = (name: string, actual: number, expected: number, tolerance: number = 0.01) => {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        console.log(`[PASS] ${name}: Got ${actual}`);
    } else {
        console.error(`[FAIL] ${name}: Expected ${expected}, Got ${actual}`);
    }
};

console.log("Starting Valuation Logic Validation...\n");

// --- 1. Berkus Method ---
const berkusVal = calculateBerkusValuation({
    ideaValue: 500000,
    prototypeValue: 500000,
    teamValue: 500000,
    relationshipsValue: 500000,
    salesValue: 500000
});
runTest("Berkus (Max)", berkusVal, 2500000);

// --- 2. Scorecard Method ---
// Case A: Neutral (All 1.0)
const scorecardNeutral = calculateScorecardValuation({
    marketAverage: 5000000,
    teamScore: 1.0,
    opportunityScore: 1.0,
    productScore: 1.0,
    competitionScore: 1.0,
    marketingScore: 1.0,
    investmentNeedScore: 1.0,
    otherScore: 1.0
});
runTest("Scorecard (Neutral)", scorecardNeutral, 5000000);

// Case B: Strong Team (1.5) with Context
// Context: SaaS (Team weight 0.30)
// Factor Sum = (1.5 * 0.30) + (1.0 * 0.25) + ... 
// Base Sum of weights = 1.0
// Extra lift = 0.5 * 0.30 = 0.15
// Total Factor = 1.15
// Expected = 5M * 1.15 = 5.75M
const contextSaaS: ValuationContext = { sector: 'SaaS', region: 'US_Tier1' };
const scorecardSaaS = calculateScorecardValuation({
    marketAverage: 5000000,
    teamScore: 1.5,
    opportunityScore: 1.0,
    productScore: 1.0,
    competitionScore: 1.0,
    marketingScore: 1.0,
    investmentNeedScore: 1.0,
    otherScore: 1.0
}, contextSaaS);
runTest("Scorecard (SaaS Strong Team)", scorecardSaaS, 5750000);

// --- 3. VC Method ---
// Exit 100M, 10x Multiple -> Terminal 1000M ?? Wait.
// Logic: terminalValue = exitRevenue * exitMultiple
// If Revenue 10M, Multiple 10x -> Terminal 100M.
// ROI 10x. Post = 100M / 10 = 10M.
// Investment 2M. Pre = 8M.
const vcVal = calculateVCValuation({
    exitRevenue: 10000000, // 10M
    exitMultiple: 10,
    requiredROI: 10,
    investmentAmount: 2000000
});
runTest("VC Method (Pre-Money)", vcVal.preMoney, 8000000);
runTest("VC Method (Post-Money)", vcVal.postMoney, 10000000);

// --- 4. Risk Factor Summation ---
// Base 5M. 
// +2 score on Management (+2 * 250k = +500k)
// -1 score on Competition (-1 * 250k = -250k)
// Net +250k. Result 5.25M.
const rfsVal = calculateRiskFactorValuation({
    baseValuation: 5000000,
    riskScores: [2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    adjustmentPerPoint: 250000
});
runTest("Risk Factor Summation", rfsVal, 5250000);

// --- 5. Cost to Duplicate ---
// Labor 100k, IP 50k, Equip 50k = 200k Base.
// Opp Cost 20% (0.2).
// Total = 200k * 1.2 = 240k.
const c2dVal = calculateCostToDuplicate({
    laborCost: 100000,
    ipCost: 50000,
    equipmentCost: 50000,
    opportunityCostPercent: 0.2
});
runTest("Cost to Duplicate", c2dVal, 240000);

console.log("\nValidation Complete.");
