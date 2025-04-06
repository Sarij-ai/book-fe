import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { BookListProvider } from "@/context/BookListContext";
import { CurrentBookProvider } from "@/context/CurrentBookContext";


export default function App({ Component, pageProps }: AppProps) {
  return (
    <CurrentBookProvider>
      <BookListProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </BookListProvider>
    </CurrentBookProvider>
  )
}