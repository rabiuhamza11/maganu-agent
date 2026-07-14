// Maganu AI Creative Service v1.0 — Image Generation + Multilingual Translation
const axios = require('axios');

// === AI IMAGE GENERATION ===
// Uses Pollinations.ai (free, no API key required) + fallback to other services
async function generateImage(prompt, width = 1024, height = 1024) {
  try {
    // Pollinations.ai — free DALL-E alternative
    const seed = Math.floor(Math.random() * 1000000);
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    
    // Verify the image loads
    const res = await axios.head(url, { timeout: 15000 });
    if (res.status === 200) {
      return { success: true, url, prompt, message: `Image generated successfully` };
    }
  } catch (e) {
    // Fallback: try with different service
  }
  
  // Fallback: use a simple placeholder with the prompt
  try {
    const fallbackUrl = `https://api.dicebear.com/7.x/artificial/svg?seed=${encodeURIComponent(prompt).slice(0, 50)}`;
    return { success: false, error: 'Image generation service unavailable', fallbackUrl };
  } catch (e2) {
    return { success: false, error: 'All image services unavailable' };
  }
}

async function handleGenerateImage(args) {
  const prompt = args.join(' ').trim();
  if (!prompt) return `🎨 *AI Image Generation*\n\nUsage: /image [description]\n\nExamples:\n/image professional logo for HarzDM digital marketplace\n/image modern real estate building in Abuja Nigeria\n/image construction site floor plan blueprint\n/image social media ad for digital products marketplace`;
  
  // Parse dimensions if specified (e.g., /image 1024x768 professional logo)
  let width = 1024, height = 1024;
  const dimMatch = prompt.match(/^(\d+)x(\d+)\s+(.*)/);
  let actualPrompt = prompt;
  if (dimMatch) {
    width = parseInt(dimMatch[1]);
    height = parseInt(dimMatch[2]);
    actualPrompt = dimMatch[3];
  }
  
  const result = await generateImage(actualPrompt, width, height);
  if (result.success) {
    return `🎨 *Image Generated*\n\nPrompt: ${actualPrompt}\nSize: ${width}x${height}\n\n🔗 ${result.url}\n\nTap the link to view your image. The link works in any browser.`;
  }
  return `❌ Image generation failed: ${result.error}\n\nPlease try again with a simpler prompt.`;
}

// Preset image generators for ecosystem platforms
async function handleEcoImage(args) {
  const platform = args[0]?.toLowerCase();
  const presets = {
    harzdm: 'Professional digital marketplace logo, modern e-commerce, purple and gold, sleek typography, marketplace icon',
    buildbot: 'AI construction planning platform logo, blueprint and robot, construction industry, blue and orange',
    tradeos: 'Multi-exchange trading platform logo, candlestick charts, modern fintech, green and dark theme',
    omega: 'OMEGA INFINITY enterprise monorepo logo, futuristic, infinity symbol, purple gradient',
    nexal: 'Nexal Media advertising agency logo, megaphone and digital, red and black, bold',
    estate: 'Abuja Estate City real estate logo, modern house, Nigerian flag colors, luxury property',
    apex: 'Apex Bank digital banking logo, secure vault, gold and navy blue, fintech',
    content: 'ContentPilot AI content creation logo, pen and AI brain, purple and white',
    oracle: 'Oracle AI astrology logo, crystal ball and stars, cosmic purple and gold',
    gdeg: 'Global Decentralized Energy Grid logo, energy tokens and blockchain, green and blue',
  };
  
  const preset = presets[platform];
  if (!preset) {
    return `🎨 *Ecosystem Image Generator*\n\nUsage: /ecoimage [platform]\n\nPlatforms:\nharzdm, buildbot, tradeos, omega, nexal, estate, apex, content, oracle, gdeg\n\nExample: /ecoimage harzdm`;
  }
  
  return handleGenerateImage([preset]);
}

// === MULTILINGUAL TRANSLATION ===
const LANGUAGES = {
  hausa: 'Hausa', yoruba: 'Yoruba', igbo: 'Igbo',
  french: 'French', arabic: 'Arabic', spanish: 'Spanish',
  english: 'English', german: 'German', chinese: 'Chinese',
  hindi: 'Hindi', portuguese: 'Portuguese', swahili: 'Swahili',
};

async function translateText(text, from, to) {
  try {
    // Use Google Translate unofficial API (free)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url, { timeout: 10000 });
    const translated = res.data?.[0]?.map(item => item[0]).join('') || '';
    return { success: true, translation: translated, from, to };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function handleTranslate(args) {
  // /translate [to_lang] [text]
  const toLang = args[0]?.toLowerCase();
  const text = args.slice(1).join(' ').trim();
  
  if (!toLang || !text) {
    return `🌍 *Multilingual Translator*\n\nUsage: /translate [language] [text]\n\nLanguages:\nhausa, yoruba, igbo, french, arabic, spanish, english, german, chinese, hindi, portuguese, swahili\n\nExample:\n/translate hausa Welcome to HarzDM marketplace\n/translate french Your business is growing fast`;
  }
  
  if (!LANGUAGES[toLang]) {
    return `❌ Language not supported. Available:\n${Object.keys(LANGUAGES).join(', ')}`;
  }
  
  const result = await translateText(text, 'auto', toLang);
  if (result.success) {
    return `🌍 *Translation (${LANGUAGES[toLang]})*\n\nOriginal: ${text}\n\n${result.translation}`;
  }
  return `❌ Translation failed: ${result.error}`;
}

async function handleLanguages() {
  let msg = `🌍 *Supported Languages*\n\n`;
  Object.entries(LANGUAGES).forEach(([code, name]) => {
    msg += `  /translate ${code} [text] — ${name}\n`;
  });
  msg += `\nExample: /translate yoruba Good morning, how are you?`;
  return msg;
}

module.exports = {
  generateImage, handleGenerateImage, handleEcoImage,
  translateText, handleTranslate, handleLanguages, LANGUAGES,
};
