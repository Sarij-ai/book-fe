// context/CurrentBookContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface CurrentBookContextType {
    currentBook: BookResponse | null;
    setCurrentBook: (book: BookResponse) => void;
}

const CurrentBookContext = createContext<CurrentBookContextType | undefined>(undefined);

export const CurrentBookProvider = ({ children }: { children: ReactNode }) => {
    const [currentBook, setCurrentBook] = useState<BookResponse | null>(null);

    return (
        <CurrentBookContext.Provider value={{ currentBook, setCurrentBook }}>
            {children}
        </CurrentBookContext.Provider>
    );
};

export const useCurrentBookContext = (): CurrentBookContextType => {
    const context = useContext(CurrentBookContext);
    if (!context) {
        throw new Error("useCurrentBookContext must be used within a CurrentBookProvider");
    }
    return context;
};
