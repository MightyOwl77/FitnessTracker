import React, { useState } from 'react';
import { 
  IOSSegmentedControl, 
  IOSCard, 
  IOSBottomSheet,
  IOSActionButton,
  IOSPullToRefresh
} from './ios-optimized';
import { useIsIOS, useDeviceInfo } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Plus, Award, Heart, Star, BarChart, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

/**
 * Award-winning iOS Optimized Demo
 * 
 * This component showcases all the iOS-optimized components and animations
 * for a truly premium native-feeling iOS experience.
 */
export function AwardWinningIOSDemo() {
  const isIOS = useIsIOS();
  const { hasNotch } = useDeviceInfo();
  const [view, setView] = useState<'design' | 'components'>('components');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rating, setRating] = useState(0);
  
  const handleRefresh = async () => {
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Refreshed!",
      description: "All data has been refreshed",
      className: isIOS ? "ios-toast" : "",
    });
  };
  
  const displaySuccessToast = () => {
    toast({
      title: "Success!",
      description: "Your award-winning action has been recorded",
      variant: "default",
      className: isIOS ? "ios-toast" : "",
    });
  };
  
  return (
    <div className={cn(
      "p-4 max-w-md mx-auto space-y-6",
      isIOS && "ios-font-smoothing",
      hasNotch && "pt-[env(safe-area-inset-top)]"
    )}>
      <div className="text-center">
        <h1 className={cn(
          "text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent",
          isIOS && "text-3xl tracking-tight"
        )}>
          Award-Winning Features
        </h1>
        <p className={cn(
          "text-muted-foreground mt-2",
          isIOS && "text-base"
        )}>
          iOS-optimized for the perfect fitness experience
        </p>
      </div>
      
      <IOSSegmentedControl
        options={[
          { value: 'components', label: 'Components' },
          { value: 'design', label: 'Design' }
        ]}
        value={view as 'design' | 'components'}
        onChange={(v) => setView(v)}
        className="mb-6"
      />
      
      <IOSPullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4">
          {view === 'components' ? (
            <>
              <IOSCard>
                <CardHeader>
                  <CardTitle className={cn(isIOS && "text-xl")}>iOS Components</CardTitle>
                  <CardDescription>Native-feeling iOS components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-1",
                      isIOS && "mb-2"
                    )}>
                      Fitness Goal
                    </label>
                    <Input 
                      placeholder="e.g. Lose 10 pounds" 
                      className={cn(isIOS && "ios-element")}
                    />
                  </div>
                  
                  <div>
                    <label className={cn(
                      "block text-sm font-medium mb-1",
                      isIOS && "mb-2"
                    )}>
                      Notes
                    </label>
                    <Textarea 
                      placeholder="Add your fitness notes here..." 
                      className={cn(isIOS && "ios-element")}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant={isIOS ? "ios" : "default"}
                      size={isIOS ? "ios" : "default"}
                      className={cn(
                        "flex-1",
                        isIOS && "ios-button"
                      )}
                      onClick={displaySuccessToast}
                    >
                      <Star className="w-4 h-4 mr-1" /> Save Goal
                    </Button>
                  </div>
                </CardContent>
              </IOSCard>
              
              <div className={cn(
                "mt-8 rounded-xl p-4 bg-primary/5 border",
                isIOS && "rounded-2xl"
              )}>
                <h3 className={cn(
                  "font-medium mb-2",
                  isIOS && "text-lg"
                )}>
                  Premium iOS Experience
                </h3>
                <ul className={cn(
                  "space-y-2",
                  isIOS && "ios-list-group"
                )}>
                  {[
                    "Native-feeling animations",
                    "Momentum scrolling support",
                    "Safe area support for notched devices",
                    "44px minimum touch targets",
                    "iOS-specific gesture handling"
                  ].map((feature, i) => (
                    <li key={i} className={cn(
                      "flex items-center text-sm",
                      isIOS && "ios-list-item py-2 text-base"
                    )}>
                      <Award className="w-4 h-4 mr-2 text-primary" /> {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => setSheetOpen(true)}
                  variant="secondary"
                  className="w-full mt-4"
                >
                  Open Award Sheet
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <IOSCard>
                <CardHeader>
                  <CardTitle className={cn(isIOS && "text-xl")}>iOS Design</CardTitle>
                  <CardDescription>Award-worthy interface elements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={cn(
                            "p-2 transition-all",
                            isIOS && "ios-no-callout rounded-full active:scale-110",
                            rating >= star ? "text-yellow-500" : "text-gray-300"
                          )}
                        >
                          <Star className={cn(
                            "w-6 h-6",
                            rating >= star && "fill-yellow-500",
                            isIOS && rating >= star && "animate-pulse"
                          )} />
                        </button>
                      ))}
                    </div>
                    
                    <p className="text-center text-sm text-muted-foreground">
                      {rating === 0 ? "Rate your experience" : 
                       rating === 5 ? "Perfect! Thanks for the 5 stars!" :
                       `You rated ${rating} ${rating === 1 ? 'star' : 'stars'}`}
                    </p>
                    
                    <div className={cn(
                      "mt-4 bg-primary/10 p-3 rounded-lg",
                      isIOS && "ios-card p-4 rounded-xl"
                    )}>
                      <h4 className="font-medium">Why this app will win awards:</h4>
                      <ul className="mt-2 space-y-1 text-sm">
                        <li className="flex items-center">
                          <ArrowUp className="text-green-500 w-4 h-4 mr-2" />
                          Superior iOS optimizations
                        </li>
                        <li className="flex items-center">
                          <ArrowUp className="text-green-500 w-4 h-4 mr-2" />
                          Native-feeling animations & transitions
                        </li>
                        <li className="flex items-center">
                          <ArrowUp className="text-green-500 w-4 h-4 mr-2" />
                          Best-in-class form elements
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </IOSCard>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={isIOS ? "ios" : "default"}
                  size={isIOS ? "ios" : "default"}
                  className={cn(isIOS && "ios-button h-14")}
                  onClick={displaySuccessToast}
                >
                  <Heart className="mr-1" /> Like
                </Button>
                
                <Button 
                  variant={isIOS ? "secondary" : "outline"}
                  size={isIOS ? "ios" : "default"}
                  className={cn(isIOS && "ios-button h-14")}
                  onClick={() => setSheetOpen(true)}
                >
                  <BarChart className="mr-1" /> Stats
                </Button>
              </div>
            </div>
          )}
        </div>
      </IOSPullToRefresh>
      
      {/* iOS Bottom Sheet */}
      <IOSBottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Award-Winning Features"
      >
        <div className="space-y-4 pb-6">
          <p className="text-center text-muted-foreground">
            This app uses the latest iOS design principles to create a truly
            native feeling experience.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { icon: <Star className="w-5 h-5" />, label: "Premium Design" },
              { icon: <Heart className="w-5 h-5" />, label: "Engaging UI" },
              { icon: <BarChart className="w-5 h-5" />, label: "Progress Tracking" },
              { icon: <Award className="w-5 h-5" />, label: "Award-Worthy" }
            ].map((item, i) => (
              <div 
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg",
                  isIOS && "ios-card rounded-xl"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2",
                  isIOS && "ios-element"
                )}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
          
          <Button
            className="w-full mt-6"
            variant={isIOS ? "ios" : "default"}
            size={isIOS ? "ios-lg" : "lg"}
            onClick={() => {
              setSheetOpen(false);
              displaySuccessToast();
            }}
          >
            Continue
          </Button>
        </div>
      </IOSBottomSheet>
      
      {/* Floating Action Button (iOS style) */}
      <IOSActionButton
        onClick={displaySuccessToast}
        icon={<Plus />}
        label="Add Exercise"
      />
    </div>
  );
}