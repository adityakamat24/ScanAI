import { analyzeImageWithOpenAI } from '../OpenAI';
import * as FileSystem from 'expo-file-system';

describe('analyzeImageWithOpenAI', () => {
  const mockResponse = {
    choices: [{ message: { content: 'ok' } }],
    usage: {}
  };

  beforeEach(() => {
    jest.spyOn(FileSystem, 'readAsStringAsync').mockResolvedValue('YmFzZTY0');
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls fetch with correct URL and body', async () => {
    const imageUrl = 'file:///example/img.png';
    const profile = { foo: 'bar' };

    await analyzeImageWithOpenAI(imageUrl, profile);

    const expectedBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `User Profile: ${JSON.stringify(profile)}` },
            {
              type: 'text',
              text:
                'Extract all ingredients from this image, rate safety A–F, flag child/adult concerns, identify dangerous ingredient pairs (synergy×synergy), and suggest one‑tap “Smarter Swap” alternatives.'
            },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,YmFzZTY0' } }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.2
    };

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expectedBody)
      }
    );
  });
});
