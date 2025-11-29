// AI Matching Service - Tribu Impulsa
// Usa Azure OpenAI (GPT-5.1) para matching inteligente de emprendedores

import { getAzureCredentials } from './productionInit';

// ============================================
// CONFIGURACIÓN AZURE OPENAI (desde Firestore)
// ============================================

interface AzureConfig {
  endpoint: string;
  key: string;
}

// Cache local para evitar muchas lecturas
let azureConfigCache: AzureConfig | null = null;

const getAzureConfig = async (): Promise<AzureConfig> => {
  // Usar cache si existe
  if (azureConfigCache) {
    return azureConfigCache;
  }

  // Obtener de Firestore (configurado automáticamente en producción)
  const credentials = await getAzureCredentials();
  
  if (credentials) {
    azureConfigCache = {
      endpoint: credentials.endpoint,
      key: credentials.apiKey
    };
    return azureConfigCache;
  }
  
  return { endpoint: '', key: '' };
};

export const isAzureConfigured = async (): Promise<boolean> => {
  const config = await getAzureConfig();
  return !!(config.endpoint && config.key);
};

// ============================================
// TIPOS
// ============================================

interface UserProfile {
  id: string;
  name: string;
  companyName: string;
  category: string;
  affinity: string;
  bio?: string;
  businessDescription?: string;
  city: string;
}

interface MatchResult {
  userId: string;
  score: number;
  reason: string;
  synergies: string[];
}

interface AIMatchingResponse {
  matches: MatchResult[];
  insights: string;
  processingTime: number;
}

// ============================================
// PROMPTS
// ============================================

const SYSTEM_PROMPT = `Eres un experto en networking empresarial y matchmaking de emprendedores.
Tu trabajo es analizar perfiles de negocios y encontrar las mejores conexiones para cross-promotion.

REGLAS IMPORTANTES:
1. NUNCA emparejar competidores directos (mismo rubro exacto)
2. Priorizar sinergias complementarias (ej: fotógrafo + tienda de productos)
3. Considerar ubicación geográfica para colaboraciones locales
4. Buscar potencial de colaboración mutua, no solo beneficio unilateral
5. Diversificar los matches para maximizar exposición a diferentes audiencias

FORMATO DE RESPUESTA (JSON):
{
  "matches": [
    {
      "userId": "id_del_usuario",
      "score": 85,
      "reason": "Explicación breve de por qué es buen match",
      "synergies": ["sinergia 1", "sinergia 2"]
    }
  ],
  "insights": "Resumen general de la estrategia de matching"
}`;

// ============================================
// FUNCIONES
// ============================================

/**
 * Llama a Azure OpenAI para obtener matches inteligentes
 */
