
import { BerkusInputs, ScorecardInputs, VCMethodInputs, ValuationContext, Sector, Region } from '../valuation/valuationUtils';

export interface ValuationControlState {
    context: ValuationContext;
    setContext: (ctx: ValuationContext) => void;
    berkusInputs: BerkusInputs;
    setBerkusInputs: (inputs: BerkusInputs) => void;
    scorecardInputs: ScorecardInputs;
    setScorecardInputs: (inputs: ScorecardInputs) => void;
    vcInputs: VCMethodInputs;
    setVCInputs: (inputs: VCMethodInputs) => void;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    groundingMetadata?: any; // For Google Search citations
}

export type ConversationStep = 'IDLE' | 'ASKING_SECTOR' | 'ASKING_REGION' | 'ASKING_REVENUE' | 'ASKING_TEAM';

export interface ConversationState {
    step: ConversationStep;
}

export interface CopilotResponse {
    text: string;
    nextState: ConversationState;
    groundingMetadata?: any;
    isAsync?: boolean; // Flag to tell UI to wait for API
}

// Helper to parse numbers from text
function extractNumber(text: string): number | null {
    const match = text.toLowerCase().match(/(\d+(\.\d+)?)/);
    if (!match) return null;

    let val = parseFloat(match[0]);
    if (text.toLowerCase().includes('m') || text.toLowerCase().includes('million')) val *= 1000000;
    if (text.toLowerCase().includes('k') || text.toLowerCase().includes('thousand')) val *= 1000;
    return val;
}

// --- NEW: Call the Real AI ---
export async function callGeminiAPI(message: string, valState: ValuationControlState): Promise<{ text: string, groundingMetadata?: any }> {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                context: {
                    sector: valState.context.sector,
                    region: valState.context.region,
                    vcInputs: valState.vcInputs,
                    scorecardInputs: valState.scorecardInputs
                }
            })
        });

        const data = await response.json();
        return { text: data.text, groundingMetadata: data.groundingMetadata };
    } catch (error) {
        return { text: "I couldn't reach the AI server. Please check your connection." };
    }
}

