import React, { useEffect, useState, useRef } from 'react';
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
  ChartOptions
} from 'chart.js';
import { getAssetHistory } from '@/lib/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MiniChartProps {
  assetId: string;
  changePercent24Hr: number;
}

// Keep track of ongoing requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<any>>();

const MiniChart: React.FC<MiniChartProps> = ({ assetId, changePercent24Hr }) => {
  const [chartData, setChartData] = useState<any>(null);
  const requestTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchChartData = async () => {
      // Check if there's already a pending request for this asset
      if (pendingRequests.has(assetId)) {
        const history = await pendingRequests.get(assetId);
        return history;
      }

      // Create a new request and store it
      const request = getAssetHistory(assetId, 'h1');
      pendingRequests.set(assetId, request);

      try {
        const history = await request;
        if (history && history.length > 0) {
          const data = {
            labels: history.map(() => ''), // Empty labels for cleaner look
            datasets: [
              {
                data: history.map((point: any) => parseFloat(point.priceUsd)),
                borderColor: changePercent24Hr >= 0 ? '#10b981' : '#ef4444',
                borderWidth: 1.5,
                tension: 0.4,
                pointRadius: 0,
                fill: false,
              },
            ],
          };
          setChartData(data);
        }
      } finally {
        // Remove the request after it's done
        pendingRequests.delete(assetId);
      }
    };

    // Clear any existing timeout
    if (requestTimeoutRef.current) {
      clearTimeout(requestTimeoutRef.current);
    }

    // Add a small delay before making the request to prevent too many simultaneous calls
    requestTimeoutRef.current = setTimeout(() => {
      fetchChartData();
    }, Math.random() * 1000); // Random delay between 0-1000ms to stagger requests

    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, [assetId, changePercent24Hr]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  if (!chartData) {
    return <div className="w-[100px] h-[40px] bg-[#1a1a1a] animate-pulse rounded" />;
  }

  return (
    <div className="w-[100px] h-[40px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MiniChart;
