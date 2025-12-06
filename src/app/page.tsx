import { QrScanner } from '@/components/qr-scanner';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
      <h1 className="sr-only">Welcome to Omega</h1>
      <p className="sr-only">
        Scan your QR to CheckIn.
      </p>
      <QrScanner />
    </main>
  );
}
