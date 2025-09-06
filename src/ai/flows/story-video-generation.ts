'use server';

/**
 * @fileOverview A story video generation AI agent.
 *
 * - generateStoryVideo - A function that generates a video from a text description.
 * - GenerateStoryVideoInput - The input type for the generateStoryVideo function.
 * - GenerateStoryVideoOutput - The return type for the generateStoryVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {downloadVideo} from '@/lib/video-utils';

const GenerateStoryVideoInputSchema = z.object({
  textDescription: z
    .string()
    .describe('A description of the scene to generate a video for.'),
});
export type GenerateStoryVideoInput = z.infer<
  typeof GenerateStoryVideoInputSchema
>;

const GenerateStoryVideoOutputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "The generated video as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateStoryVideoOutput = z.infer<
  typeof GenerateStoryVideoOutputSchema
>;

export async function generateStoryVideo(
  input: GenerateStoryVideoInput
): Promise<GenerateStoryVideoOutput> {
  return generateStoryVideoFlow(input);
}

const generateStoryVideoFlow = ai.defineFlow(
  {
    name: 'generateStoryVideoFlow',
    inputSchema: GenerateStoryVideoInputSchema,
    outputSchema: GenerateStoryVideoOutputSchema,
  },
  async input => {
    let {operation} = await ai.generate({
      model: 'googleai/veo-2.0-generate-001',
      prompt: `Generate a whimsical, kid-friendly animated video for the following scene: ${input.textDescription}`,
      config: {
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }

    const video = operation.output?.message?.content.find(p => !!p.media);
    if (!video?.media?.url) {
      throw new Error('Failed to find the generated video');
    }

    const videoBase64 = await downloadVideo(video.media);
    const videoDataUri = `data:video/mp4;base64,${videoBase64}`;

    return {videoDataUri};
  }
);
