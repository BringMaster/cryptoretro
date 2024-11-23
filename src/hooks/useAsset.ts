import { useQuery } from '@tanstack/react-query';
import { getAssets } from '@/lib/api';

export const useAsset = (assetId: string) => {
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const assets = await getAssets();
      const asset = assets.find(a => a.id === assetId);
      if (!asset) throw new Error('Asset not found');
      return asset;
    },
    enabled: !!assetId,
  });
};
