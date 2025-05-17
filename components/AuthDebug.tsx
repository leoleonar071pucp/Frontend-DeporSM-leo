import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/lib/config';
import { useEffect, useState } from 'react';

type SessionInfo = {
  sessionExists: boolean;
  sessionId?: string;
  creationTime?: number;
  lastAccessedTime?: number;
  maxInactiveInterval?: number;
  isNew?: boolean;
  attributes?: Record<string, any>;
  authentication?: {
    authenticated: boolean;
    principal?: string;
    name?: string;
    authorities?: any[];
  }
};

export default function AuthDebug() {
  const { user, loading } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const fetchSessionInfo = async () => {
    try {
      setSessionError(null);
      const response = await fetch(`${API_BASE_URL}/debug/session/info`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSessionInfo(data);
    } catch (error) {
      console.error('Error fetching session info:', error);
      setSessionError(error instanceof Error ? error.message : 'Unknown error');
      setSessionInfo(null);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchSessionInfo();
    }
  }, [loading, user]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 mb-8">
      <h2 className="text-xl font-bold mb-4">Authentication Debug</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Client State:</h3>
        <div className="bg-white p-3 rounded border border-gray-200">
          <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>User Logged In:</strong> {user ? 'Yes' : 'No'}</p>
          {user && (
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Roles:</strong> {user.roles?.join(', ')}</p>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">Server Session:</h3>
        <button
          onClick={fetchSessionInfo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-3"
        >
          Refresh Session Info
        </button>
        
        {sessionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-3">
            <p><strong>Error:</strong> {sessionError}</p>
          </div>
        )}

        {sessionInfo ? (
          <div className="bg-white p-3 rounded border border-gray-200">
            <p><strong>Session Exists:</strong> {sessionInfo.sessionExists ? 'Yes' : 'No'}</p>
            
            {sessionInfo.sessionExists && (
              <>
                <p><strong>Session ID:</strong> {sessionInfo.sessionId}</p>
                <p><strong>Created:</strong> {new Date(sessionInfo.creationTime!).toLocaleString()}</p>
                <p><strong>Last Accessed:</strong> {new Date(sessionInfo.lastAccessedTime!).toLocaleString()}</p>
                <p><strong>Max Inactive Interval:</strong> {sessionInfo.maxInactiveInterval} seconds</p>
                <p><strong>Is New Session:</strong> {sessionInfo.isNew ? 'Yes' : 'No'}</p>
                
                <div className="mt-3">
                  <strong>Authentication:</strong>
                  {sessionInfo.authentication ? (
                    <ul className="list-disc pl-5">
                      <li>Authenticated: {sessionInfo.authentication.authenticated ? 'Yes' : 'No'}</li>
                      {sessionInfo.authentication.name && <li>Name: {sessionInfo.authentication.name}</li>}
                      {sessionInfo.authentication.principal && <li>Principal: {sessionInfo.authentication.principal}</li>}
                    </ul>
                  ) : (
                    <p>No authentication information</p>
                  )}
                </div>
                
                <div className="mt-3">
                  <strong>Session Attributes:</strong>
                  {sessionInfo.attributes && Object.keys(sessionInfo.attributes).length > 0 ? (
                    <ul className="list-disc pl-5">
                      {Object.entries(sessionInfo.attributes).map(([key, value]) => (
                        <li key={key}>
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No session attributes</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="italic text-gray-500">Loading session information...</p>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>This debug panel helps diagnose authentication issues. If you see session information above but the client state shows you're not logged in, there might be an issue with how the frontend is processing authentication data.</p>
      </div>
    </div>
  );
}
