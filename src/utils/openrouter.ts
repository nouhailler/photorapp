
export interface AIModel {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const fetchFreeModels = async (): Promise<AIModel[]> => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    return data.data
      .filter((model: any) => model.id.includes(':free'))
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        pricing: model.pricing
      }));
  } catch (error) {
    console.error('Error fetching OpenRouter models:', error);
    return [];
  }
};
