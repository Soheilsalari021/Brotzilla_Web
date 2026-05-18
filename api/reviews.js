export default async function handler(req, res) {
    // Der geheime Schlüssel wird aus den Vercel-Umgebungsvariablen geladen
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const PLACE_ID = 'ChIJMaH56hgvmEcRP4MMML00W54';

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Google API Key ist nicht konfiguriert.' });
    }

    try {
        const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,reviews&languageCode=de&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url, { headers: { 'X-Goog-Api-Key': GOOGLE_API_KEY } });
        
        if (!response.ok) {
            throw new Error(`Google API Fehler: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Caching aktivieren (z.B. für 1 Tag), um Vercel und Google API zu entlasten
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
        res.status(200).json(data);
    } catch (error) {
        console.error('Fehler beim Laden der Google Bewertungen:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Bewertungen' });
    }
}
