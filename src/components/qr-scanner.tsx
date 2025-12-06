"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2, XCircle } from 'lucide-react';

const QR_READER_ID = "qr-reader";

type ScannerStatus = "idle" | "initializing" | "scanning" | "paused" | "error" | "stopped";

export function QrScanner() {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || status !== 'idle') {
      return;
    }

    setStatus("initializing");

    const html5QrCode = new Html5Qrcode(QR_READER_ID, /* verbose= */ false);
    scannerRef.current = html5QrCode;
    let didUnmount = false;

    const qrCodeSuccessCallback = (decodedText: string) => {
      if (lastScannedRef.current === decodedText) {
        return;
      }
      lastScannedRef.current = decodedText;

      const baseUrl = "http://192.168.8.191:5000";
      const url = `${baseUrl}/team/${decodedText}`;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Request failed: ${response.statusText}`);
          }
          return response.text();
        })
        .then(() => {
          toast({
            title: "Registered!",
            description: `Content '${decodedText}' has been successfully registered.`,
          });
        })
        .catch(err => {
          console.error("API call failed:", err);
          toast({
            title: "Registration Failed",
            description: `Could not register '${decodedText}'. Please try again.`,
            variant: "destructive",
          });
        })
        .finally(() => {
          setTimeout(() => {
            if (!didUnmount) {
              lastScannedRef.current = null;
            }
          }, 2000);
        });
    };
    const qrCodeErrorCallback = (error: string) => {
      // This is called for non-qr images, we can ignore it.
    };
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };

    html5QrCode.start(
      { facingMode: "user" },
      config,
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    ).then(() => {
      if (!didUnmount) {
        setStatus("scanning");
        setErrorMessage(null);
      }
    }).catch((err) => {
      if (!didUnmount) {
        setStatus("error");
        if (String(err).includes('NotAllowedError')) {
          setErrorMessage("Camera permission denied. Please enable it in your browser settings.");
        } else if(String(err).includes('NotFoundError')) {
            setErrorMessage("No camera found. Please connect a camera and refresh.");
        }
        else {
          setErrorMessage("Failed to start camera. Please refresh the page.");
        }
        console.error("Scanner start error:", err);
      }
    });

    return () => {
      didUnmount = true;
      setStatus("stopped");
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
      }
    };
  }, [status, toast]);

  const getStatusContent = () => {
    switch(status) {
        case "initializing":
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                    <p>Initializing Camera...</p>
                </div>
            );
        case "error":
             return (
                <div className="flex flex-col items-center justify-center h-full text-destructive p-4 text-center">
                    <XCircle className="h-10 w-10 mb-4" />
                    <p className="font-semibold">Camera Error</p>
                    <p className="text-sm">{errorMessage}</p>
                </div>
            );
        case "scanning":
        case "paused":
            return <div id={QR_READER_ID} className="w-full h-full" />;
        default:
            return <div id={QR_READER_ID} className="w-full h-full bg-black" />; // Placeholder before init
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-background/80 backdrop-blur-sm z-10">
        <CardTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
          <Camera />
          QR Scanner
        </CardTitle>
        <CardDescription>
          Point your camera at a QR code to scan it.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="aspect-square bg-muted">
            {getStatusContent()}
        </div>
        {status === 'paused' && (
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                 <Loader2 className="h-10 w-10 animate-spin text-white" />
            </div>
        )}
      </CardContent>
    </Card>
  );
}
