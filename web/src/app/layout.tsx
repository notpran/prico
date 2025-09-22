import './globals.css';

export const metadata = {
  title: 'Prico',
  description: 'Collaborative coding platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}