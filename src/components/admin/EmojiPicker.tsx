
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  selectedEmoji?: string;
}

const EmojiPicker = ({ onEmojiSelect, selectedEmoji }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const emojiCategories = [
    {
      name: 'الوجوه والعواطف',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳']
    },
    {
      name: 'الأشياء والرموز',
      emojis: ['💄', '💋', '👑', '💍', '💎', '🌹', '🌸', '🌺', '🌻', '🌷', '💐', '🎀', '🎁', '💝', '🛍️', '👜', '💳', '✨', '⭐', '🌟', '💫', '⚡', '🔥', '💧', '🌈']
    },
    {
      name: 'الطعام والشراب',
      emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅']
    },
    {
      name: 'الأنشطة والهوايات',
      emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊']
    },
    {
      name: 'السفر والأماكن',
      emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '✈️', '🛫', '🛬', '🪂']
    },
    {
      name: 'المنزل والطبيعة',
      emojis: ['🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋', '🌳']
    }
  ];

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-16 h-16 text-2xl">
          {selectedEmoji || '📝'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>اختر إيموجي</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-4">
            {emojiCategories.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="font-medium mb-2 text-sm text-muted-foreground">
                  {category.name}
                </h3>
                <div className="grid grid-cols-8 gap-1">
                  {category.emojis.map((emoji, emojiIndex) => (
                    <Button
                      key={emojiIndex}
                      type="button"
                      variant="ghost"
                      className="w-8 h-8 p-0 text-lg hover:bg-accent"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EmojiPicker;
