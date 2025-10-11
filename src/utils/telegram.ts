import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

interface TelegramMessage {
  text: string;
  parseMode?: 'Markdown' | 'HTML';
}

/**
 * Send a message to Telegram
 * @param message The message text or configuration object
 * @returns Promise that resolves when the message is sent
 */
export async function sendTelegramMessage(message: string | TelegramMessage): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('⚠️  Telegram credentials not found. Skipping message send.');
    return;
  }

  const messageText = typeof message === 'string' ? message : message.text;
  const parseMode = typeof message === 'string' ? undefined : message.parseMode;

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = JSON.stringify({
    chat_id: chatId,
    text: messageText,
    ...(parseMode && { parse_mode: parseMode })
  });

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Telegram message sent successfully');
          resolve();
        } else {
          console.error('❌ Failed to send Telegram message:', responseData);
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(payload);
    req.end();
  });
}
