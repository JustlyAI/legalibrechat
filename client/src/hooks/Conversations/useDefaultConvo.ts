import { useGetEndpointsQuery, useGetModelsQuery } from 'legallibrechat-data-provider/react-query';
import type {
  TConversation,
  TPreset,
  TEndpointsConfig,
  TModelsConfig,
} from 'legallibrechat-data-provider';
import { getDefaultEndpoint, buildDefaultConvo } from '~/utils';

type TDefaultConvo = { conversation: Partial<TConversation>; preset?: Partial<TPreset> | null };

const useDefaultConvo = () => {
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();
  const { data: modelsConfig = {} as TModelsConfig } = useGetModelsQuery();

  const getDefaultConversation = ({ conversation, preset }: TDefaultConvo) => {
    const endpoint = getDefaultEndpoint({
      convoSetup: preset as TPreset,
      endpointsConfig,
    });

    const models = modelsConfig[endpoint] || [];

    return buildDefaultConvo({
      conversation: conversation as TConversation,
      endpoint,
      lastConversationSetup: preset as TConversation,
      models,
    });
  };

  return getDefaultConversation;
};

export default useDefaultConvo;
