const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fetch = require('node-fetch');
const http = require('http');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SESSION_ID = process.env.SESSION_ID;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting WhatsApp Web.js Server...');
console.log('📝 Session ID:', SESSION_ID);

// Initialize WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: SESSION_ID
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

// Update session status in Supabase
async function updateSessionStatus(status, qrCode = null) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/whatsapp_sessions?id=eq.${SESSION_ID}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        is_connected: status,
        qr_code: qrCode,
        last_connected_at: status ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('❌ Failed to update session status:', await response.text());
    } else {
      console.log('✅ Session status updated:', status ? 'Connected' : 'Disconnected');
    }
  } catch (error) {
    console.error('❌ Error updating session status:', error);
  }
}

// Send webhook notification
async function sendWebhook(data) {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
  }
}

// QR Code event
client.on('qr', async (qr) => {
  console.log('\n📱 QR Code received! Scan with WhatsApp:');
  qrcode.generate(qr, { small: true });
  
  // Convert QR text to Base64 image for display on web
  const qrImageBase64 = await QRCode.toDataURL(qr);
  
  await updateSessionStatus(false, qrImageBase64);
// เดิม
await sendWebhook({
  event: 'qr_code',
  session_id: SESSION_ID,
  qr_code: qrImageBase64
});

// ใหม่
await sendWebhook({
  event_type: 'qr',
 // เดิม
await sendWebhook({
  event: 'authenticated',
  session_id: SESSION_ID
});

// ใหม่
await sendWebhook({
  event_type: 'authenticated',
  session_id: SESSION_ID,
  data: {}
});
});
});
// เดิม
await sendWebhook({
  event: 'ready',
  session_id: SESSION_ID,
  phone_number: info.wid.user,
  name: info.pushname
});

// ใหม่
await sendWebhook({
  event_type: 'ready',
  session_id: SESSION_ID,
  // เดิม
await sendWebhook({
  event: 'message',
  session_id: SESSION_ID,
  from: message.from,
  body: message.body,
  timestamp: message.timestamp
});

// ใหม่
await sendWebhook({
  event_type: 'message',
  session_id: SESSION_ID,
  // เดิม
await sendWebhook({
  event: 'disconnected',
  session_id: SESSION_ID,
  reason: reason
});

// ใหม่
await sendWebhook({
  event_type: 'disconnected',
  session_id: SESSION_ID,
  data: {
    reason: reason
  }
});
});
});

// Ready event
client.on('ready', async () => {
  console.log('🎉 WhatsApp client is ready!');
  const info = client.info;
  console.log('📞 Connected as:', info.pushname);
  console.log('📱 Phone:', info.wid.user);
  
  await updateSessionStatus(true);
  await sendWebhook({
    event: 'ready',
    session_id: SESSION_ID,
    phone_number: info.wid.user,
    name: info.pushname
  });
});

// Message event
client.on('message', async (message) => {
  console.log('📨 Message received:', message.from, message.body);
  
  await sendWebhook({
    event: 'message',
    session_id: SESSION_ID,
    from: message.from,
    body: message.body,
    timestamp: message.timestamp
  });
});

// Disconnected event
client.on('disconnected', async (reason) => {
  console.log('❌ Client disconnected:', reason);
  await updateSessionStatus(false);
  await sendWebhook({
    event: 'disconnected',
    session_id: SESSION_ID,
    reason: reason
  });
  
  // Auto-reconnect after 5 seconds
  setTimeout(() => {
    console.log('🔄 Attempting to reconnect...');
    client.initialize();
  }, 5000);
});

// Error handling
client.on('auth_failure', async (error) => {
  console.error('❌ Authentication failure:', error);
  await updateSessionStatus(false);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
});

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await updateSessionStatus(false);
  await client.destroy();
  process.exit(0);
});

// Create HTTP server for Render health checks
const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      session_id: SESSION_ID,
      connected: client.info ? true : false
    }));
  } else if (req.url === '/send-message' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { to, message, type = 'text', mediaUrl } = JSON.parse(body);
        
        if (!to || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing required fields: to, message' }));
          return;
        }

        console.log(`📤 Sending message to ${to}:`, message);

        // Format phone number
        const chatId = to.includes('@c.us') ? to : `${to}@c.us`;

        // Send message
        let result;
        if (type === 'text') {
          result = await client.sendMessage(chatId, message);
        } else if (type === 'media' && mediaUrl) {
          const media = await MessageMedia.fromUrl(mediaUrl);
          result = await client.sendMessage(chatId, media, { caption: message });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          messageId: result.id._serialized 
        }));
      } catch (error) {
        console.error('❌ Error sending message:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message 
        }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Web.js Server is running');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 HTTP Server listening on 0.0.0.0:${PORT}`);
});

// Initialize client
client.initialize();

console.log('⏳ Initializing WhatsApp client...');
