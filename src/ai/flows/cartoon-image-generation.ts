'use server';

/**
 * @fileOverview A cartoon image generation AI agent.
 *
 * - generateCartoonImage - A function that generates a cartoon image from a text description.
 * - GenerateCartoonImageInput - The input type for the generateCartoonImage function.
 * - GenerateCartoonImageOutput - The return type for the generateCartoonImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCartoonImageInputSchema = z.object({
  textDescription: z
    .string()
    .describe('A description of the scene to generate an image for.'),
});
export type GenerateCartoonImageInput = z.infer<typeof GenerateCartoonImageInputSchema>;

const GenerateCartoonImageOutputSchema = z.object({
  cartoonImageDataUri: z
    .string()
    .describe(
      'The generated cartoon image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type GenerateCartoonImageOutput = z.infer<typeof GenerateCartoonImageOutputSchema>;

export async function generateCartoonImage(
  input: GenerateCartoonImageInput
): Promise<GenerateCartoonImageOutput> {
  return generateCartoonImageFlow(input);
}

const generateCartoonImageFlow = ai.defineFlow(
  {
    name: 'generateCartoonImageFlow',
    inputSchema: GenerateCartoonImageInputSchema,
    outputSchema: GenerateCartoonImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Generate a cartoon-style image for the following scene description: ${input.textDescription}`,
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {cartoonImageDataUri: media.url!};
  }
);
