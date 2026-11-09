export interface AIModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface RawOpenRouterModel {
  id: string;
  name?: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

interface OpenRouterResponse {
  data: RawOpenRouterModel[];
}

export const fetchFreeModels = async (): Promise<AIModel[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }
    const data = (await response.json()) as OpenRouterResponse;
    if (!data || !Array.isArray(data.data)) {
      return [];
    }
    return data.data
      .filter((model): model is RawOpenRouterModel => Boolean(model && typeof model.id === 'string' && model.id.includes(':free')))
      .map((model) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description || '',
        pricing: model.pricing || { prompt: '0', completion: '0' },
      }));
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return [];
  }
};
