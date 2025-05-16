"use client"

export function AmpHead() {
  return (
    <>
      <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1" />
      <script async src="https://cdn.ampproject.org/v0.js"></script>
      <style jsx global>{`
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell,
            "Helvetica Neue", sans-serif;
          line-height: 1.6;
          color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          line-height: 1.25;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 2rem;
        }
        h2 {
          font-size: 1.5rem;
        }
        p {
          margin-bottom: 1rem;
        }
        a {
          color: #0070f3;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #eaeaea;
        }
        .logo {
          font-weight: bold;
          font-size: 1.5rem;
        }
        .main {
          padding: 2rem 0;
        }
        .footer {
          padding: 2rem 0;
          border-top: 1px solid #eaeaea;
          text-align: center;
        }
      `}</style>
    </>
  )
}
