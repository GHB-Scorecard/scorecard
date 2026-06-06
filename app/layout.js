import "./globals.css";

export const metadata = {
  title: "GitHub Performance Scorecard",
  description: "GitHub + Copilot Individual Scorecard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
