import { QrScanner } from '@/components/qr-scanner';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-8">
      <h1 className="sr-only">QR Scanner Notifier</h1>
      <p className="sr-only">
        Point your camera at a QR code to register its content.
      </p>
      <QrScanner />
    </main>
  );
}
