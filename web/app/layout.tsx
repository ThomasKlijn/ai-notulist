export const metadata = { title: "AI Notulist", description: "MVP" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif', margin: 0 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '24px' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h1 style={{ margin: 0 }}>AI Notulist</h1>
            <a href="/meetings/new">Nieuwe meeting</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}