import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

interface Book {
    id: number;
    metadata: string;
}

interface BookListContextType {
    books: Book[];
    isLoading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    refreshBooks: () => void;
    addBook: (book: Book) => void;
}

const BookListContext = createContext<BookListContextType | undefined>(undefined);

export const useBookListContext = () => {
    const context = useContext(BookListContext);
    if (!context) {
        throw new Error("useBookContext must be used within a BookProvider");
    }
    return context;
};

export const BookListProvider = ({ children }: { children: ReactNode }) => {
    const [books, setBooks] = useState<Book[]>([]);
    const [clientId, setClientId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const limit = 5;

    useEffect(() => {
        if (typeof window !== "undefined") {
            let storedClientId = localStorage.getItem("clientId");
            if (!storedClientId) {
                storedClientId = uuidv4();
                localStorage.setItem("clientId", storedClientId);
            }
            setClientId(storedClientId);
        }
    }, []);

    const fetchBooks = async () => {
        if (!clientId) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/books/?page=${currentPage}&limit=${limit}`, {
                headers: {
                    "X-Client-Id": clientId,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch book list: ${response.statusText}`);
            }
            const data = await response.json();
            setBooks(data.books);
            setTotalPages(data.total_pages);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error while fetching books.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (clientId) fetchBooks();
    }, [clientId, currentPage]);

    const addBook = (newBook: Book) => {
        setBooks((prevBooks) => {
            const exists = prevBooks.some((book) => book.id === newBook.id);
            if (exists) return prevBooks;
            return [newBook, ...prevBooks];
        });
    };


    return (
        <BookListContext.Provider value={{
            books,
            isLoading,
            error,
            totalPages,
            currentPage,
            setCurrentPage,
            addBook,
            refreshBooks: fetchBooks,
        }}>
            {children}
        </BookListContext.Provider>
    );
};
