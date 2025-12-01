import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { BrainCircuit, Book, ArrowLeft, ArrowRight, Home, Loader, AlertCircle } from 'lucide-react';

function StudyView() {
  const { documentId } = useParams();
  const [document, setDocument] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [docError, setDocError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);

  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!documentId) return;
    setLoadingDoc(true);
    setDocError(null);
    try {
      const data = await apiService.getDocument(documentId);
      setDocument(data);
    } catch (err) {
      setDocError(err.message || 'Failed to fetch document details.');
    } finally {
      setLoadingDoc(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    setSummaryError(null);
    try {
      const data = await apiService.summarizeDocument(documentId);
      setSummary(data.summary);
    } catch (err) {
      setSummaryError(err.message || 'Failed to generate summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setLoadingFlashcards(true);
    setFlashcardsError(null);
    try {
      const data = await apiService.generateFlashcards(documentId);
      setFlashcards(data.flashcards || []);
      setCurrentFlashcardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setFlashcardsError(err.message || 'Failed to generate flashcards.');
    } finally {
      setLoadingFlashcards(false);
    }
  };
  
  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    }, 150);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentFlashcardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  if (loadingDoc) {
    return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-8 w-8 text-indigo-400" /></div>;
  }

  if (docError) {
    return (
      <div className="text-center py-8 text-red-400">
        <AlertCircle className="h-10 w-10 mx-auto mb-2" /> Error: {docError}
      </div>
    );
  }
  
  if (!document) {
    return <div className="text-center py-8 text-white/80">Document not found.</div>;
  }

  const currentFlashcard = flashcards[currentFlashcardIndex];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Study: {document.filename}</h1>
          <p className="text-white/80 mt-1">Use AI to generate summaries and flashcards from your document.</p>
        </div>
        <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-md bg-black/40 border border-white/10 hover:bg-white/10 transition-colors">
          <Home className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/20">
        <h2 className="text-2xl font-semibold mb-4 text-white">AI Actions</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleSummarize} disabled={loadingSummary} className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <BrainCircuit className="h-5 w-5" /> {loadingSummary ? 'Summarizing...' : 'Generate Summary'}
          </button>
          <button onClick={handleGenerateFlashcards} disabled={loadingFlashcards} className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors">
            <Book className="h-5 w-5" /> {loadingFlashcards ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
        {summaryError && <p className="mt-4 text-sm text-red-400"><AlertCircle className="inline h-4 w-4 mr-2"/>{summaryError}</p>}
        {flashcardsError && <p className="mt-4 text-sm text-red-400"><AlertCircle className="inline h-4 w-4 mr-2"/>{flashcardsError}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Summary</h2>
          {loadingSummary ? (
            <div className="flex justify-center items-center h-48"><Loader className="animate-spin h-8 w-8 text-blue-400" /></div>
          ) : summary ? (
            <div className="prose prose-invert max-w-none whitespace-pre-wrap">{summary}</div>
          ) : (
            <p className="text-white/60">Generate a summary to see it here.</p>
          )}
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-6 rounded-2xl shadow-2xl shadow-indigo-500/10 border border-white/20">
          <h2 className="text-2xl font-semibold mb-4 text-white">Flashcards</h2>
          {loadingFlashcards ? (
            <div className="flex justify-center items-center h-48"><Loader className="animate-spin h-8 w-8 text-teal-400" /></div>
          ) : flashcards.length > 0 && currentFlashcard ? (
            <div className="flex flex-col items-center">
              {/* Flashcard Body */}
              <div className="w-full h-80 [perspective:1000px]">
                <div
                  className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white/10 rounded-lg shadow-lg p-6 text-center [backface-visibility:hidden]">
                    <p className="text-sm text-white/70 mb-2">Question</p>
                    <p className="text-xl font-semibold text-white">{currentFlashcard.question}</p>
                  </div>
                  {/* Back */}
                  <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-white/20 rounded-lg shadow-lg p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <p className="text-sm text-teal-300 mb-2">Answer</p>
                    <p className="text-xl font-semibold text-white">{currentFlashcard.answer}</p>
                  </div>
                </div>
              </div>
              
              {/* Flashcard Navigation */}
              <div className="flex items-center justify-between w-full mt-6">
                <button onClick={handlePrevFlashcard} disabled={flashcards.length <= 1} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <p className="text-sm font-medium text-white/70">
                  {currentFlashcardIndex + 1} / {flashcards.length}
                </p>
                <button onClick={handleNextFlashcard} disabled={flashcards.length <= 1} className="p-3 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/60">Generate flashcards to see them here.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudyView;