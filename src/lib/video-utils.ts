import type { MediaPart } from 'genkit';

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      console.warn(`Fetch failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Fetch failed with error. Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function downloadVideo(media: MediaPart): Promise<string> {
  if (!media.url) {
    throw new Error('Media part does not have a URL.');
  }

  // Add API key before fetching the video if it's not already there.
  let downloadUrl = media.url;
  if (
    !downloadUrl.includes('key=') &&
    process.env.GEMINI_API_KEY
  ) {
    downloadUrl = `${downloadUrl}&key=${process.env.GEMINI_API_KEY}`;
  }

  const videoDownloadResponse = await fetchWithRetry(downloadUrl, {});

  if (!videoDownloadResponse.ok) {
    const errorText = await videoDownloadResponse.text();
    throw new Error(
      `Failed to fetch video: ${videoDownloadResponse.statusText}. Details: ${errorText}`
    );
  }

  const buffer = await videoDownloadResponse.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}
