import { useState, useRef, useEffect } from "react";
import BookList, { parseMetadata } from "./BookList";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./ui/accordion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Play, Pause } from "lucide-react";
import { useRouter } from "next/router";
import { useBookListContext } from "@/context/BookListContext";
import { useCurrentBookContext } from "@/context/CurrentBookContext";



interface BookResponse {
    id: number;
    content: string;
    metadata: string;
    analysis?: {
        language: string;
        sentiment: string;
        characters: string[];
        summary: string;
    };
}

const PAGE_SIZE = 1000;

const renderRawContent = (text: string) => {
    return (
        <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">
            {text.split('\n').map((line, index) => (
                <span key={index}>
                    {line.replace(/\t/g, "    ").replace(/\*/g, "-")}
                    <br />
                </span>
            ))}
        </pre>
    );
};

const ExploreBooks: React.FC = () => {
    const { setCurrentBook, currentBook } = useCurrentBookContext();
    const router = useRouter();
    const [bookId, setBookId] = useState<string>(router.query.bookId as string ?? currentBook?.id.toString() ?? "");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [streamError, setStreamError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isStreamLoading, setIsStreamLoading] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { addBook } = useBookListContext();

    useEffect(() => {
        if (currentBook) {
            setBookId(currentBook.id.toString());
        }
    },[currentBook]);

    useEffect(() => {
        const queryBookId = router.query.bookId as string ?? "";
        console.log('queryBookId', queryBookId, queryBookId.length && (bookId !== queryBookId || !currentBook))

        if (queryBookId.length && (bookId !== queryBookId || !currentBook)) {
            fetchBook(queryBookId);
        }
        setBookId(queryBookId);
    }, [router.query.bookId, clientId]);

    useEffect(() => {
        const storedClientId = localStorage.getItem("clientId");
        if (storedClientId) {
            setClientId(storedClientId);
        } else {
            const newClientId = uuidv4();
            localStorage.setItem("clientId", newClientId);
            setClientId(newClientId);
        }
    }, []);


    const fetchBook = async (bookId: string) => {

        if (!bookId || !clientId) return;
        console.log('geeting book', bookId, clientId)
        // Reset audio player state
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
        setIsPlaying(false);
        setIsStreamLoading(false);
        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/books/${bookId}`, {
                headers: {
                    "X-Client-Id": clientId,
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Book content not found.");
                }
                throw new Error(`Failed to fetch book: ${response.statusText}`);
            }

            const data: BookResponse = await response.json();
            setCurrentBook(data);
            addBook(data)
            setCurrentPage(1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the book.");
        } finally {
            setIsLoading(false);
        }
    };


    const fetchAudioStream = async (page: number) => {
        if (!clientId || !bookId || !audioRef.current) return;
        setStreamError(null);
        try {
            const streamUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/books/${bookId}/stream?page=${page}`;
            audioRef.current.src = streamUrl;
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (err) {
            setStreamError(err instanceof Error ? err.message : "Streaming error.");
            setIsPlaying(false);
        }
    };

    const handlePlay = async () => {
        try {
            if (!currentBook) return;
            setIsStreamLoading(true);
            setStreamError(null);
            if (audioRef?.current?.src) {
                await audioRef.current.play();
                setIsPlaying(true);
            } else {
                await fetchAudioStream(currentPage);
            }
        } catch (err) {
            setStreamError("Limit exceeded. Please try again later.");
            setIsPlaying(false);
        } finally {
            setIsStreamLoading(false);
        }
    };

    const handlePause = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    const handleAudioEnded = () => {
        if (!currentBook) return;
        const totalPages = Math.ceil(currentBook.content.length / PAGE_SIZE);
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            fetchAudioStream(currentPage + 1);
        } else {
            setIsPlaying(false);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.addEventListener("ended", handleAudioEnded);
            return () => audioRef.current?.removeEventListener("ended", handleAudioEnded);
        }
    }, [currentBook, currentPage]);

    const getPaginatedContent = () => {
        if (!currentBook) return "";

        const start = (currentPage - 1) * PAGE_SIZE;
        const lines = currentBook.content.split("\n");

        let pageLines: string[] = [];
        let totalLength = 0;

        // Start accumulating lines from the 'start' index
        for (let i = start; i < lines.length; i++) {
            const line = lines[i];
            const lineLength = line.length;

            // If adding this line doesn't exceed the PAGE_SIZE
            if (totalLength + lineLength <= PAGE_SIZE) {
                pageLines.push(line);
                totalLength += lineLength;
            } else {
                break;
            }
        }

        return pageLines.join("\n");
    };


    const totalPages = currentBook ? Math.ceil(currentBook.content.length / PAGE_SIZE) : 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const metadata = currentBook ? parseMetadata(currentBook.metadata) : null;

    return (
        <div className={`min-h-screen dark:bg-gray-900 dark:text-gray-100 bg-gray-50 text-gray-900 py-8 px-4 transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto">

                <div className={`p-6 rounded-lg shadow-lg dark:bg-gray-800 bg-white`}>
                    <div className="flex space-x-4">
                        <Input
                            type="number"
                            value={bookId}
                            onChange={(e) => setBookId(e.target.value)}
                            placeholder="Enter Book ID (e.g., 123)"
                            className={`flex-1 border dark:bg-gray-700 dark:border-gray-600 outline-0 dark:text-gray-100 bg-white border-gray-300 text-gray-900`}
                        />
                        <Button
                            onClick={() => fetchBook(bookId)}
                            disabled={!bookId || !clientId || isLoading}
                            className={`dark:bg-accent-dark dark:hover:bg-gray-500 dark:text-white bg-accent-light hover:bg-blue-500 hover:text-white text-gray-800 flex items-center`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                "Fetch Book"
                            )}
                        </Button>
                    </div>

                    {error && (
                        <p className="mt-4 text-red-500 dark:text-red-400">{error}</p>
                    )}

                    {currentBook && clientId && !error && (
                        <div className="mt-6 animate-fade-in">
                            <h2 className="text-2xl font-semibold mb-4">Book Details</h2>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem className='py-1' value="content">
                                    <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Content (Page {currentPage})</AccordionTrigger>
                                    <AccordionContent className={`dark:bg-gray-700 bg-gray-50 p-4 rounded-md`}>
                                        <div className="flex items-start gap-6">
                                            <div className="flex-1">{renderRawContent(getPaginatedContent())}</div>
                                            <div className="flex flex-col items-center justify-start space-y-2">
                                                <Button
                                                    onClick={isPlaying ? handlePause : handlePlay}
                                                    disabled={isStreamLoading}
                                                    className={`
                            transition-colors duration-200 ease-in-out px-6 py-3 rounded-full shadow-md text-white
                            ${isStreamLoading
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : isPlaying
                                                                ? "bg-red-500 hover:bg-red-600"
                                                                : "bg-green-500 hover:bg-green-600"
                                                        }
                          `}
                                                >
                                                    {isStreamLoading ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : isPlaying ? (
                                                        <Pause className="h-5 w-5" />
                                                    ) : (
                                                        <Play className="h-5 w-5" />
                                                    )}
                                                </Button>
                                                {isPlaying && (
                                                    <span className="text-xs text-green-400 animate-pulse">Now Playing...</span>
                                                )}
                                                {streamError && (
                                                    <p className="text-xs text-red-500 dark:text-red-400 text-center max-w-[12rem] break-words">
                                                        {streamError}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem className='py-1' value="metadata">
                                    <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Metadata</AccordionTrigger>
                                    <AccordionContent className={`dark:bg-gray-700 bg-gray-50 p-4 rounded-md`}>
                                        <div className="space-y-4">
                                            <div className="border-b pb-2">
                                                <p className="font-semibold">Title</p>
                                                <p>{metadata?.title}</p>
                                            </div>
                                            <div className="border-b pb-2">
                                                <p className="font-semibold">Description</p>
                                                <p>{metadata?.description}</p>
                                            </div>
                                            {metadata?.image && (
                                                <div className="flex justify-center">
                                                    <img
                                                        src={metadata.image}
                                                        alt="Book Cover"
                                                        className="w-40 h-auto rounded-md shadow-md border border-gray-200 dark:border-gray-600"
                                                    />
                                                </div>
                                            )}
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-accent-light dark:hover:text-accent-dark">
                                                    Raw Metadata
                                                </summary>
                                                <div className="mt-2">{renderRawContent(metadata?.raw.slice(0, 500) + "...")}</div>
                                            </details>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {currentBook.analysis && (

                                    <>
                                        <AccordionItem className='py-1' value="language">
                                            <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Language</AccordionTrigger>
                                            <AccordionContent className={`dark:"bg-gray-700 bg-gray-50 p-4 rounded-md`}>{currentBook.analysis.language}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem className='py-1' value="sentiment">
                                            <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Sentiment</AccordionTrigger>
                                            <AccordionContent className={`dark:"bg-gray-700 bg-gray-50 p-4 rounded-md`}>{renderRawContent(currentBook.analysis.sentiment)}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem className='py-1' value="characters">
                                            <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Characters</AccordionTrigger>
                                            <AccordionContent className={`dark:"bg-gray-700 bg-gray-50 p-4 rounded-md`}>{renderRawContent(currentBook.analysis.characters.join("\n"))}</AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem className='py-1' value="summary">
                                            <AccordionTrigger className={`dark:text-gray-200 dark:hover:text-accent-dark text-gray-900 hover:text-accent-light`}>Summary</AccordionTrigger>
                                            <AccordionContent className={`dark:"bg-gray-700 bg-gray-50 p-4 rounded-md`}>{renderRawContent(currentBook.analysis.summary)}</AccordionContent>
                                        </AccordionItem>
                                    </>
                                )}
                            </Accordion>

                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center space-x-4">
                                    <Button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        variant="outline"
                                        className={`dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 border-gray-300 text-gray-700 bg-white hover:bg-gray-100`}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2 font-medium">{currentPage} / {totalPages}</span>
                                    <Button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        variant="outline"
                                        className={`dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 border-gray-300 text-gray-700 bg-white hover:bg-gray-100`}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                            <audio ref={audioRef} className="hidden" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExploreBooks;