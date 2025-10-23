import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Player Management
app.post('/make-server-5d90d85a/player/join', async (c) => {
  try {
    const { username, avatarColor } = await c.req.json();
    
    if (!username || !avatarColor) {
      return c.json({ error: 'Username and avatar color required' }, 400);
    }

    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const player = {
      id: playerId,
      username,
      avatarColor,
      x: 200,
      y: 200,
      hp: 100,
      maxHp: 100,
      level: 1,
      badges: [],
      fashionItems: [],
      lastUpdate: Date.now(),
    };

    await kv.set(`player:${playerId}`, player);
    
    console.log(`Player joined: ${username} (${playerId})`);
    
    return c.json({ player });
  } catch (error) {
    console.error('Error in player join:', error);
    return c.json({ error: 'Failed to join game' }, 500);
  }
});

app.post('/make-server-5d90d85a/player/position', async (c) => {
  try {
    const { playerId, x, y } = await c.req.json();
    
    if (!playerId) {
      return c.json({ error: 'Player ID required' }, 400);
    }

    const player = await kv.get(`player:${playerId}`);
    if (!player) {
      return c.json({ error: 'Player not found' }, 404);
    }

    player.x = x;
    player.y = y;
    player.lastUpdate = Date.now();

    await kv.set(`player:${playerId}`, player);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating player position:', error);
    return c.json({ error: 'Failed to update position' }, 500);
  }
});

app.get('/make-server-5d90d85a/player/list', async (c) => {
  try {
    const playerId = c.req.query('playerId');
    const players = await kv.getByPrefix('player:');
    
    // Filter out current player and inactive players (older than 2 minutes)
    const now = Date.now();
    const activePlayers = players
      .filter(p => p.id !== playerId && (now - p.lastUpdate) < 120000)
      .map(p => ({
        id: p.id,
        username: p.username,
        avatarColor: p.avatarColor,
        x: p.x,
        y: p.y,
        hp: p.hp,
        maxHp: p.maxHp,
        level: p.level,
      }));

    return c.json({ players: activePlayers });
  } catch (error) {
    console.error('Error fetching players:', error);
    return c.json({ error: 'Failed to fetch players' }, 500);
  }
});

// Chat System
app.post('/make-server-5d90d85a/chat/send', async (c) => {
  try {
    const { playerId, username, message } = await c.req.json();
    
    if (!playerId || !username || !message) {
      return c.json({ error: 'All fields required' }, 400);
    }

    const chatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      playerId,
      username,
      message: message.substring(0, 200), // Limit message length
      timestamp: Date.now(),
    };

    await kv.set(`chat:${chatMessage.id}`, chatMessage);
    
    // Clean up old messages (keep last 50)
    const allMessages = await kv.getByPrefix('chat:');
    if (allMessages.length > 50) {
      const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
      const toDelete = sortedMessages.slice(0, allMessages.length - 50);
      for (const msg of toDelete) {
        await kv.del(`chat:${msg.id}`);
      }
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

app.get('/make-server-5d90d85a/chat/messages', async (c) => {
  try {
    const messages = await kv.getByPrefix('chat:');
    const sortedMessages = messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30) // Last 30 messages
      .map(m => ({
        username: m.username,
        message: m.message,
      }));

    return c.json({ messages: sortedMessages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// Gym Leaderboard
app.post('/make-server-5d90d85a/gym/submit', async (c) => {
  try {
    const { playerId, username, score } = await c.req.json();
    
    if (!playerId || !username || score === undefined) {
      return c.json({ error: 'All fields required' }, 400);
    }

    const entryId = `gym:${playerId}`;
    const entry = {
      playerId,
      username,
      score,
      timestamp: Date.now(),
    };

    // Check if player already has a score
    const existing = await kv.get(entryId);
    if (existing && existing.score > score) {
      // Keep the higher score
      return c.json({ success: true, message: 'Score not high enough' });
    }

    await kv.set(entryId, entry);
    
    console.log(`Gym score submitted: ${username} - ${score} points`);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error submitting gym score:', error);
    return c.json({ error: 'Failed to submit score' }, 500);
  }
});

app.get('/make-server-5d90d85a/gym/leaderboard', async (c) => {
  try {
    const entries = await kv.getByPrefix('gym:');
    
    // Filter entries from last 24 hours
    const now = Date.now();
    const dayAgo = now - (24 * 60 * 60 * 1000);
    
    const recentEntries = entries.filter(e => e.timestamp > dayAgo);
    
    // Sort by score descending
    const leaderboard = recentEntries
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10
      .map(e => ({
        username: e.username,
        score: e.score,
      }));

    return c.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching gym leaderboard:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Clean up old data periodically
app.get('/make-server-5d90d85a/cleanup', async (c) => {
  try {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const dayAgo = now - (24 * 60 * 60 * 1000);

    // Clean up inactive players (older than 1 hour)
    const players = await kv.getByPrefix('player:');
    for (const player of players) {
      if (player.lastUpdate < hourAgo) {
        await kv.del(`player:${player.id}`);
      }
    }

    // Clean up old gym scores (older than 24 hours)
    const gymEntries = await kv.getByPrefix('gym:');
    for (const entry of gymEntries) {
      if (entry.timestamp < dayAgo) {
        await kv.del(`gym:${entry.playerId}`);
      }
    }

    console.log('Cleanup completed');
    return c.json({ success: true, message: 'Cleanup completed' });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return c.json({ error: 'Cleanup failed' }, 500);
  }
});

app.get('/make-server-5d90d85a/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

Deno.serve(app.fetch);
