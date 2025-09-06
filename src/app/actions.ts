'use server';

import { generateStoryVideo } from '@/ai/flows/story-video-generation';
import { continueStoryFlow } from '@/ai/flows/story-continuation';
import { textToSpeech } from '@/ai/flows/text-to-speech';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export interface StoryPart {
  id: number;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  imageHint?: string;
}

const imagePromptGenerator = ai.definePrompt({
  name: 'imagePromptGenerator',
  input: {
    schema: z.object({
      storyText: z.string(),
    }),
  },
  output: {
    schema: z.object({
      prompt: z.string(),
    }),
  },
  prompt:
    'Extract a concise, visually descriptive prompt for an image generation model from the following story text. Focus on characters, objects, and the environment. The prompt should be a single phrase. For example, if the text is "A brave knight entered a dark cave where a dragon slept on a pile of gold", a good prompt would be "A brave knight in a dark cave with a sleeping dragon and gold.".\n\nStory: {{{storyText}}}\n\nImage Prompt:',
});

export async function continueStoryAction(
  storySoFar: string, // This is no longer used but let's not change the signature now
  userInput: string
): Promise<{ data: Omit<StoryPart, 'id'> | null; error: string | null }> {
  try {
    const { storyContinuation } = await continueStoryFlow({ storySoFar: userInput });

    if (!storyContinuation || storyContinuation.trim() === '') {
      return { data: null, error: 'AI_EMPTY_RESPONSE' };
    }

    let videoUrl: string | undefined;
    let imageUrl: string | undefined;
    let imageHint: string | undefined;
    let audioUrl: string | undefined;

    try {
      const { output } = await imagePromptGenerator({ storyText: storyContinuation });

      if (output && output.prompt) {
        imageHint = output.prompt;
        try {
          const { videoDataUri } = await generateStoryVideo({ textDescription: output.prompt });
          videoUrl = videoDataUri;
        } catch (videoError) {
          console.error('Video generation failed, falling back to image.', videoError);
          imageUrl = `https://picsum.photos/600/400?random=${Math.random()}`;
          // The imageHint is already set, so we can use it.
        }
      } else {
        // Fallback if prompt generation fails
        console.error('Image prompt generation failed, using placeholder image.');
        imageHint = 'fantasy magical';
        imageUrl = `https://picsum.photos/600/400?random=${Math.random()}`;
      }
    } catch (e) {
      console.error('Media generation failed, using placeholder.', e);
      imageHint = 'fantasy magical';
      imageUrl = `https://picsum.photos/600/400?random=${Math.random()}`;
    }

    try {
      const { audioDataUri } = await textToSpeech({ text: storyContinuation });
      audioUrl = audioDataUri;
    } catch (audioError) {
      console.error('Audio generation failed.', audioError);
      // We can proceed without audio.
    }

    return { data: { text: storyContinuation, videoUrl, imageUrl, audioUrl, imageHint }, error: null };
  } catch (error) {
    console.error('Story continuation action failed:', error);
    return { data: null, error: 'API_FAILURE' };
  }
}
