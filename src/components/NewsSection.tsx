import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal } from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsSectionProps {
  news: NewsArticle[];
}

const NewsSection = ({ news }: NewsSectionProps) => {
  if (!news.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Terminal className="w-6 h-6 text-secondary" />
        Latest Crypto News
      </h2>
      <div className="space-y-4">
        {news.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-transform hover:-translate-y-1"
          >
            <Card className="cyberpunk-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {article.description}
                </p>
                <p className="text-xs text-secondary">
                  {new Date(article.publishedAt).toLocaleDateString()} • {article.source.name}
                </p>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};

export default NewsSection;