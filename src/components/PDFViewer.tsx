import React, { useState, useRef, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MessageSquare,
  StickyNote,
  Bell,
} from 'lucide-react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import HTMLFlipBook from 'react-pageflip';
import { AuthModal } from './AuthModal';

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  isSubscribed: boolean;
  onSubscribe: () => void;
}

const PREVIEW_PAGES = 3;

export function PDFViewer({ url, isSubscribed, onSubscribe }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const flipBookRef = useRef<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [disableFlip, setDisableFlip] = useState(false);
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);
  const documentRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showReminderInput, setShowReminderInput] = useState(false);
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [pageCache, setPageCache] = useState<{ [key: number]: any }>({});

  const pdfOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    enableXfa: true
  }), []);

  // Preload the PDF document and cache initial pages
  useEffect(() => {
    const preloadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load PDF: ${response.statusText}`);
        }
        
        const loadingTask = pdfjs.getDocument({
          url,
          cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          enableXfa: true
        });

        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);

        // Preload first few pages
        const pagesToPreload = Math.min(4, pdf.numPages);
        const newCache: { [key: number]: any } = {};
        
        const preloadPromises = Array.from({ length: pagesToPreload }, (_, i) => 
          pdf.getPage(i + 1).then(page => {
            newCache[i + 1] = page;
          })
        );

        await Promise.all(preloadPromises);
        setPageCache(newCache);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setError('Failed to load the PDF. Please try again later.');
        setLoading(false);
      }
    };

    preloadPDF();

    return () => {
      if (pdfDocument) {
        pdfDocument.destroy();
      }
      setPageCache({});
    };
  }, [url]);

  // Handle page change and preload adjacent pages
  useEffect(() => {
    const preloadAdjacentPages = async () => {
      if (!pdfDocument) return;

      const pagesToPreload = [currentPage - 1, currentPage + 1].filter(
        page => page > 0 && page <= numPages && !pageCache[page]
      );

      for (const pageNum of pagesToPreload) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          setPageCache(prev => ({ ...prev, [pageNum]: page }));
        } catch (error) {
          console.error(`Error preloading page ${pageNum}:`, error);
        }
      }
    };

    preloadAdjacentPages();
  }, [currentPage, pdfDocument, numPages, pageCache]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageFlip = (e: any) => {
    const newPage = e.data + 1;
    setCurrentPage(newPage);
    
    setShowCommentInput(false);
    setShowNoteInput(false);
    setShowReminderInput(false);
  
    if (!isSubscribed && newPage > PREVIEW_PAGES && newPage < numPages) {
      if (flipBookRef.current) {
        if (newPage > currentPage) {
          flipBookRef.current.pageFlip().flip(numPages - 1);
        } else {
          flipBookRef.current.pageFlip().flip(PREVIEW_PAGES - 1);
        }
      }
    } else {
      setDisableFlip(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const getVisiblePages = () => Array.from({ length: numPages }, (_, i) => i);

  const shouldShowSubscribePrompt = !isSubscribed && currentPage > PREVIEW_PAGES;

  const handleError = (error: Error) => {
    if (error.message !== 'TextLayer task cancelled.') {
      console.error('PDF loading error:', error);
    }
  };

  const handleCommentSubmit = () => {
    console.log(`Comment for page ${currentPage}:`, comment);
    setComment('');
    setShowCommentInput(false);
  };

  const handleNoteSubmit = () => {
    console.log(`Note for page ${currentPage}:`, note);
    setNote('');
    setShowNoteInput(false);
  };

  const handleReminderSubmit = () => {
    console.log(`Reminder for page ${currentPage}:`, reminderDate);
    setReminderDate('');
    setShowReminderInput(false);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center bg-gray-100 p-2 md:p-6 rounded-lg transition-all duration-300
        ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}
    >
      {error ? (
        <div className="flex flex-col items-center justify-center h-[600px] text-red-600">
          <p className="text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4 w-full justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.6))}
                className={`p-2 rounded-full shadow hover:bg-gray-50 transition-colors
                  ${isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white'}`}
                title="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className={`text-sm ${isFullscreen ? 'text-white' : 'text-gray-600'}`}>
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((prev) => Math.min(prev + 0.2, 2))}
                className={`p-2 rounded-full shadow hover:bg-gray-50 transition-colors
                  ${isFullscreen ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white'}`}
                title="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            </div>
            
            <button
               onClick={() => {
                if (!isSubscribed) {
                  alert("Please sign up or subscribe to download this book.");
                  return;
                }
                window.open(url, '_blank');
              }}
               className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-white hover:bg-gray-50 shadow"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>

          <div className="relative flex justify-center items-center w-full h-full">
            <button
              onClick={() => flipBookRef.current?.pageFlip().flipPrev()}
              disabled={currentPage <= 1}
              className={`absolute z-10 p-4 rounded-full shadow-lg transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isFullscreen 
                  ? 'left-8 bg-gray-800 text-white hover:bg-gray-700 scale-125' 
                  : '-left-6 bg-white hover:bg-gray-50'}`}
            >
              <ChevronLeft size={28} />
            </button>

            <Document
              file={url}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleError}
              loading={
                <div className="flex items-center justify-center h-[600px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }
              error={
                <div className="flex items-center justify-center h-[600px] text-red-600">
                  Failed to load PDF. Please try again later.
                </div>
              }
             options={pdfOptions}
            >
              <HTMLFlipBook
                width={550}
                height={733}
                size="stretch"
                minWidth={315}
                maxWidth={1000}
                minHeight={400}
                maxHeight={1533}
                showCover={true}
                mobileScrollSupport={true}
                className={`mx-auto flex justify-center items-center ${shouldShowSubscribePrompt ? 'pointer-events-none' : ''}`}
                ref={flipBookRef}
                onFlip={handlePageFlip}
              >
                {getVisiblePages().map((pageIndex) => (
                  <div key={pageIndex} className="page-content relative">
                    <Page 
                      pageNumber={pageIndex + 1} 
                      width={isFullscreen ? window.innerWidth * 0.35 : 300}
                      scale={scale}
                      className="mx-auto flex justify-center items-center"
                      error={handleError}
                      loading={
                        <div className="flex items-center justify-center h-[600px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    />

                    {!isSubscribed && currentPage >= numPages - 1 && (
                      <div
                        className="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto' }} 
                      >
                        <div
                          className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <h3 className="text-xl font-semibold mb-3">
                            Subscribe to Continue Reading
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Get full access to all our spiritual content and unlock the complete book.
                          </p>
                          <div onClick={(e) => e.stopPropagation()}> 
                            <button
                              onClick={(e) => {
                                e.preventDefault(); 
                                setDisableFlip(true); 
                                setIsAuthModalOpen(true); 
                                setShowSubscriptionOverlay(false);
                                flipBookRef.current?.pageFlip().flip(0);
                              }}
                              className="bg-blue-600 text-white px-6 py-2 rounded-md transition-transform hover:bg-blue-700 hover:shadow-lg hover:scale-105"
                            >
                              Subscribe Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </HTMLFlipBook>
            </Document>

            {isAuthModalOpen && (
              <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                  setIsAuthModalOpen(false);
                  onSubscribe();
                }}
                mode="signup"
              />
            )}

            <button
              onClick={() => flipBookRef.current?.pageFlip().flipNext()}
              disabled={currentPage >= numPages}
              className={`absolute z-4 p-4 rounded-full shadow-lg transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isFullscreen 
                  ? 'right-8 bg-gray-800 text-white hover:bg-gray-700 scale-125' 
                  : '-right-6 bg-white hover:bg-gray-50'}`}
            >
              <ChevronRight size={28} />
            </button>
          </div>

          <div className={`mt-4 flex flex-col items-center gap-4 ${isFullscreen ? 'text-white' : 'text-gray-600'}`}>
            <div className="text-sm">
              Page {currentPage} of {numPages}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCommentInput(!showCommentInput)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isFullscreen ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow`}
              >
                <MessageSquare size={18} />
                <span>Comment</span>
              </button>

              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isFullscreen ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow`}
              >
                <StickyNote size={18} />
                <span>Note</span>
              </button>

              <button
                onClick={() => setShowReminderInput(!showReminderInput)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isFullscreen ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow`}
              >
                <Bell size={18} />
                <span>Reminder</span>
              </button>
            </div>

            {showCommentInput && (
              <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-2 border rounded-md text-gray-800 mb-2"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowCommentInput(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

            {showNoteInput && (
              <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a personal note..."
                  className="w-full p-2 border rounded-md text-gray-800 mb-2"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowNoteInput(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNoteSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {showReminderInput && (
              <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full p-2 border rounded-md text-gray-800 mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowReminderInput(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReminderSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}