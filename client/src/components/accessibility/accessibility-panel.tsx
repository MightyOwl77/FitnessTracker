import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useAccessibility } from './accessibility-context';
import { Accessibility, X, ZoomIn, EyeOff, Pause } from 'lucide-react';

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    textSize, 
    setTextSize, 
    contrastMode, 
    setContrastMode,
    reduceMotion,
    setReduceMotion
  } = useAccessibility();

  return (
    <div className="accessibility-wrapper">
      {/* Accessibility toggle button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              size="icon"
              variant="secondary"
              className="fixed bottom-4 right-4 z-50 rounded-full shadow-md h-12 w-12"
              aria-label={isOpen ? "Close accessibility panel" : "Open accessibility panel"}
              aria-expanded={isOpen}
              aria-controls="accessibility-panel"
            >
              {isOpen ? <X size={20} /> : <Accessibility size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Close accessibility options" : "Accessibility options"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Accessibility panel */}
      {isOpen && (
        <div
          id="accessibility-panel"
          className="fixed bottom-20 right-4 z-50 p-4 rounded-lg shadow-lg bg-background border-[1px] max-w-xs w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-heading"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="accessibility-heading" className="text-lg font-medium">
              Accessibility Options
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility panel"
            >
              <X size={18} />
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Text Size Option */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ZoomIn size={18} aria-hidden="true" />
                <h3 className="font-medium">Text Size</h3>
              </div>
              <RadioGroup 
                value={textSize} 
                onValueChange={(value) => setTextSize(value as 'default' | 'large' | 'larger')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="text-default" />
                  <Label htmlFor="text-default">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="text-large" />
                  <Label htmlFor="text-large" className="text-lg">Large</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="larger" id="text-larger" />
                  <Label htmlFor="text-larger" className="text-xl">Larger</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            {/* High Contrast Option */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={18} aria-hidden="true" />
                <h3 className="font-medium">Contrast</h3>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="cursor-pointer">
                  High contrast mode
                  <p className="text-xs text-muted-foreground">
                    Improves text visibility
                  </p>
                </Label>
                <Switch
                  id="high-contrast"
                  checked={contrastMode === 'high-contrast'}
                  onCheckedChange={(checked) => 
                    setContrastMode(checked ? 'high-contrast' : 'default')
                  }
                  aria-label="Toggle high contrast mode"
                />
              </div>
            </div>

            <Separator />

            {/* Reduce Motion Option */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pause size={18} aria-hidden="true" />
                <h3 className="font-medium">Animation</h3>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="cursor-pointer">
                  Reduce motion
                  <p className="text-xs text-muted-foreground">
                    Minimizes animations
                  </p>
                </Label>
                <Switch
                  id="reduce-motion"
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                  aria-label="Toggle reduced motion"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-center text-muted-foreground">
            <p>Your preferences are automatically saved</p>
          </div>
        </div>
      )}
    </div>
  );
}