import { GoogleGenAI } from "@google/genai";
import { MatchAnalysis, GroundingSource } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzeMatch = async (teamA: string, teamB: string): Promise<{ analysis: MatchAnalysis; sources: GroundingSource[]; }> => {
    const prompt = `
    En tant qu'expert analyste de paris sportifs, analyse en profondeur le prochain match entre ${teamA} et ${teamB}.
    Utilise tes connaissances et les informations du web pour fournir une analyse complète.
    Base-toi sur les statistiques récentes des équipes, leur forme actuelle, les confrontations directes, les joueurs clés, et les tactiques probables.
    Ne mentionne pas que tu es une IA. Agis comme si tu avais accès à des bases de données comme Sofascore.
    
    Fournis des prédictions pour les statistiques suivantes :
    1. Score exact
    2. Total de buts (ex: Plus de 2.5)
    3. Total de corners (ex: Moins de 10.5)
    4. Total de cartons (ex: Plus de 3.5)
    5. Total de touches (ex: Entre 35 et 45)
    
    Identifie également l'option de pari la plus sûre (le "banker bet") pour ce match, avec une brève justification (ex: "Victoire de ${teamA} - Ils sont invaincus à domicile en 10 matchs.").

    Termine ta réponse en incluant un bloc de code JSON contenant les prédictions. Le bloc JSON doit être clairement délimité et avoir la structure suivante, sans texte supplémentaire à l'intérieur du bloc :
    {
      "predictedScore": "string",
      "totalGoals": "string",
      "totalCorners": "string",
      "totalCards": "string",
      "totalThrowIns": "string",
      "confidence": "string (Élevée, Moyenne, ou Faible)",
      "summary": "Un bref résumé de l'analyse en 2-3 phrases expliquant le raisonnement.",
      "bankerBet": "L'option de pari la plus sûre avec sa justification."
    }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        let rawText = response.text.trim();
        
        // Find the start and end of the JSON object to strip markdown fences
        const startIndex = rawText.indexOf('{');
        const endIndex = rawText.lastIndexOf('}');

        if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
            console.error("Invalid response from AI, no JSON found:", rawText);
            throw new Error("Réponse invalide de l'IA ne contenant pas de JSON.");
        }
        
        const jsonText = rawText.substring(startIndex, endIndex + 1);
        const analysisResult: MatchAnalysis = JSON.parse(jsonText);

        const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) ?? [];
        
        return { analysis: analysisResult, sources };

    } catch (error) {
        console.error("Error calling Gemini API or parsing response:", error);
        if (error instanceof SyntaxError) {
             throw new Error("L'IA a retourné une réponse malformée. Veuillez réessayer.");
        }
        if (error instanceof Error && error.message.startsWith("Réponse invalide")) {
            throw error;
        }
        throw new Error("L'analyse du match a échoué. Veuillez réessayer.");
    }
};