import { GlobalProvider } from "@/context/global";
import "@/styles/global.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <GlobalProvider>
        <Component {...pageProps} />
      </GlobalProvider>
    </>
  );
}
