import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useAccessibility } from './accessibility-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings } from 'lucide-react';

export function AccessibilityPanel() {
  const { 
    textSize, setTextSize,
    contrastMode, setContrastMode,
    reduceMotion, setReduceMotion
  } = useAccessibility();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-md"
          aria-label="Accessibility Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-none shadow-none">
          <CardHeader className="pb-3">
            <CardTitle>Accessibility Settings</CardTitle>
            <CardDescription>
              Customize your experience for better accessibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Text Size</h3>
              <RadioGroup 
                value={textSize} 
                onValueChange={(v) => setTextSize(v as 'default' | 'large' | 'larger')}
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="textSize-default" />
                  <Label htmlFor="textSize-default">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="textSize-large" />
                  <Label htmlFor="textSize-large">Large</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="larger" id="textSize-larger" />
                  <Label htmlFor="textSize-larger">Larger</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Contrast</h3>
              <RadioGroup 
                value={contrastMode}
                onValueChange={(v) => setContrastMode(v as 'default' | 'high-contrast')}
                className="flex"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="default" id="contrast-default" />
                  <Label htmlFor="contrast-default">Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high-contrast" id="contrast-high" />
                  <Label htmlFor="contrast-high">High Contrast</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={reduceMotion}
                onCheckedChange={setReduceMotion}
                aria-label="Reduce motion"
              />
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}