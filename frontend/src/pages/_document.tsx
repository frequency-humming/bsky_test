import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
      <link rel="icon" type="image/png" href="../../public/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="../../public/favicon.svg" />
      <link rel="shortcut icon" href="../../public/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
