import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { input, language } = await request.json();
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    try {
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': apiKey,
                'X-Goog-Language-Code': language || 'en',
            },
            body: JSON.stringify({
                input: input,
                includedRegionCodes: ['kr'],
                // Optional: locationBias or locationRestriction
            }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch autocomplete' }, { status: 500 });
    }
}
