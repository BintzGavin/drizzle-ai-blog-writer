import React from 'react';
import { Head } from "next/document";


declare global {
    interface Window {
        dataLayer: any;
        adsbygoogle: any;
    }
}

function Layout({ children, title = "drizzle.ai | Generate SEO-optmized articles from a list of keywords" }: { children: React.ReactNode; title?: string }) {
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }, []);
    return (
        <>

            <Head>
                <script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
                            page_path: window.location.pathname,
                            });
                        `,
                    }}
                />

                <meta name="robots" content="index, follow" />
                <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="language" content="English" />
                <meta name="author" content="VdayPoem" />
                <title>{title}</title>
                <meta name="description" content="Generate hundreds of SEO optimized articles in minutes. Bring your keywords, get your articles." />
                <meta property="og:title" content={title} />
                <meta property="og:type" content="website" />
                <meta property="og:description" content="Generate hundreds of SEO optimized articles in minutes. Bring your keywords, get your articles." />
                <meta property="og:image" content="https://wondrous-crepe-95ab20.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogowriter.f8f62f18.png&w=640&q=75" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:image" content="https://wondrous-crepe-95ab20.netlify.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogowriter.f8f62f18.png&w=640&q=75" />
            </Head>
            {children}
        </>
    );
}

export default Layout;
