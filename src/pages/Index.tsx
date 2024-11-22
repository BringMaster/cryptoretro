import { useQuery } from '@tanstack/react-query';
import { getTopAssets } from '@/lib/api';
import AssetCard from '@/components/AssetCard';

const Index = () => {
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: getTopAssets,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">Loading Assets...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="brutalist-card h-48 bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="brutalist-card p-8 bg-red-50">
          <h1 className="text-4xl font-bold mb-4">ERROR</h1>
          <p className="text-xl">Failed to load crypto assets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Top Crypto Assets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets?.map((asset: any) => (
          <AssetCard key={asset.id} {...asset} />
        ))}
      </div>
    </div>
  );
};

export default Index;