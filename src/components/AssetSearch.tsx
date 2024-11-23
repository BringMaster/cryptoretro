import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface AssetSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  query: string;
  priceRange: [number, number];
  changeRange: [number, number];
  sortBy: string;
  marketCapMin?: number;
  volumeMin?: number;
}

const defaultFilters: SearchFilters = {
  query: '',
  priceRange: [0, 100000],
  changeRange: [-100, 100],
  sortBy: 'rank',
};

const sortOptions = [
  { value: 'rank', label: 'Rank' },
  { value: 'priceDesc', label: 'Price (High to Low)' },
  { value: 'priceAsc', label: 'Price (Low to High)' },
  { value: 'changeDesc', label: 'Change (High to Low)' },
  { value: 'changeAsc', label: 'Change (Low to High)' },
  { value: 'volumeDesc', label: 'Volume (High to Low)' },
  { value: 'marketCapDesc', label: 'Market Cap (High to Low)' },
];

export const AssetSearch = ({ onSearch, onReset }: AssetSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch({ ...filters, query: searchQuery });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSearchQuery('');
    onReset();
  };

  const handlePriceRangeChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
  };

  const handleChangeRangeChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, changeRange: [value[0], value[1]] }));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 cyberpunk-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle>Advanced Filters</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Sort by</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price Range (USD)</Label>
                <div className="pt-6">
                  <Slider
                    defaultValue={[0, 100000]}
                    max={100000}
                    step={100}
                    value={[filters.priceRange[0], filters.priceRange[1]]}
                    onValueChange={handlePriceRangeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>${filters.priceRange[0].toLocaleString()}</span>
                    <span>${filters.priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>24h Change Range (%)</Label>
                <div className="pt-6">
                  <Slider
                    defaultValue={[-100, 100]}
                    min={-100}
                    max={100}
                    step={1}
                    value={[filters.changeRange[0], filters.changeRange[1]]}
                    onValueChange={handleChangeRangeChange}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{filters.changeRange[0]}%</span>
                    <span>{filters.changeRange[1]}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Market Cap (USD)</Label>
                <Input
                  type="number"
                  value={filters.marketCapMin || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    marketCapMin: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Enter minimum market cap"
                  className="cyberpunk-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Minimum 24h Volume (USD)</Label>
                <Input
                  type="number"
                  value={filters.volumeMin || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    volumeMin: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Enter minimum volume"
                  className="cyberpunk-input"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <X className="h-4 w-4" />
                Reset
              </Button>
              <Button onClick={() => {
                handleSearch();
                setIsOpen(false);
              }} className="gap-2">
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
