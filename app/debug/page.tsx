"use client";

import AuthDebug from "@/components/AuthDebug";
import { useAuth } from "@/context/AuthContext";

export default function DebugPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Authentication Debug Page</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Current Authentication Status</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Loading:</span> {isLoading ? "Yes" : "No"}</p>
          <p><span className="font-medium">Authenticated:</span> {isAuthenticated ? "Yes" : "No"}</p>
          {user ? (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">User Details</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="mt-4 text-gray-500">No user is currently authenticated</p>
          )}
        </div>
      </div>

      <AuthDebug />

      <div className="bg-white shadow-md rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Test Authentication Flow</h3>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Reload Page
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Reload the page to test if session persists across page refreshes.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Clear Client-side State</h3>
            <button 
              onClick={() => {
                localStorage.setItem('logoutTimestamp', '0');
                window.location.reload();
              }} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Clear Logout Timestamp
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Clear the logout timestamp to allow immediate session recovery.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Clear Cookies</h3>
            <button 
              onClick={() => {
                // Clear session cookies
                document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                window.location.reload();
              }} 
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Clear Session Cookies
            </button>
            <p className="mt-2 text-sm text-gray-500">
              Clear session cookies and reload to fully log out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
