export const VALUATION_DEFAULTS = {
    marketMedian: 10000000,
    riskAdjustmentStep: 250000,
};

export type Sector = 'SaaS' | 'AI/DeepTech' | 'Marketplace' | 'Hardware' | 'Consumer';
export type Region = 'US_Tier1' | 'US_Tier2' | 'EU_Tier1' | 'Emerging';

export interface ValuationContext {
    sector: Sector;
    region: Region;
}

export const getSmartDefaults = (context: ValuationContext) => {
    const isAI = context.sector === 'AI/DeepTech';
    const isTier1 = context.region === 'US_Tier1';

    return {
        // Berkus: AI gets higher tech cap, Tier 1 gets higher base
        berkus: {
            ideaCap: isAI ? 2000000 : 1500000,
            techCap: isAI ? 3000000 : 2000000, // AI tech is harder to build
            teamCap: isTier1 ? 3500000 : 3000000, // Tier 1 talent costs more
        },
        // VC Method: AI gets higher multiples
        vc: {
            exitMultiple: isAI ? 25 : (context.sector === 'SaaS' ? 12 : 8),
            roiTarget: isAI ? 30 : 20, // Higher risk, higher return
        },
        // Scorecard: Weights shift by sector
        scorecard: {
            weights: {
                team: 0.30,
                opportunity: isAI ? 0.30 : 0.25, // AI opportunity is massive
                product: isAI ? 0.20 : 0.15, // Tech matters more in AI
                competition: 0.10,
                marketing: context.sector === 'Consumer' ? 0.20 : 0.10,
                investmentNeed: 0.05,
                other: 0.05,
            }
        }
    };
};

// --- Berkus Method ---
export interface BerkusInputs {
    ideaValue: number;
    prototypeValue: number;
    teamValue: number;
    relationshipsValue: number;
    salesValue: number;
}

export const calculateBerkusValuation = (inputs: BerkusInputs): number => {
    return (
        inputs.ideaValue +
        inputs.prototypeValue +
        inputs.teamValue +
        inputs.relationshipsValue +
        inputs.salesValue
    );
};

// --- Scorecard Method ---
export interface ScorecardInputs {
    marketAverage: number;
    teamScore: number; // Percentage (e.g., 1.5 for 150%)
    opportunityScore: number;
    productScore: number;
    competitionScore: number;
    marketingScore: number;
    investmentNeedScore: number;
    otherScore: number;
}

export const calculateScorecardValuation = (inputs: ScorecardInputs, context?: ValuationContext): number => {
    const defaults = context ? getSmartDefaults(context).scorecard.weights : {
        team: 0.30,
        opportunity: 0.25,
        product: 0.15,
        competition: 0.10,
        marketing: 0.10,
        investmentNeed: 0.05,
        other: 0.05,
    };

    // Normalize weights if they don't sum to 1 (simple check)
    const totalWeight = Object.values(defaults).reduce((a, b) => a + b, 0);

    const factorSum =
        (inputs.teamScore * defaults.team) +
        (inputs.opportunityScore * defaults.opportunity) +
        (inputs.productScore * defaults.product) +
        (inputs.competitionScore * defaults.competition) +
        (inputs.marketingScore * defaults.marketing) +
        (inputs.investmentNeedScore * defaults.investmentNeed) +
        (inputs.otherScore * defaults.other);

    // Adjust for weight normalization
    return inputs.marketAverage * (factorSum / totalWeight);
};

// --- Risk Factor Summation ---
export interface RiskFactorInputs {
    baseValuation: number;
    riskScores: number[]; // Array of 12 scores from -2 to +2
    adjustmentPerPoint: number;
}

export const calculateRiskFactorValuation = (inputs: RiskFactorInputs): number => {
    const totalScore = inputs.riskScores.reduce((a, b) => a + b, 0);
    const adjustment = totalScore * inputs.adjustmentPerPoint;
    return inputs.baseValuation + adjustment;
};

export const RISK_CATEGORIES = [
    "Management Risk",
    "Stage of Business",
    "Legislation/Political Risk",
    "Manufacturing Risk",
    "Sales and Marketing Risk",
    "Funding/Capital Raising Risk",
    "Competition Risk",
    "Technology Risk",
    "Litigation Risk",
    "International Risk",
    "Reputation Risk",
    "Exit Value Risk",
];

// --- VC Method ---
export interface VCMethodInputs {
    exitRevenue: number;
    exitMultiple: number;
    requiredROI: number;
    investmentAmount: number;
}

export const calculateVCValuation = (inputs: VCMethodInputs): { preMoney: number; postMoney: number; terminalValue: number } => {
    const terminalValue = inputs.exitRevenue * inputs.exitMultiple;
    const postMoney = terminalValue / inputs.requiredROI;
    const preMoney = postMoney - inputs.investmentAmount;
    return { preMoney, postMoney, terminalValue };
};

export const generateSensitivityAnalysis = (inputs: VCMethodInputs) => {
    const multiples = [inputs.exitMultiple * 0.8, inputs.exitMultiple, inputs.exitMultiple * 1.2];
    const rois = [inputs.requiredROI * 0.8, inputs.requiredROI, inputs.requiredROI * 1.2];

    return rois.map(roi => {
        return multiples.map(mult => {
            const term = inputs.exitRevenue * mult;
            const post = term / roi;
            return post - inputs.investmentAmount;
        });
    });
};

// --- Cost-to-Duplicate ---
export interface CostToDuplicateInputs {
    laborCost: number;
    ipCost: number;
    equipmentCost: number;
    opportunityCostPercent: number; // e.g., 0.20 for 20%
}

export const calculateCostToDuplicate = (inputs: CostToDuplicateInputs): number => {
    const baseCost = inputs.laborCost + inputs.ipCost + inputs.equipmentCost;
    return baseCost * (1 + inputs.opportunityCostPercent);
};
