const CRAWLER_PATTERNS = [
  /facebookexternalhit/i,
  /WhatsApp/i,
  /Twitterbot/i,
  /LinkedInBot/i,
  /TelegramBot/i,
  /Slackbot/i,
  /Discordbot/i,
  /Applebot/i,
  /SkypeUriPreview/i
];

/**
 * Utility to identify social media and messaging app link crawlers by User-Agent
 * @param {string} userAgent 
 * @returns {boolean}
 */
exports.isSocialCrawler = (userAgent) => {
  if (!userAgent || typeof userAgent !== 'string') return false;
  return CRAWLER_PATTERNS.some((pattern) => pattern.test(userAgent));
};

