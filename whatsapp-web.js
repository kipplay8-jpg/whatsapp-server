client.on('message', async (message) => {
  // ส่ง webhook ไปที่ Supabase
  await fetch('https://kgiyrkvjviwnosfuovyp.supabase.co/functions/v1/whatsapp-personal-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: '3e64d42c-d2b3-4f09-92ca-4bd450fc55f3',
      event_type: 'message',
      message: {
        from: message.from,
        body: message.body,
        sender_name: message._data.notifyName,
        timestamp: message.timestamp,
        isGroup: message.from.includes('@g.us')
      }
    })
  });
});
