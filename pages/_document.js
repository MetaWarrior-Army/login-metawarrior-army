import { Html, Head, Main, NextScript } from 'next/document'

 
export default function Document() {
  return (
    <Html lang="en" className="h-100" data-bs-theme="auto">
      <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
        <title>Authorize Access to MetaWarrior Army</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous"/>
      </Head>
      <body className="d-flex h-100 text-center text-bg-dark">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}