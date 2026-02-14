import { json } from '@sveltejs/kit';
import OpenAI from 'openai';

export async function POST({ request, platform }) {
	try {
		const apiKey = platform?.env?.KIMI_API_KEY;

		if (!apiKey) {
			return json({ success: false, error: 'API key not configured' }, { status: 500 });
		}

		const kimi = new OpenAI({
			apiKey: platform.env.KIMI_API_KEY,
			baseURL: 'https://api.moonshot.ai/v1'
		});

		const { currentHtml, instruction, history } = await request.json();

		const messages = [
			{
				role: 'system',
				content: `You are a precise website editor. You receive the current HTML and a change request.

You must respond with ONLY a JSON array of search-and-replace operations. Each operation is an object with "search" and "replace" keys.

- "search" must be an EXACT substring from the current HTML (copy it character-for-character).
- "replace" is what it should be changed to.
- Use as few operations as possible.
- Only change what is necessary to fulfill the request.
- Make sure search strings are unique enough to match only once.

Example response:
[
  { "search": "background-color: red", "replace": "background-color: blue" },
  { "search": "<h1>Old Title</h1>", "replace": "<h1>New Title</h1>" }
]

ONLY output valid JSON. No markdown, no explanation, no code fences.`
			}
		];

		for (const msg of history) {
			if (msg.role === 'user') {
				messages.push({ role: 'user', content: msg.content });
			}
		}

		messages.push({
			role: 'user',
			content: `Here is the current HTML:\n\n${currentHtml}\n\n---\n\nApply this change: ${instruction}`
		});

		const completion = await kimi.chat.completions.create({
			model: 'kimi-k2.5',
			messages
		});

		let raw = completion.choices[0].message.content;
		raw = raw
			.replace(/```json\n?/g, '')
			.replace(/```\n?/g, '')
			.trim();

		let operations;
		try {
			operations = JSON.parse(raw);
		} catch {
			return json({ success: false, error: 'Model returned invalid JSON' }, { status: 500 });
		}

		if (!Array.isArray(operations) || operations.length === 0) {
			return json({ success: false, error: 'No valid operations returned' }, { status: 500 });
		}

		let result = currentHtml;
		let appliedCount = 0;

		for (const op of operations) {
			if (!op.search || typeof op.replace !== 'string') continue;

			if (result.includes(op.search)) {
				result = result.replace(op.search, op.replace);
				appliedCount++;
			}
		}

		if (appliedCount === 0) {
			return json(
				{
					success: false,
					error: 'Could not apply changes — no matching content found'
				},
				{ status: 500 }
			);
		}

		return json({ success: true, result });
	} catch (error) {
		console.error('Kimi API error:', error);
		return json(
			{
				success: false,
				error: `${error.name}: ${error.message}`
			},
			{ status: 500 }
		);
	}
}
