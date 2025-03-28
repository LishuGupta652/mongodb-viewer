import React, { useState } from 'react';
import { Database, Settings } from 'lucide-react';

interface Collection {
  name: string;
  data: any[];
}

function App() {
  const [mongoUrl, setMongoUrl] = useState<string>('');
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch('http://localhost:3000/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mongoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to MongoDB');
      }

      const data = await response.json();
      setCollections(data.collections);
    } catch (err) {
      setError('Failed to connect to MongoDB. Please check your connection string.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCollectionData = async (collectionName: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:3000/api/collections/${collectionName}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection data');
      }

      const { data } = await response.json();
      setCollectionData(data);
    } catch (err) {
      setError('Failed to fetch collection data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollectionClick = (collection: string) => {
    setSelectedCollection(collection);
    fetchCollectionData(collection);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5" />
                MongoDB Viewer
              </h1>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 border-b">
              <input
                type="text"
                value={mongoUrl}
                onChange={(e) => setMongoUrl(e.target.value)}
                placeholder="MongoDB Connection URL"
                className="w-full p-2 border rounded mb-2"
              />
              <button
                onClick={fetchCollections}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Connect
              </button>
            </div>
          )}

          {/* Collections List */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Collections</h2>
            {collections.map((collection) => (
              <button
                key={collection}
                onClick={() => handleCollectionClick(collection)}
                className={`w-full text-left p-2 rounded mb-1 ${
                  selectedCollection === collection
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                {collection}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded">
              {error}
            </div>
          )}

          {selectedCollection && !isLoading && !error && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedCollection}</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {collectionData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(collectionData[0]).map((key) => (
                            <th
                              key={key}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {collectionData.map((item, index) => (
                          <tr key={index}>
                            {Object.values(item).map((value: any, i) => (
                              <td
                                key={i}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                              >
                                {typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No data in this collection
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedCollection && !isLoading && !error && (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a collection to view its data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;