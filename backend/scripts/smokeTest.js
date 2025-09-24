// Simple smoke test for core messaging flows.
// Usage: CLERK_TOKEN=... USER_A=clerk_user_id USER_B=other_friend_id npm run smoke
import axios from 'axios';

const BASE = process.env.API_BASE || 'http://localhost:8000';
const token = process.env.CLERK_TOKEN;
const userA = process.env.USER_A; // acting user (token's subject)
const userB = process.env.USER_B; // friend target

if (!token || !userA || !userB) {
  console.error('Missing env: CLERK_TOKEN USER_A USER_B');
  process.exit(1);
}

axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.headers.common['Content-Type'] = 'application/json';

(async () => {
  try {
    const health = await axios.get(`${BASE}/health`);
    console.log('Health:', health.data.status, 'DB:', health.data.db?.state);

    // List conversations
    const convos = await axios.get(`${BASE}/messages/conversations`).then(r => r.data);
    console.log('Conversations count:', convos.length);

    // Ensure DM
    const dm = await axios.post(`${BASE}/messages/dm/${userB}`).then(r => r.data);
    console.log('DM conversation id:', dm._id);

    // Send message
    const sent = await axios.post(`${BASE}/messages/${dm._id}`, { content: 'Smoke test message ' + Date.now() }).then(r => r.data);
    console.log('Sent message id:', sent._id);

    // Fetch messages
    const msgs = await axios.get(`${BASE}/messages/${dm._id}`).then(r => r.data);
    console.log('Messages in DM:', msgs.length);

    // Mark read
    await axios.post(`${BASE}/messages/${dm._id}/read`);
    console.log('Marked read');

    // Re-fetch conversations for unread verification
    const convos2 = await axios.get(`${BASE}/messages/conversations`).then(r => r.data);
    const after = convos2.find(c => c._id === dm._id);
    console.log('Unread after read should be 0, actual:', after?.unread);

    console.log('Smoke test completed successfully');
  } catch (e) {
    console.error('Smoke test failed:', e.response?.data || e.message);
    process.exit(1);
  }
})();
