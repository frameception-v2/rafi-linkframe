"use client";

import { useEffect, useCallback, useState, useReducer } from "react";
import sdk from "@farcaster/frame-sdk";
import type { FrameContext } from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";

import { config } from "~/wagmi.config"; 
import type { LinkData } from "~/lib/constants";
import { truncateAddress } from "~/lib/truncateAddress";
import { base } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
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
  const [swipeDirection, setSwipeDirection] = useState<'left'|'right'|null>(null);
  
  // View state management
  const [viewState, setViewState] = useState({
    currentView: 'main',
    lastInteraction: Date.now(),
  } as const);

  const [added, setAdded] = useState(false);

  const [addFrameResult, setAddFrameResult] = useState("");

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
        buttons: [{ label: 'Get started' }],
        state: { timestamp: Date.now() }
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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const timeDelta = Date.now() - touchStart.time;
    
    // Only consider horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      const velocity = Math.abs(deltaX) / timeDelta;
      
      // Velocity threshold (0.5px/ms = 500px/s)
      if (velocity > 0.5) {
        const direction = deltaX > 0 ? 'right' : 'left';
        setSwipeDirection(direction);
        
        // Update view state based on swipe direction
        setViewState(prev => ({
          currentView: prev.currentView === 'main' ? 'recent' : 'main',
          lastInteraction: Date.now(),
          transitionDirection: direction === 'left' ? 'forward' : 'back'
        }));
      }
    }
  }, [touchStart]);

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <main className="flex flex-col gap-[2vmin] w-full">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[2vmin]">
          <LinkList
            pinnedLinks={[]} // TODO: Connect to real data
            recentLinks={[]} // TODO: Connect to real data
          />
        </div>
      </main>
    </div>
  );
}
