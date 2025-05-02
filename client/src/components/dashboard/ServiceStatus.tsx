import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface Service {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  icon: string;
  lastCheck: string;
}

interface ServiceStatusProps {
  services?: Service[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function ServiceStatus({
  services,
  isLoading = false,
  onRefresh
}: ServiceStatusProps) {
  // Fetch service status if not provided as prop
  const { data, refetch, isLoading: isLoadingQuery } = useQuery({
    queryKey: ['/api/services/status'],
    enabled: !services && !isLoading,
  });

  const loading = isLoading || isLoadingQuery;
  const serviceData = services || data || [];

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refetch();
    }
  };

  const getStatusBadge = (status: Service['status']) => {
    switch (status) {
      case 'operational':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-green-200 text-green-800">Operational</span>;
      case 'degraded':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-200 text-yellow-800">Degraded</span>;
      case 'down':
        return <span className="px-2 py-0.5 rounded-full text-xs bg-red-200 text-red-800">Down</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-800">Unknown</span>;
    }
  };

  const getServiceIcon = (service: Service) => {
    if (service.name.includes('Evolution') || service.name.includes('WhatsApp')) {
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </div>
      );
    } else if (service.name.includes('N8N')) {
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.1 18.2L13.1 2c-.7-1.3-2.6-1.3-3.3 0L.9 18.2c-.7 1.3.2 2.8 1.6 2.8h17.9c1.5 0 2.4-1.5 1.7-2.8zM12 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm1-5c0 .6-.4 1-1 1s-1-.4-1-1V9c0-.6.4-1 1-1s1 .4 1 1v5z"/>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <Card className="bg-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">External Service Status</h2>
        <button
          onClick={handleRefresh}
          className="text-sm text-primary-400 hover:text-primary-300 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-slate-750 rounded-md animate-pulse" />
          <div className="h-20 bg-slate-750 rounded-md animate-pulse" />
        </div>
      ) : serviceData.length === 0 ? (
        <div className="text-center py-6 text-slate-400">
          No external services configured
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceData.map((service) => (
            <div key={service.id} className="flex items-center p-3 bg-slate-750 rounded-md border border-slate-700">
              {getServiceIcon(service)}
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">{service.name}</h3>
                  {getStatusBadge(service.status)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Last check: {service.lastCheck}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