export function processCopilotCommand(
    command: string,
    valState: ValuationControlState,
    convState: ConversationState
): CopilotResponse {
    const lowerCmd = command.toLowerCase();

    // --- STATE MACHINE LOGIC (Guided Interview) ---

    // 1. IDLE STATE
    if (convState.step === 'IDLE') {
        // Triggers for Guided Flow
        if (lowerCmd.includes('pitch') || lowerCmd.includes('evaluate') || (lowerCmd.includes('idea') && lowerCmd.includes('have'))) {
            return {
                text: "That sounds exciting! I'd love to help you evaluate it. First, what **Sector** is the startup in? (e.g., SaaS, AI, Hardware...)",
                nextState: { step: 'ASKING_SECTOR' }
            };
        }

        // Check for Single-Shot Commands (Setters)
        const singleShot = processSingleShotCommand(lowerCmd, valState);
        if (singleShot) return singleShot;

        // *** FALLBACK TO REAL AI ***
        // If it's not a command and not a flow trigger, ask Gemini
        return {
            text: "", // UI will show loading
            nextState: { step: 'IDLE' },
            isAsync: true
        };
    }

    // 2. ASKING_SECTOR
    if (convState.step === 'ASKING_SECTOR') {
        let sector: Sector = 'SaaS';
        let detected = false;

        if (lowerCmd.includes('ai') || lowerCmd.includes('deep') || lowerCmd.includes('tech')) { sector = 'AI/DeepTech'; detected = true; }
        else if (lowerCmd.includes('market')) { sector = 'Marketplace'; detected = true; }
        else if (lowerCmd.includes('hard')) { sector = 'Hardware'; detected = true; }
        else if (lowerCmd.includes('consumer') || lowerCmd.includes('app')) { sector = 'Consumer'; detected = true; }
        else if (lowerCmd.includes('saas') || lowerCmd.includes('software')) { sector = 'SaaS'; detected = true; }

        if (detected) {
            valState.setContext({ ...valState.context, sector });
            return {
                text: `Got it, I've switched to **${sector}** mode. \n\nNext, where are they based? (e.g., US, Europe, Emerging Markets)`,
                nextState: { step: 'ASKING_REGION' }
            };
        } else {
            // If we can't parse it, maybe it's a complex answer? 
            // For now, stick to the script or user can say "skip"
            return {
                text: "I didn't quite catch that sector. Could you say SaaS, AI, Marketplace, Hardware, or Consumer?",
                nextState: { step: 'ASKING_SECTOR' }
            };
        }
    }

    // 3. ASKING_REGION
    if (convState.step === 'ASKING_REGION') {
        let region: Region = 'US_Tier1';
        let detected = false;

        if (lowerCmd.includes('sf') || lowerCmd.includes('nyc') || lowerCmd.includes('tier 1') || lowerCmd.includes('valley')) { region = 'US_Tier1'; detected = true; }
        else if (lowerCmd.includes('us') || lowerCmd.includes('austin') || lowerCmd.includes('miami')) { region = 'US_Tier2'; detected = true; }
        else if (lowerCmd.includes('eu') || lowerCmd.includes('uk') || lowerCmd.includes('london') || lowerCmd.includes('berlin')) { region = 'EU_Tier1'; detected = true; }
        else if (lowerCmd.includes('emerging') || lowerCmd.includes('asia') || lowerCmd.includes('latam')) { region = 'Emerging'; detected = true; }

        if (detected) {
            valState.setContext({ ...valState.context, region });
            return {
                text: `Understood. \n\nNow, let's look at the potential. What is the **Projected Annual Revenue** at exit (e.g., in 5-7 years)?`,
                nextState: { step: 'ASKING_REVENUE' }
            };
        } else {
            // Default to US Tier 1 if unsure, but ask to confirm or move on
            valState.setContext({ ...valState.context, region: 'US_Tier1' });
            return {
                text: "I'll assume US Tier 1 for now. \n\nWhat is the **Projected Annual Revenue** at exit?",
                nextState: { step: 'ASKING_REVENUE' }
            };
        }
    }

    // 4. ASKING_REVENUE
    if (convState.step === 'ASKING_REVENUE') {
        const revenue = extractNumber(lowerCmd);
        if (revenue) {
            valState.setVCInputs({ ...valState.vcInputs, exitRevenue: revenue });
            return {
                text: `Noted $${revenue.toLocaleString()} revenue. \n\nFinally, how strong is the **Management Team**? (Weak, Average, Strong, or All-Star)`,
                nextState: { step: 'ASKING_TEAM' }
            };
        } else {
            return {
                text: "I need a number for the revenue (e.g., '50M' or '10 million').",
                nextState: { step: 'ASKING_REVENUE' }
            };
        }
    }

    // 5. ASKING_TEAM
    if (convState.step === 'ASKING_TEAM') {
        let teamScore = 1.0; // Average
        let berkusTeam = 0;

        if (lowerCmd.includes('all-star') || lowerCmd.includes('amazing') || lowerCmd.includes('best')) {
            teamScore = 1.5;
            berkusTeam = 500000; // Max
        } else if (lowerCmd.includes('strong') || lowerCmd.includes('good')) {
            teamScore = 1.25;
            berkusTeam = 350000;
        } else if (lowerCmd.includes('weak') || lowerCmd.includes('bad')) {
            teamScore = 0.7;
            berkusTeam = 100000;
        }

        // Update both Scorecard and Berkus
        valState.setScorecardInputs({ ...valState.scorecardInputs, teamScore });
        valState.setBerkusInputs({ ...valState.berkusInputs, teamValue: berkusTeam });

        return {
            text: "Great! I've updated the Team scores across the models. \n\nYou can now see the **Triangulated Valuation** in the Summary tab. \n\nFeel free to ask me for **Insights** or **Recommendations** now!",
            nextState: { step: 'IDLE' }
        };
    }

    return { text: "I'm not sure what to do next. Let's start over.", nextState: { step: 'IDLE' } };
}

