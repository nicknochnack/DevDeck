import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Copy, Check } from "lucide-react";

interface MobileAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileAccessDialog({ open, onOpenChange }: MobileAccessDialogProps) {
  const [networkUrl, setNetworkUrl] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [localUrl, setLocalUrl] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Get the current hostname and port
      const hostname = window.location.hostname;
      const port = window.location.port;
      const protocol = window.location.protocol;
      
      // Construct the presenter URL
      let presenterUrl: string;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Show a message that they need to use the network IP
        setLocalUrl(`${protocol}//${hostname}${port ? ':' + port : ''}/presenter`);
        // We can't automatically get the network IP from the browser
        // User needs to check their terminal or network settings
        presenterUrl = "Check terminal for network URL (e.g., http://192.168.x.x:8082/presenter)";
      } else {
        // Already using network IP or domain
        presenterUrl = `${protocol}//${hostname}${port ? ':' + port : ''}/presenter`;
      }
      
      setNetworkUrl(presenterUrl);
      
      // Only generate QR code if we have a valid URL
      if (!presenterUrl.startsWith("Check")) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(presenterUrl)}`;
        setQrCodeUrl(qrUrl);
      } else {
        setQrCodeUrl("");
      }
    }
  }, [open]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(networkUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-accent" />
            Open on Mobile Device
          </DialogTitle>
          <DialogDescription>
            Scan the QR code or enter the URL on your phone to access the presenter view with speaker notes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          {/* QR Code */}
          {qrCodeUrl && (
            <div className="rounded-lg border-2 border-accent/40 p-4 bg-white">
              <img
                src={qrCodeUrl}
                alt="QR Code for mobile access"
                className="w-[250px] h-[250px]"
              />
            </div>
          )}

          {/* URL Display */}
          <div className="w-full space-y-3">
            {localUrl && (
              <div className="rounded-md bg-yellow-500/10 border border-yellow-500/30 p-3 text-sm">
                <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                  ⚠️ Using localhost
                </p>
                <p className="text-muted-foreground text-xs">
                  Your current URL ({localUrl}) won't work on your phone. Check your terminal for the Network URL (e.g., http://192.168.x.x:8082)
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {localUrl ? "Terminal Network URL" : "Network URL"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm break-all">
                {networkUrl}
              </div>
              {!localUrl && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-10 w-10 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="w-full space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Make sure your phone is on the same WiFi network</li>
              {localUrl ? (
                <>
                  <li>Look at your terminal/console where you ran <code className="text-xs bg-muted px-1 py-0.5 rounded">npm run dev</code></li>
                  <li>Find the "Network:" URL (e.g., http://192.168.0.81:8082)</li>
                  <li>Add <code className="text-xs bg-muted px-1 py-0.5 rounded">/presenter</code> to the end</li>
                  <li>Enter that full URL in your phone's browser</li>
                </>
              ) : (
                <>
                  <li>Scan the QR code with your phone's camera</li>
                  <li>Or manually enter the URL in your phone's browser</li>
                </>
              )}
              <li>The notes will sync automatically across all devices</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
