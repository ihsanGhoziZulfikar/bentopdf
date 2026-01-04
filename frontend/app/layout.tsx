// frontend/app/layout.js
import './globals.css';
import VisitorTracker from './components/VisitorTracker';

export const metadata = {
  title: 'Bento PDF',
  description: 'Your PDF Tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
