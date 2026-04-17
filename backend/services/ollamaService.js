const { Ollama } = require('ollama');

console.log('[OllamaService] Initializing Ollama client...');
const ollama = new Ollama({ host: 'http://localhost:11434' });

async function validateContent(text) {
  console.log('[OllamaService] Validating content:', text?.substring(0, 50));

  const prompt = `
    Analyze the following text for abusive language, profanity, or hate speech.
    Text: "${text}"

    Return ONLY a JSON object:
    {
      "status": "accepted" | "rejected",
      "abusiveWords": ["list", "of", "words"],
      "censoredText": "The text with abusive words replaced by asterisks (e.g., ****)",
      "explanation": "Brief reason for rejection or acceptance"
    }
  `;

  try {
    const response = await ollama.generate({
      model: 'phi3:mini',
      prompt: prompt,
      format: 'json',
      stream: false
    });
    const parsed = JSON.parse(response.response);
    return {
      status: parsed.status,
      abusiveWords: parsed.abusiveWords || [],
      censoredText: parsed.censoredText || text,
      explanation: parsed.explanation || ''
    };
  } catch (error) {
    console.error('[OllamaService] Content Validation Error:', error.message);
    throw error;
  }
}

async function validateProfile(profileData) {
  const name = profileData?.name?.toLowerCase() || '';
  const about = profileData?.aboutMe?.toLowerCase() || '';
  const fatherOcc = profileData?.fatherOccupation?.toLowerCase() || '';

  // 1. INSTANT PRE-FLIGHT CHECK (Zero Latency)
  const preFlightIssues = [];
  if (name === 'dog' || name === 'cat' || name.length < 2) {
    preFlightIssues.push({ field: 'name', issue: 'Invalid or nonsensical name detected.', severity: 'High' });
  }
  if (name.split(' ')[0] === name.split(' ')[1]) {
    preFlightIssues.push({ field: 'name', issue: 'Repetitive name detected.', severity: 'High' });
  }
  if (about.includes('lorem ipsum') || about.includes('consectetur adipiscing')) {
    preFlightIssues.push({ field: 'aboutMe', issue: 'Contains placeholder Lorem Ipsum text.', severity: 'High' });
  }
  if (fatherOcc.includes('test') || fatherOcc === 'na') {
    preFlightIssues.push({ field: 'fatherOccupation', issue: 'Placeholder test value detected.', severity: 'High' });
  }

  // If we found critical issues, we can return immediately or still ask AI for a "deep check"
  // For maximum speed, return immediately if issues are severe
  if (preFlightIssues.length > 0) {
    console.log('[OllamaService] Pre-flight caught issues, skipping AI for speed.');
    return {
      status: 'Fake',
      authenticityScore: 10,
      reasoning: preFlightIssues,
      summary: 'INSTANT AUDIT: Profile contains clear placeholder or dummy data.'
    };
  }

  console.log('[OllamaService] Starting AI audit for:', profileData?.name);

  const prompt = `
    Audit this profile for authenticity.
    Data: ${JSON.stringify(profileData)}

    Rules:
    - Flag ANY inconsistencies or placeholder patterns.
    - Return ONLY JSON.

    Format:
    { "status": "Genuine"|"Suspicious"|"Fake", "authenticityScore": 0-100, "reasoning": [{"field": "string", "issue": "string", "severity": "High"|"Medium"|"Low"}], "summary": "string" }
  `;

  try {
    const response = await ollama.generate({
      model: 'phi3:mini',
      prompt: prompt,
      format: 'json',
      stream: false
    });
    const parsed = JSON.parse(response.response);

    // Normalize reasoning items to prevent frontend crashes
    if (parsed.reasoning && Array.isArray(parsed.reasoning)) {
      parsed.reasoning = parsed.reasoning.map(item => ({
        ...item,
        severity: item.severity || 'Low'
      }));
    }

    return parsed;
  } catch (error) {
    console.error('[OllamaService] Profile Validation Error:', error.message);
    throw error;
  }
}

module.exports = { validateContent, validateProfile };
