import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script src="http://localhost:3000/embed.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onload = function() {
                if (typeof initChatWidget === 'function') {
                  initChatWidget("http://halo.localhost:3000", "btagwmxfr59zf2jnmsyf06i8");
                }
              }
            `,
          }}
          defer
        />
      </body>
    </Html>
  );
}
