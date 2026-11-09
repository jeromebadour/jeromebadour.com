// The services that fetch a page to draw its link preview when the address is pasted into a chat or a post. Their
// fetch is not a person opening the page, so a proposal page doesn't count it as an open.
const PREVIEW = /discordbot|slackbot|slack-imgproxy|twitterbot|facebookexternalhit|facebot|linkedinbot|whatsapp|telegrambot|skypeuripreview|microsoftpreview|teams|redditbot|pinterest|embedly|iframely|applebot|googlebot|bingbot|duckduckbot|yandex|baiduspider|upwork|bot\b|crawler|spider|preview/i;

export function isPreviewBot(userAgent: string | null): boolean {
  return !!userAgent && PREVIEW.test(userAgent);
}
