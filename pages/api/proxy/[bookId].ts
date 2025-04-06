import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const { bookId, page } = req.query;
    const clientId = req.headers["x-client-id"];

    if (typeof bookId !== 'string') {
        return res.status(400).json({ error: "Invalid bookId" });
    }

    const pageValue = typeof page === 'string' ? page : '0';
    const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/books/${bookId}/stream?page=${pageValue}`;

    try {
        const response = await fetch(backendUrl, {
            headers: {
                "X-Client-Id": clientId as string,
            },
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch audio" });
        }

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("X-Next-Offset", response.headers.get("X-Next-Offset") || '');
        response.body?.pipe(res);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
}