export async function getAIMatches(
  targetUser: UserProfile,
  candidateUsers: UserProfile[],
  matchCount: number = 10
): Promise<AIMatchingResponse> {
  const startTime = Date.now();

  try {
    const userPrompt = `
USUARIO A EMPAREJAR:
- Nombre: ${targetUser.name}
- Empresa: ${targetUser.companyName}
- Categoría: ${targetUser.category}
- Afinidad: ${targetUser.affinity}
- Bio: ${targetUser.bio || 'No disponible'}
- Negocio: ${targetUser.businessDescription || 'No disponible'}
- Ciudad: ${targetUser.city}

CANDIDATOS DISPONIBLES:
${candidateUsers.map((u, i) => `
${i + 1}. ID: ${u.id}
   Empresa: ${u.companyName}
   Categoría: ${u.category}
   Afinidad: ${u.affinity}
   Bio: ${u.bio || 'No disponible'}
   Ciudad: ${u.city}
`).join('\n')}

TAREA: Selecciona los ${matchCount} mejores matches para ${targetUser.companyName}.
Devuelve SOLO JSON válido, sin markdown ni texto adicional.
`;

    const config = await getAzureConfig();
    if (!config.endpoint || !config.key) {
      throw new Error('Azure OpenAI no configurado. Usa configureAzureAI()');
    }
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.key
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Azure OpenAI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parsear respuesta JSON
    const parsed = JSON.parse(aiResponse);

    return {
      matches: parsed.matches || [],
      insights: parsed.insights || '',
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error en AI Matching:', error);
    
    // Fallback: matching básico sin AI
    return {
      matches: candidateUsers.slice(0, matchCount).map(u => ({
        userId: u.id,
        score: 50,
        reason: 'Match básico (AI no disponible)',
        synergies: []
      })),
      insights: 'Usando matching básico por error en AI',
      processingTime: Date.now() - startTime
    };
  }
}

/**
 * Genera asignaciones 10+10 para un usuario usando AI
 */
export async function generateAITribeAssignments(
  targetUser: UserProfile,
  allUsers: UserProfile[]
): Promise<{ toShare: string[]; shareWithMe: string[]; reasons: Record<string, string> }> {
  
  // Filtrar el usuario actual
  const candidates = allUsers.filter(u => u.id !== targetUser.id);
  
  // Obtener 20 mejores matches
  const result = await getAIMatches(targetUser, candidates, 20);
  
  // Dividir en 10+10
  const toShare = result.matches.slice(0, 10).map(m => m.userId);
  const shareWithMe = result.matches.slice(10, 20).map(m => m.userId);
  
  // Guardar razones para mostrar en UI
  const reasons: Record<string, string> = {};
  result.matches.forEach(m => {
    reasons[m.userId] = m.reason;
  });
  
  console.log(`🤖 AI Matching completado para ${targetUser.companyName}:`, {
    toShare: toShare.length,
    shareWithMe: shareWithMe.length,
    processingTime: `${result.processingTime}ms`
  });
  
  return { toShare, shareWithMe, reasons };
}

/**
 * Analiza la compatibilidad entre dos usuarios
 */
export async function analyzeCompatibility(
  user1: UserProfile,
  user2: UserProfile
): Promise<{ score: number; analysis: string; opportunities: string[] } | null> {
  
  try {
    // Verificar configuración primero
    const config = await getAzureConfig();
    if (!config.endpoint || !config.key) {
      console.log('Azure OpenAI no configurado - el caller debe usar fallback local');
      return null;
    }

    const prompt = `
Analiza la compatibilidad para cross-promotion entre estos dos negocios:

NEGOCIO 1:
- ${user1.companyName} (${user1.category})
- ${user1.bio || user1.businessDescription || 'Sin descripción'}

NEGOCIO 2:
- ${user2.companyName} (${user2.category})
- ${user2.bio || user2.businessDescription || 'Sin descripción'}

Responde en JSON:
{
  "score": 0-100,
  "analysis": "Análisis breve de compatibilidad",
  "opportunities": ["oportunidad 1", "oportunidad 2", "oportunidad 3"]
}
`;
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.key
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Eres un experto en networking empresarial. Responde SOLO en JSON válido.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    return JSON.parse(aiResponse);

  } catch (error) {
    console.error('Error analizando compatibilidad:', error);
    return {
      score: 50,
      analysis: 'Análisis no disponible',
      opportunities: []
    };
  }
}

/**
 * Genera sugerencias de contenido para compartir
 */
export async function generateShareSuggestions(
  sharer: UserProfile,
  target: UserProfile
): Promise<string[]> {
  
  try {
    const prompt = `
Genera 3 ideas creativas de contenido que ${sharer.companyName} (${sharer.category}) podría compartir para promocionar a ${target.companyName} (${target.category}).

Responde en JSON:
{
  "suggestions": [
    "Idea 1 con detalle específico",
    "Idea 2 con detalle específico",
    "Idea 3 con detalle específico"
  ]
}
`;

    const config = await getAzureConfig();
    if (!config.endpoint || !config.key) {
      throw new Error('Azure OpenAI no configurado. Usa configureAzureAI()');
    }
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.key
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Eres un experto en marketing de redes sociales. Responde SOLO en JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(aiResponse);
    
    return parsed.suggestions || [];

  } catch (error) {
    console.error('Error generando sugerencias:', error);
    return [
      'Comparte una historia mencionando su negocio',
      'Publica una foto de sus productos/servicios',
      'Haz un post colaborativo juntos'
    ];
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Verifica si la API de Azure OpenAI está disponible
 */
export async function checkAIAvailability(): Promise<boolean> {
  try {
    const config = await getAzureConfig();
    if (!config.endpoint || !config.key) {
      throw new Error('Azure OpenAI no configurado. Usa configureAzureAI()');
    }
    
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.key
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 5
      })
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Estima el costo de una operación de matching
 * GPT-4 pricing: ~$0.03/1K input tokens, ~$0.06/1K output tokens
 */
export function estimateMatchingCost(userCount: number): number {
  // Aproximadamente 500 tokens por usuario en prompt
  // 200 tokens de respuesta por match
  const inputTokens = userCount * 500;
  const outputTokens = 20 * 200; // 20 matches, 200 tokens cada uno
  
  const inputCost = (inputTokens / 1000) * 0.03;
  const outputCost = (outputTokens / 1000) * 0.06;
  
  return inputCost + outputCost;
}

export default {
  getAIMatches,
  generateAITribeAssignments,
  analyzeCompatibility,
  generateShareSuggestions,
  checkAIAvailability,
  estimateMatchingCost
};
