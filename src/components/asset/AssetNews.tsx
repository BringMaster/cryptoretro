import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface AssetNewsProps {
  news: NewsArticle[];
  isLoading: boolean;
  assetName: string;
}

const AssetNews = ({ news, isLoading, assetName }: AssetNewsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return <p className="text-gray-500">No news available for {assetName}</p>;
  }

  return (
    <div className="space-y-4">
      {news.map((article, index) => (
        <Card key={index} className="border-2 border-black hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {article.title}
              </a>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">{article.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(article.publishedAt).toLocaleDateString()} • {article.source.name}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AssetNews;