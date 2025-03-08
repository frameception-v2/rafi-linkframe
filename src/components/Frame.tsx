"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useUnifiedInput } from "~/lib/input";
import type { PointerEvent } from "~/lib/input";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { useAccount } from "wagmi";
import { config } from "~/lib/farcaster";
import type { LinkData, ViewState } from "~/lib/constants";
import { usePinnedLinks, useRecentLinks } from "~/lib/data";
import { truncateAddress } from "~/lib/truncateAddress";
import { createStore } from "mipd";
import { UnifiedInputHandler } from "~/lib/input";
import { Label } from "~/components/ui/label";
import { PurpleButton } from "~/components/ui/PurpleButton";
import LinkList from "~/components/LinkList";
import { PROJECT_TITLE } from "~/lib/constants";

function ExampleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to the Frame Template</CardTitle>
        <CardDescription>
          This is an example card that you can customize or remove
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label>Place content in a Card here.</Label>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [swipeProgress, setSwipeProgress] = useState<{ direction: 'left'|'right'|null; progress: number }>({
    direction: null,
    progress: 0
  });

  // Data queries
  const { data: pinnedLinks = [], isLoading: isPinnedLoading } = usePinnedLinks();
  const { data: recentLinks = [], isLoading: isRecentLoading } = useRecentLinks();

  // Show loading state
  if (isPinnedLoading || isRecentLoading) {
    return <div>Loading links...</div>;
  }

  // View state management
  const [viewState, setViewState] = useState<ViewState>(() => {
    // Rehydrate from sessionStorage on initial load
    const savedState = typeof window !== 'undefined' 
      ? sessionStorage.getItem('frameViewState')
      : null;
      
    return savedState 
      ? JSON.parse(savedState) as ViewState
      : {
          currentView: 'main',
          lastInteraction: Date.now(),
          transitionDirection: 'forward',
          previousView: undefined
        } satisfies ViewState;
  });

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");
  const [signResult, setSignResult] = useState<{ 
    hash?: string, 
    error?: string,
    retryCount?: number 
  }>({});
  const [isSigning, setIsSigning] = useState(false);

  const { isConnected, address } = useAccount();
  
  const handleSignMessage = useCallback(async () => {
    if (!isConnected) {
      setSignResult({ error: "Wallet not connected" });
      return;
    }
    
    setIsSigning(true);
    try {
      const result = await sdk.actions.signMessage({
        message: {
          type: 'frame',
          frameUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`,
          postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`,
          state: { timestamp: Date.now() }
        }
      });
      
      // Validate signature
      if (result?.signature) {
        const isValid = await sdk.validateSignature({
          message: result.message,
          signature: result.signature,
          publicKey: result.publicKey
        });
        
        setSignResult(isValid ? 
          { hash: `${result.signature.slice(0, 8)}...${result.signature.slice(-8)}` } : 
          { error: 'Invalid signature' }
        );
      }
    } catch (error) {
      setSignResult(prev => ({
        error: error instanceof Error ? error.message : 'Signing failed',
        retryCount: (prev.retryCount || 0) + 1
      }));
    } finally {
      setIsSigning(false);
    }
  }, []);

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof Error) {
        setAddFrameResult(`Error: ${error.message}`);
      } else {
        setAddFrameResult(`Unknown error occurred`);
      }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      // If frame isn't already added, prompt user to add it
      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
        setViewState(prev => ({
          ...prev,
          currentView: 'main',
          transitionDirection: 'back',
          lastInteraction: Date.now()
        }));
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        console.log("notificationsEnabled", notificationDetails);
      });
      sdk.on("notificationsDisabled", () => {
        console.log("notificationsDisabled");
      });

      sdk.on("primaryButtonClicked", () => {
        console.log("primaryButtonClicked");
      });

      console.log("Calling ready");
      sdk.actions.ready({
        frameImage: `${process.env.NEXT_PUBLIC_BASE_URL}/og.png`,
        postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`,
        buttons: [{ 
          label: 'Get started',
          action: 'post'
        }],
        state: { timestamp: Date.now() },
        aspectRatio: '1.91:1'
      });

      // Set up a MIPD Store, and request Providers.
      const store = createStore();

      // Subscribe to the MIPD Store.
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
        // => [EIP6963ProviderDetail, EIP6963ProviderDetail, ...]
      });
    };
    if (sdk && !isSDKLoaded) {
      console.log("Calling load");
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame, setViewState]);

  const handlePointer = useCallback((event: PointerEvent) => {
    if (event.type === 'start') {
      setTouchStart({
        x: event.x,
        y: event.y,
        time: event.time
      });
    } else if (event.type === 'move') {
      const deltaX = event.x - touchStart.x;
      const deltaY = event.y - touchStart.y;
      
      // Only track horizontal movement
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const containerWidth = window.innerWidth - (context?.client.safeAreaInsets?.left ?? 0) - (context?.client.safeAreaInsets?.right ?? 0);
        const progress = Math.min(Math.max(Math.abs(deltaX) / containerWidth, 0), 1);
        const direction = deltaX > 0 ? 'right' : 'left';
        setSwipeProgress({ direction, progress });
      }
    } else if (event.type === 'end' || event.type === 'cancel') {
      const deltaX = event.x - touchStart.x;
      const deltaY = event.y - touchStart.y;
      const timeDelta = event.time - touchStart.time;
      
      // Only consider horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        const velocity = Math.abs(deltaX) / timeDelta;
        
        // Velocity threshold (0.5px/ms = 500px/s)
        if (velocity > 0.5 || swipeProgress.progress > 0.5) {
          const direction = deltaX > 0 ? 'right' : 'left';
          
          // Update view state based on swipe direction
          setViewState(prev => ({
            ...prev,
            currentView: prev.currentView === 'main' ? 'recent' : 'main',
            lastInteraction: event.time,
            transitionDirection: direction === 'left' ? 'forward' : 'back',
            previousView: prev.currentView
          }));
        }
      }
      // Reset progress after gesture ends
      setSwipeProgress({ direction: null, progress: 0 });
    }
  }, [touchStart]);

  // Persist view state changes to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('frameViewState', JSON.stringify(viewState));
    }
  }, [viewState]);

  const inputRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      const handler = new UnifiedInputHandler(inputRef.current, handlePointer);
      return () => handler.destroy();
    }
  }, [handlePointer]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
        minHeight: '100vh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        // Mobile-first fluid grid
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '1vmax',
        touchAction: 'pan-y' // Allow vertical scroll but prevent horizontal browser scroll
      }}
      className="p-[2vmin]"
      ref={inputRef}
    >
      <main 
        className="flex flex-col gap-[2vmin] w-full relative overflow-hidden"
        style={{
          transform: swipeProgress.direction === 'left' 
            ? `translateX(-${swipeProgress.progress * 20}%)`
            : swipeProgress.direction === 'right'
            ? `translateX(${swipeProgress.progress * 20}%)`
            : undefined,
          transition: swipeProgress.progress === 0 ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {/* Swipe progress indicators */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-neutral-200">
          <div 
            className="h-full bg-purple-500 transition-all duration-150"
            style={{
              width: `${swipeProgress.progress * 100}%`,
              transformOrigin: swipeProgress.direction === 'left' ? 'right' : 'left',
              marginLeft: swipeProgress.direction === 'right' ? '0%' : 'auto',
              marginRight: swipeProgress.direction === 'left' ? '0%' : 'auto'
            }}
          />
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[2vmin]">
          <LinkList
            pinnedLinks={pinnedLinks}
            recentLinks={recentLinks}
            onSwipeLeft={() => setViewState(prev => ({...prev, currentView: 'recent'}))}
            onSwipeRight={() => setViewState(prev => ({...prev, currentView: 'main'}))}
            aria-labelledby="link-list-label"
          />
        </div>

        {/* Message signing section */}
        <div className="mt-8 p-4 border-t border-neutral-200">
          <div className="flex flex-col gap-2">
            <PurpleButton
              onClick={isConnected ? handleSignMessage : () => connect({ connector: config.connectors[0] })}
              disabled={!isConnected || isSigning}
            >
              {isSigning ? 'Signing...' : isConnected ? `Sign as ${truncateAddress(address!)}` : 'Connect Wallet to Sign'}
            </PurpleButton>
            
            {signResult.hash && (
              <div className="text-sm text-green-600">
                Valid signature: {signResult.hash}
              </div>
            )}
            
            {signResult.error && (
              <div className="text-sm text-red-600">
                {signResult.error === "Wallet not connected" 
                  ? "Connect your wallet to sign messages"
                  : `Error: ${signResult.error} (Retries left: ${3 - (signResult.retryCount || 0)})`}
              </div>
              {signResult.retryCount! < 3 && (
                <PurpleButton 
                  onClick={handleSignMessage}
                  className="mt-2"
                >
                  Retry Now
                </PurpleButton>
              )}
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
