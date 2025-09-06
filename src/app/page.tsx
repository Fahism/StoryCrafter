'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import type { StoryPart } from './actions';
import { continueStoryAction } from './actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { SparklesIcon } from '@/components/icons';
import { Loader2 } from 'lucide-react';


const initialStory: StoryPart[] = [
  {
    id: 1,
    text: "In a land of sparkling rivers and candy-colored trees, a little fox named Felix found a mysterious, glowing key. He wondered what it might unlock...",
    imageUrl: 'https://picsum.photos/seed/magical-castle/600/400',
    imageHint: 'magical castle',
  },
];

export default function Home() {
  const [storyParts, setStoryParts] = useState<StoryPart[]>(initialStory);
  const [userInput, setUserInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const storyEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [storyParts]);

  const handleStoryContinue = (formData: FormData) => {
    const currentInput = formData.get('userInput') as string;
    if (!currentInput.trim()) {
      toast({
        variant: "destructive",
        title: "Whoops!",
        description: "Please write your part of the story first.",
      });
      return;
    }

    startTransition(async () => {
      const storySoFar = storyParts.map(p => p.text).join('\n\n');
      const result = await continueStoryAction(storySoFar, currentInput);

      if (result.error) {
        if (result.error === 'AI_EMPTY_RESPONSE') {
          toast({
            variant: "destructive",
            title: "The storyteller is stumped!",
            description: "Try writing something else to spark their imagination.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Oh no!",
            description: "The magic ink seems to be fading… please try again.",
          });
        }
      } else if (result.data) {
        setStoryParts(prev => [
          ...prev,
          { ...result.data!, id: prev.length + 1 },
        ]);
        setUserInput('');
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="py-8 px-4 text-center">
        <h1 className="text-5xl font-bold font-headline text-primary tracking-tight">
          StoryCrafter
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Let's create a magical story together!
        </p>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="space-y-12">
          {storyParts.map((part, index) => (
            <div
              key={part.id}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="md:w-1/2 w-full">
                <Card className="overflow-hidden shadow-lg border-2 border-border/50 hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                  <CardContent className="p-0">
                    {part.videoUrl ? (
                      <video
                        src={part.videoUrl}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover aspect-[3/2]"
                        data-ai-hint={part.imageHint}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : part.imageUrl ? (
                       <Image
                        src={part.imageUrl}
                        alt={`Illustration for story part ${part.id}`}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover aspect-[3/2]"
                        data-ai-hint={part.imageHint}
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full aspect-[3/2] bg-muted flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2 w-full space-y-4">
                <p className="text-xl/relaxed lg:text-2xl/loose">{part.text}</p>
                {part.audioUrl && (
                  <div className="flex items-center gap-4">
                     <audio controls src={part.audioUrl} className="w-full">
                       Your browser does not support the audio element.
                     </audio>
                  </div>
                )}
              </div>
            </div>
          ))}
           {isPending && (
            <div
              className={`flex flex-col md:flex-row items-center gap-8`}
            >
              <div className="md:w-1/2 w-full">
                <Card className="overflow-hidden shadow-lg border-2 border-border/50 hover:shadow-primary/20 transition-shadow duration-300 rounded-xl">
                   <CardContent className="p-0">
                      <div className="w-full aspect-[3/2] bg-muted flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <SparklesIcon className="mx-auto h-12 w-12 mb-2" />
                          <p>Animating the story...</p>
                        </div>
                      </div>
                   </CardContent>
                </Card>
              </div>
              <div className="md:w-1/2 w-full space-y-4">
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-1/2 animate-pulse"></div>
                  <div className="h-6 bg-muted rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
           )}
        </div>
        <div ref={storyEndRef} />
      </main>

      <footer className="sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 mt-8 border-t border-border">
        <div className="container mx-auto px-4">
          <form action={handleStoryContinue} className="space-y-4">
            <Textarea
              name="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Write your part of the story here..."
              className="w-full min-h-[100px] text-lg rounded-lg shadow-inner bg-input focus:ring-2 focus:ring-primary"
              disabled={isPending}
            />
            <Button
              type="submit"
              className="w-full text-xl py-6 rounded-lg font-bold"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <SparklesIcon className="mr-2 h-6 w-6" />
                  Weaving your magic...
                </>
              ) : (
                "What Happens Next?"
              )}
            </Button>
          </form>
        </div>
      </footer>
    </div>
  );
}
