"use client";

import { type LinkData } from "~/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";

interface LinkListProps {
  pinnedLinks: LinkData[];
  recentLinks: LinkData[];
}

export default function LinkList({ pinnedLinks, recentLinks }: LinkListProps) {
  const [swipeStart, setSwipeStart] = useState(0);
  const [swipeDelta, setSwipeDelta] = useState(0);

  const handleTouchStart = (e: TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
    setSwipeDelta(0);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setSwipeDelta(e.touches[0].clientX - swipeStart);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeDelta) > 50) { // Minimum swipe threshold
      // TODO: Connect to ViewManager transition
      console.log('Swiped', swipeDelta > 0 ? 'right' : 'left');
    }
    setSwipeDelta(0);
  };

  return (
    <div 
      className="grid gap-4 w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pinned Links */}
      {pinnedLinks.length > 0 && (
        <div className="grid gap-2">
          <Label className="text-lg font-semibold">Pinned Links</Label>
          {pinnedLinks.map((link) => (
            <Card key={link.url} className="p-4">
              <a href={link.url} className="flex items-center gap-2">
                <span className="flex-1 truncate">{link.title}</span>
                <span className="i-lucide-arrow-up-right text-primary/50" />
              </a>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Links */}
      <div className="grid gap-2">
        <Label className="text-lg font-semibold">Recent Links</Label>
        {recentLinks.map((link) => (
          <Card key={link.url} className="p-4">
            <a href={link.url} className="flex items-center gap-2">
              <span className="flex-1 truncate">{link.title}</span>
              <span className="i-lucide-arrow-up-right text-primary/50" />
            </a>
          </Card>
        ))}
      </div>
    </div>
  );
}
