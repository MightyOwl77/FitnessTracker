import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { FitnessLoading, FitnessLoadingAnimation } from "@/components/ui/fitness-loading-animation";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LoadingTest() {
  const [animationType, setAnimationType] = useState<'lifting' | 'cardio' | 'progress' | 'weight' | 'random'>('random');
  const [animationSize, setAnimationSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Fitness Loading Animations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Animation Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Animation Type</label>
                <Select
                  value={animationType}
                  onValueChange={(value) => setAnimationType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifting">Weight Lifting</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="weight">Weight Loss</SelectItem>
                    <SelectItem value="random">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Animation Size</label>
                <div className="flex space-x-4">
                  <Button
                    variant={animationSize === 'sm' ? 'default' : 'outline'}
                    onClick={() => setAnimationSize('sm')}
                    size="sm"
                  >
                    Small
                  </Button>
                  <Button
                    variant={animationSize === 'md' ? 'default' : 'outline'}
                    onClick={() => setAnimationSize('md')}
                    size="sm"
                  >
                    Medium
                  </Button>
                  <Button
                    variant={animationSize === 'lg' ? 'default' : 'outline'}
                    onClick={() => setAnimationSize('lg')}
                    size="sm"
                  >
                    Large
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Custom Message</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter a custom loading message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={() => setShowFullscreen(true)} className="w-full">
                  Show Fullscreen Loading
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Animation Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[300px]">
            <FitnessLoadingAnimation 
              type={animationType}
              size={animationSize}
              message={customMessage || undefined}
            />
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">All Animation Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-4">Weight Lifting</h3>
              <FitnessLoadingAnimation type="lifting" size="md" showMessage={false} />
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-4">Cardio</h3>
              <FitnessLoadingAnimation type="cardio" size="md" showMessage={false} />
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-4">Progress</h3>
              <FitnessLoadingAnimation type="progress" size="md" showMessage={false} />
            </div>
            
            <div className="flex flex-col items-center">
              <h3 className="font-medium mb-4">Weight Loss</h3>
              <FitnessLoadingAnimation type="weight" size="md" showMessage={false} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Usage Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="component">
            <TabsList className="mb-4">
              <TabsTrigger value="component">Component</TabsTrigger>
              <TabsTrigger value="loading-state">LoadingState</TabsTrigger>
              <TabsTrigger value="fullscreen">Fullscreen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="component">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
                {`import { FitnessLoadingAnimation } from "@/components/ui/fitness-loading-animation";

// Basic usage
<FitnessLoadingAnimation />

// With specific type
<FitnessLoadingAnimation type="cardio" />

// With custom size and message
<FitnessLoadingAnimation type="progress" size="lg" message="Processing your workout data..." />`}
              </pre>
            </TabsContent>
            
            <TabsContent value="loading-state">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
                {`import { LoadingState } from "@/components/ui/loading-state";

// Basic usage
<LoadingState />

// With specific type
<LoadingState type="lifting" message="Building your strength program..." />

// With size
<LoadingState type="progress" size="lg" message="Almost there..." />`}
              </pre>
            </TabsContent>
            
            <TabsContent value="fullscreen">
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
                {`import { FitnessLoading } from "@/components/ui/fitness-loading-animation";

// Fullscreen loading overlay
<FitnessLoading 
  type="cardio"
  message="Getting your heart pumping..."
  fullScreen={true}
/>`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {showFullscreen && (
        <FitnessLoading
          type={animationType}
          size={animationSize}
          message={customMessage || undefined}
          fullScreen={true}
        />
      )}
      
      {showFullscreen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={() => setShowFullscreen(false)}
            variant="destructive"
          >
            Close Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
}