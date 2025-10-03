import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface RequestMetric {
  requestId: string;
  functionName: string;
  startTime: number;
  duration?: number;
  tokenCount?: number;
  cost?: number;
  status: string;
  error?: string;
}

interface UserActivity {
  userId: string;
  requestCount: number;
  hourlyRequests: number;
  dailyCost: number;
  exportCount: number;
  lastRequest: number | null;
  lastExport: number | null;
}

interface AnomalyMetrics {
  userId: string;
  requestCount: number;
  hourlyRequests: number;
  dailyCost: number;
  exportCount: number;
  failedAuthAttempts: number;
  concurrentSessions: number;
  lastActivity: number | null;
}

const ObservabilityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'activity' | 'anomalies'>('requests');
  
  // Queries
  const requestMetrics = useQuery(api.observability.getRequestMetrics, { limit: 50 });
  const userActivity = useQuery(api.observability.getUserActivity);
  const anomalyMetrics = useQuery(api.anomalyDetection.getUserAnomalyMetrics);
  const systemMetrics = useQuery(api.observability.getSystemMetrics);
  
  // Mutations
  const cleanupMetrics = useMutation(api.observability.cleanupOldMetrics);
  const resetAnomalyMetrics = useMutation(api.anomalyDetection.resetUserAnomalyMetrics);

  const handleCleanup = async () => {
    try {
      await cleanupMetrics();
      console.log('Metrics cleaned up successfully');
    } catch (error) {
      console.error('Failed to cleanup metrics:', error);
    }
  };

  const handleResetAnomalies = async () => {
    try {
      await resetAnomalyMetrics();
      console.log('Anomaly metrics reset successfully');
    } catch (error) {
      console.error('Failed to reset anomaly metrics:', error);
    }
  };

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    return `${duration}ms`;
  };

  const formatCost = (cost?: number) => {
    if (!cost) return '$0.00';
    return `$${cost.toFixed(2)}`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Observability Dashboard</h1>
        <p className="text-gray-600">Monitor system performance, user activity, and security anomalies</p>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Requests</h3>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalRequests}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-gray-900">{systemMetrics.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCost(systemMetrics.totalCost)}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'requests', label: 'Request Metrics' },
            { id: 'activity', label: 'User Activity' },
            { id: 'anomalies', label: 'Anomaly Detection' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Request Metrics Tab */}
      {activeTab === 'requests' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Request Metrics</h2>
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Cleanup Old Metrics
            </button>
          </div>
          
          {requestMetrics && requestMetrics.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {requestMetrics.map((metric) => (
                  <li key={metric.requestId} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {metric.functionName}
                          </p>
                          <p className={`text-sm font-medium ${
                            metric.status === 'completed' ? 'text-green-600' : 
                            metric.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {metric.status}
                          </p>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div>
                            <span className="font-medium">Duration:</span> {formatDuration(metric.duration)}
                          </div>
                          <div>
                            <span className="font-medium">Tokens:</span> {metric.tokenCount || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span> {formatCost(metric.cost)}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {formatTimestamp(metric.startTime)}
                          </div>
                        </div>
                        {metric.error && (
                          <div className="mt-2 text-sm text-red-600">
                            <span className="font-medium">Error:</span> {metric.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No request metrics available
            </div>
          )}
        </div>
      )}

      {/* User Activity Tab */}
      {activeTab === 'activity' && (
        <div>
          <h2 className="text-lg font-semibold mb-4">User Activity Summary</h2>
          
          {userActivity ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Request Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Requests:</span>
                        <span className="text-sm font-medium">{userActivity.requestCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hourly Requests:</span>
                        <span className="text-sm font-medium">{userActivity.hourlyRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Request:</span>
                        <span className="text-sm font-medium">{formatTimestamp(userActivity.lastRequest)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Usage Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily Cost:</span>
                        <span className="text-sm font-medium">{formatCost(userActivity.dailyCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Exports:</span>
                        <span className="text-sm font-medium">{userActivity.exportCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Export:</span>
                        <span className="text-sm font-medium">{formatTimestamp(userActivity.lastExport)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading user activity...
            </div>
          )}
        </div>
      )}

      {/* Anomaly Detection Tab */}
      {activeTab === 'anomalies' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Anomaly Detection</h2>
            <button
              onClick={handleResetAnomalies}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reset Metrics
            </button>
          </div>
          
          {anomalyMetrics ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Activity Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hourly Requests:</span>
                        <span className={`text-sm font-medium ${
                          anomalyMetrics.hourlyRequests > 100 ? 'text-red-600' : 
                          anomalyMetrics.hourlyRequests > 50 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {anomalyMetrics.hourlyRequests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Daily Cost:</span>
                        <span className={`text-sm font-medium ${
                          anomalyMetrics.dailyCost > 50 ? 'text-red-600' : 
                          anomalyMetrics.dailyCost > 25 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {formatCost(anomalyMetrics.dailyCost)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Export Count:</span>
                        <span className={`text-sm font-medium ${
                          anomalyMetrics.exportCount > 10 ? 'text-red-600' : 
                          anomalyMetrics.exportCount > 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {anomalyMetrics.exportCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Security Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Failed Auth Attempts:</span>
                        <span className={`text-sm font-medium ${
                          anomalyMetrics.failedAuthAttempts > 5 ? 'text-red-600' : 
                          anomalyMetrics.failedAuthAttempts > 2 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {anomalyMetrics.failedAuthAttempts}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Concurrent Sessions:</span>
                        <span className={`text-sm font-medium ${
                          anomalyMetrics.concurrentSessions > 3 ? 'text-red-600' : 
                          anomalyMetrics.concurrentSessions > 1 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {anomalyMetrics.concurrentSessions}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Activity:</span>
                        <span className="text-sm font-medium">{formatTimestamp(anomalyMetrics.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Thresholds */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Detection Thresholds</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Requests/Hour:</span>
                      <span className="ml-2 font-medium">100</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost/Day:</span>
                      <span className="ml-2 font-medium">$50</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Exports/Hour:</span>
                      <span className="ml-2 font-medium">10</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed Auth:</span>
                      <span className="ml-2 font-medium">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading anomaly metrics...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ObservabilityDashboard;
