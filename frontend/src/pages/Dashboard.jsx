import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { Link } from 'react-router-dom';
import { UploadCloud, FileText, BookOpen, Trash2, Loader, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      await apiService.uploadDocument(file);
      setFile(null);
      document.getElementById('file-upload').value = ''; // Reset file input
      await fetchDocuments();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await apiService.deleteDocument(documentId);
        await fetchDocuments();
      } catch (err) {
        setError(err.message || 'Failed to delete document.');
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/80 mt-1">Welcome back, {user?.email}! Manage your documents here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4 text-white">Upload Document</h2>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <UploadCloud className="h-12 w-12 text-white/50 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer text-indigo-400 font-medium">
                <span>Choose a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
              <p className="text-xs text-white/60 mt-1">PDF up to 10MB</p>
              {file && <p className="text-sm text-white/90 mt-4 font-medium">{file.name}</p>}
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="mt-6 w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-black/20 disabled:opacity-50 transition-colors"
            >
              {uploading ? <><Loader className="animate-spin h-5 w-5" /> Uploading...</> : 'Upload & Process'}
            </button>
            {uploadError && (
              <div className="mt-4 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" /> {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* Documents List Section */}
        <div className="lg:col-span-2">
          <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/20 min-h-[400px]">
            <h2 className="text-2xl font-semibold mb-4 text-white">Your Documents</h2>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader className="animate-spin h-8 w-8 text-indigo-400" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-48 text-red-400">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p>Error: {error}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p className="font-medium">No documents yet.</p>
                <p>Upload a document to get started.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/10 p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-white/20 transition-all duration-200 border border-white/10">
                    <span className="text-lg font-medium text-white mb-2 sm:mb-0">{doc.filename}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/study/${doc.id}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Study</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;