import "./globals.css";

export const metadata = {
  title: "Course Planning Studio",
  description: "AI-assisted course planning for mentors and educators",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
