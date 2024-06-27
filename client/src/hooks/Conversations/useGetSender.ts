import { useCallback } from 'react';
import { getResponseSender } from 'legallibrechat-data-provider';
import { useGetEndpointsQuery } from 'legallibrechat-data-provider/react-query';
import type { TEndpointOption, TEndpointsConfig } from 'legallibrechat-data-provider';

export default function useGetSender() {
  const { data: endpointsConfig = {} as TEndpointsConfig } = useGetEndpointsQuery();
  return useCallback(
    (endpointOption: TEndpointOption) => {
      const { modelDisplayLabel } = endpointsConfig?.[endpointOption.endpoint ?? ''] ?? {};
      return getResponseSender({ ...endpointOption, modelDisplayLabel });
    },
    [endpointsConfig],
  );
}
