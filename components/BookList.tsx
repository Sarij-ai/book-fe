import { useBookListContext } from "@/context/BookListContext";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Button } from "../components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";

interface ParsedMetadata {
    title: string;
    description: string;
    image: string;
    raw: string;
}

const renderRawContent = (text: string) => {
    return (
        <pre className="whitespace-pre-wrap break-words text-sm text-gray-700 dark:text-gray-300">
            {text.split("\n").map((line, index) => (
                <span key={index}>
                    {line.replace(/\t/g, "    ").replace(/\*\*\*/g, "---")}
                    <br />
                </span>
            ))}
        </pre>
    );
};

export const parseMetadata = (html: string): ParsedMetadata => {
    if (typeof window === "undefined") {
        return { title: "", description: "", image: "", raw: html };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const title = doc.querySelector('meta[name="title"]')?.getAttribute("content") || "Unknown Title";
    const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "No description available";
    const image = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";

    return { title, description, image, raw: html };
};

const BookList = () => {
    const {
        books,
        isLoading,
        error,
        currentPage,
        totalPages,
        setCurrentPage,
    } = useBookListContext();

    const router = useRouter();

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const onClickId = (id: number) => {
        router.push(`/?bookId=${id}`);
    };

    return (
        <div className="mt-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                Previously Accessed Books
            </h2>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400" />
                </div>
            ) : error ? (
                <div className="text-red-500 dark:text-red-400 text-center text-lg font-semibold">
                    {error}
                </div>
            ) : books.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No books accessed yet.</p>
            ) : (
                <>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {books.map((book) => {
                            const metadata = parseMetadata(book.metadata);
                            return (
                                <AccordionItem className="border-b-0" key={book.id} value={`book-${book.id}`}>
                                    <AccordionTrigger className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md text-gray-900 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                                        <div className="flex items-center space-x-4">
                                            <span onClick={() => onClickId(book.id)} className="text-xs font-mono text-gray-500 dark:text-gray-400">
                                                ID: {book.id}
                                            </span>
                                            <span className="font-medium">{metadata.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="dark:bg-gray-700 bg-gray-50 text-gray-800 dark:text-gray-200 p-4 rounded-md">
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
                            );
                        })}
                    </Accordion>

                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center items-center space-x-4">
                            <Button
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1 || isLoading}
                                variant="outline"
                                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                First
                            </Button>
                            <Button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || isLoading}
                                variant="outline"
                                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || isLoading}
                                variant="outline"
                                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages || isLoading}
                                variant="outline"
                                className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Last
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BookList;