// --- SINGLE SHOT LOGIC (Fallback) ---
function processSingleShotCommand(lowerCmd: string, state: ValuationControlState): CopilotResponse | null {

    // Global Context
    if (lowerCmd.includes('sector') || lowerCmd.includes('mode')) {
        if (lowerCmd.includes('ai') || lowerCmd.includes('deep tech')) {
            state.setContext({ ...state.context, sector: 'AI/DeepTech' });
            return { text: "I've switched the sector to AI / Deep Tech. All valuation models have been updated with higher tech risk caps and exit multiples.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('saas')) {
            state.setContext({ ...state.context, sector: 'SaaS' });
            return { text: "Switched to SaaS mode. Standard revenue multiples applied.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('marketplace')) {
            state.setContext({ ...state.context, sector: 'Marketplace' });
            return { text: "Switched to Marketplace mode.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('hardware')) {
            state.setContext({ ...state.context, sector: 'Hardware' });
            return { text: "Switched to Hardware mode.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('consumer')) {
            state.setContext({ ...state.context, sector: 'Consumer' });
            return { text: "Switched to Consumer App mode.", nextState: { step: 'IDLE' } };
        }
    }

    if (lowerCmd.includes('region')) {
        if (lowerCmd.includes('tier 1') || lowerCmd.includes('sf') || lowerCmd.includes('nyc')) {
            state.setContext({ ...state.context, region: 'US_Tier1' });
            return { text: "Region set to US Tier 1 (SF/NYC).", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('eu') || lowerCmd.includes('europe')) {
            state.setContext({ ...state.context, region: 'EU_Tier1' });
            return { text: "Region set to EU Tier 1.", nextState: { step: 'IDLE' } };
        }
    }

    // Berkus Commands
    if (lowerCmd.includes('berkus') || lowerCmd.includes('idea') || lowerCmd.includes('prototype') || lowerCmd.includes('team')) {
        if (lowerCmd.includes('max') && lowerCmd.includes('idea')) {
            state.setBerkusInputs({ ...state.berkusInputs, ideaValue: 500000 }); // Assuming standard cap, logic could be smarter
            return { text: "I've maximized the 'Sound Idea' value in the Berkus method.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('max') && lowerCmd.includes('prototype')) {
            state.setBerkusInputs({ ...state.berkusInputs, prototypeValue: 500000 });
            return { text: "Prototype value set to max.", nextState: { step: 'IDLE' } };
        }
        if (lowerCmd.includes('max') && lowerCmd.includes('team')) {
            state.setBerkusInputs({ ...state.berkusInputs, teamValue: 500000 });
            return { text: "Management Team value set to max.", nextState: { step: 'IDLE' } };
        }
    }

    // VC Method Commands
    if (lowerCmd.includes('revenue') || lowerCmd.includes('exit')) {
        const val = extractNumber(lowerCmd);
        if (val) {
            state.setVCInputs({ ...state.vcInputs, exitRevenue: val });
            return { text: `Updated projected exit revenue to $${val.toLocaleString()}.`, nextState: { step: 'IDLE' } };
        }
    }

    if (lowerCmd.includes('investment') || lowerCmd.includes('raising')) {
        const val = extractNumber(lowerCmd);
        if (val) {
            state.setVCInputs({ ...state.vcInputs, investmentAmount: val });
            return { text: `Updated investment amount to $${val.toLocaleString()}.`, nextState: { step: 'IDLE' } };
        }
    }

    // General/Fallback
    if (lowerCmd.includes('help') || lowerCmd.includes('what can you do')) {
        return {
            text: "I can control the valuation engine for you. Try saying:\n- 'Switch to AI sector'\n- 'Set exit revenue to 50M'\n- 'Maximize the team score'\n- 'We are raising 2M'",
            nextState: { step: 'IDLE' }
        };
    }

    // If no command matched, return null so we can fall back to Gemini
    return null;
}
