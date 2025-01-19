import { Html, Main, NextScript } from 'next/document'
import Layout from '../layout/layout'

export default function Document() {
  return (
    <Html lang="en">
      <Layout>
        <body>
          <Main />
          <NextScript />
        </body>
      </Layout>
    </Html>
  )
}
