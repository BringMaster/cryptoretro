import React, { useState, useEffect, useRef, memo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  ChartOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getAssetHistory } from '@/lib/api';
import { Button } from '@/components/ui/button';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface TimeRange {
  label: string;
  days: number;
  interval: string;
}

const TIME_RANGES: TimeRange[] = [
  { label: '24H', days: 1, interval: 'm5' },
  { label: '7D', days: 7, interval: 'h1' },
  { label: '30D', days: 30, interval: 'h2' },
  { label: '90D', days: 90, interval: 'h6' },
  { label: '1Y', days: 365, interval: 'd1' },
  { label: 'ALL', days: 2000, interval: 'd1' },
];

interface AdvancedChartProps {
  assetId: string;
  assetName: string;
  changePercent24Hr: number;
}

export default memo(({ assetId, assetName, changePercent24Hr }: AdvancedChartProps) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(TIME_RANGES[0]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const end = Date.now();
        const start = end - (selectedRange.days * 24 * 60 * 60 * 1000);
        const history = await getAssetHistory(assetId, selectedRange.interval, start, end);
        
        if (!history || history.length === 0) {
          setError('No historical data available for this time range');
          setChartData(null);
          return;
        }

        const data = {
          labels: history.map((point: any) => new Date(point.time)),
          datasets: [
            {
              label: `${assetName} Price`,
              data: history.map((point: any) => parseFloat(point.priceUsd)),
              borderColor: changePercent24Hr >= 0 ? '#10b981' : '#ef4444',
              backgroundColor: changePercent24Hr >= 0 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
            },
          ],
        };
        setChartData(data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [assetId, selectedRange, assetName, changePercent24Hr]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        // @ts-ignore - chartRef.current.destroy exists on Chart instance
        chartRef.current.destroy();
      }
    };
  }, []);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 4,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            return ` ${formatPrice(context.parsed.y)}`;
          },
          title: (tooltipItems) => {
            return new Date(tooltipItems[0].parsed.x).toLocaleString();
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: selectedRange.days <= 1 ? 'hour' : 'day',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM d',
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#666',
          maxRotation: 0,
          font: {
            size: 12,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: '#2a2a2a',
          drawBorder: false,
        } as any,
        border: {
          display: false,
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
          },
          padding: 8,
          callback: (value) => typeof value === 'number' ? formatPrice(value) : formatPrice(Number(value)),
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center">
        <div className="animate-pulse text-purple-500">Loading chart data...</div>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center">
        <div className="text-red-500">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TIME_RANGES.map((range) => (
          <Button
            key={range.label}
            variant={selectedRange.label === range.label ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRange(range)}
            className={selectedRange.label === range.label 
              ? "bg-purple-600 hover:bg-purple-700 text-white" 
              : "border-[#2a2a2a] hover:bg-[#222222] text-gray-300"
            }
          >
            {range.label}
          </Button>
        ))}
      </div>
      
      <div className="h-[500px] relative">
        <Line
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
});
