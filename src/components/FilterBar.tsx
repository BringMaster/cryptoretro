import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowUpDown, Search, X } from 'lucide-react';

export interface FilterOptions {
  search: string;
  sortBy: 'rank' | 'priceUsd' | 'marketCapUsd' | 'volumeUsd24Hr' | 'changePercent24Hr';
  sortDirection: 'asc' | 'desc';
  minPrice: string;
  maxPrice: string;
  minMarketCap: string;
  maxMarketCap: string;
  pageSize: number;
}

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      sortBy: value as FilterOptions['sortBy']
    });
  };

  const handlePageSizeChange = (value: string) => {
    onFilterChange({
      ...filters,
      pageSize: parseInt(value)
    });
  };

  const toggleSortDirection = () => {
    onFilterChange({
      ...filters,
      sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc'
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    onFilterChange({
      ...filters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: value
    });
  };

  const handleMarketCapChange = (type: 'min' | 'max', value: string) => {
    onFilterChange({
      ...filters,
      [type === 'min' ? 'minMarketCap' : 'maxMarketCap']: value
    });
  };

  return (
    <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white" />
            <Input
              placeholder="Search by name or symbol..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-8"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={filters.sortBy}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="priceUsd">Price</SelectItem>
              <SelectItem value="marketCapUsd">Market Cap</SelectItem>
              <SelectItem value="volumeUsd24Hr">Volume (24h)</SelectItem>
              <SelectItem value="changePercent24Hr">Change (24h)</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="default"
            size="icon"
            onClick={toggleSortDirection}
            className="w-10"
          >
            <ArrowUpDown className={`h-4 w-4 ${filters.sortDirection === 'desc' ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Page Size */}
        <div className="flex gap-2">
          <Select
            value={filters.pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Price Range */}
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min Price ($)"
            value={filters.minPrice}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            className="w-32"
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max Price ($)"
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            className="w-32"
          />
        </div>

        {/* Market Cap Range */}
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min Market Cap ($)"
            value={filters.minMarketCap}
            onChange={(e) => handleMarketCapChange('min', e.target.value)}
            className="w-40"
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max Market Cap ($)"
            value={filters.maxMarketCap}
            onChange={(e) => handleMarketCapChange('max', e.target.value)}
            className="w-40"
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="default"
          onClick={onReset}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
