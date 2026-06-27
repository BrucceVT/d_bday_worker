export interface Env {
  DB: D1Database;
  DISCORD_WEBHOOK_URL: string;
  FRONTEND_URL: string;
  ADMIN_PASSWORD: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Autenticación básica mediante cabecera (excepto OPTIONS)
    const authHeader = request.headers.get('Authorization');
    if (path.startsWith('/api/') && authHeader !== env.ADMIN_PASSWORD) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    if (path === '/api/birthdays') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM birthdays ORDER BY birth_date ASC').all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (request.method === 'POST') {
        const body: any = await request.json();
        if (!body.name || !body.birth_date) {
          return new Response('Name and birth_date are required', { status: 400, headers: corsHeaders });
        }
        const result = await env.DB.prepare(
          'INSERT INTO birthdays (name, nickname, birth_date, image_url, custom_message, birth_year) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(body.name, body.nickname || null, body.birth_date, body.image_url || null, body.custom_message || null, body.birth_year || null).run();
        
        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }
    }

    if (path.startsWith('/api/birthdays/') && request.method === 'DELETE') {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM birthdays WHERE id = ?').bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    if (path.startsWith('/api/birthdays/') && request.method === 'PUT') {
      const id = path.split('/').pop();
      const body: any = await request.json();
      if (!body.name || !body.birth_date) {
        return new Response('Name and birth_date are required', { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        'UPDATE birthdays SET name = ?, nickname = ?, birth_date = ?, image_url = ?, custom_message = ?, birth_year = ? WHERE id = ?'
      ).bind(body.name, body.nickname || null, body.birth_date, body.image_url || null, body.custom_message || null, body.birth_year || null, id).run();
      
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    // --- SCHEDULE API (to avoid adblockers blocking /events) ---
    if (path === '/api/schedule') {
      if (request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM events ORDER BY event_date ASC').all();
        return Response.json(results, { headers: corsHeaders });
      }

      if (request.method === 'POST') {
        const body: any = await request.json();
        if (!body.title || !body.event_date || !body.type) {
          return new Response('Title, event_date, and type are required', { status: 400, headers: corsHeaders });
        }
        const result = await env.DB.prepare(
          'INSERT INTO events (title, event_date, type, description) VALUES (?, ?, ?, ?)'
        ).bind(body.title, body.event_date, body.type, body.description || null).run();
        
        return Response.json({ success: true, id: result.meta.last_row_id }, { headers: corsHeaders });
      }
    }

    if (path.startsWith('/api/schedule/') && request.method === 'DELETE') {
      const id = path.split('/').pop();
      await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    if (path.startsWith('/api/schedule/') && request.method === 'PUT') {
      const id = path.split('/').pop();
      const body: any = await request.json();
      if (!body.title || !body.event_date || !body.type) {
        return new Response('Title, event_date, and type are required', { status: 400, headers: corsHeaders });
      }
      await env.DB.prepare(
        'UPDATE events SET title = ?, event_date = ?, type = ?, description = ? WHERE id = ?'
      ).bind(body.title, body.event_date, body.type, body.description || null, id).run();
      
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const limaDateStr = new Date().toLocaleString("en-US", { timeZone: "America/Lima" });
    const limaDateObj = new Date(limaDateStr);
    
    const month = String(limaDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(limaDateObj.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`; // Format MM-DD
    const fullTodayStr = `${limaDateObj.getFullYear()}-${month}-${day}`; // YYYY-MM-DD
    const currentHour = limaDateObj.getHours();

    const messages: any[] = [];

    // Tareas de las 08:00 AM (Avisos de todo el día)
    if (currentHour === 8) {
      // 1. Cumpleaños
      const { results: bdays } = await env.DB.prepare('SELECT * FROM birthdays WHERE birth_date LIKE ?').bind(`%${todayStr}`).all();
      if (bdays && bdays.length > 0) {
        for (const bday of bdays) {
          const name = bday.name as string;
          const nickname = bday.nickname as string | null;
          const imageUrl = bday.image_url as string | null;
          const customMsg = bday.custom_message as string | null;

          let content = customMsg ? customMsg : `🎉 ¡Feliz cumpleaños, **${nickname || name}**! 🎂 Que tengas un día excelente. 🥳`;
          messages.push({ content, imageUrl });
        }
      }

      // 2. Eventos / Feriados de HOY
      const { results: events } = await env.DB.prepare(`
        SELECT * FROM events 
        WHERE (type IN ('holiday_global', 'holiday_local') AND event_date LIKE ?)
           OR (type = 'private_event' AND event_date LIKE ?)
      `).bind(`%${todayStr}`, `${fullTodayStr}%`).all();

      if (events && events.length > 0) {
        for (const ev of events) {
          const title = ev.title as string;
          const desc = ev.description as string | null;
          const type = ev.type as string;
          
          let prefix = type === 'holiday_global' ? '🌍 Feriado Global' : 
                       type === 'holiday_local' ? '🇵🇪 Feriado Arequipa/Perú' : 
                       '📅 Evento Organizado Hoy';
                       
          let content = `**${prefix}: ${title}**\n${desc || ''}`;
          messages.push({ content, imageUrl: null });
        }
      }
    }

    // 3. Revisión cada hora para eventos privados que sean en 1 hora
    const nextHourObj = new Date(limaDateObj.getTime() + 60 * 60 * 1000);
    const nextHourDateStr = `${nextHourObj.getFullYear()}-${String(nextHourObj.getMonth()+1).padStart(2,'0')}-${String(nextHourObj.getDate()).padStart(2,'0')}`;
    const nextHourStrSpace = `${nextHourDateStr} ${String(nextHourObj.getHours()).padStart(2,'0')}`;
    const nextHourStrT = `${nextHourDateStr}T${String(nextHourObj.getHours()).padStart(2,'0')}`;
    
    const { results: upcomingEvents } = await env.DB.prepare(`
      SELECT * FROM events 
      WHERE type = 'private_event' AND (event_date LIKE ? OR event_date LIKE ?)
    `).bind(`${nextHourStrSpace}%`, `${nextHourStrT}%`).all();

    if (upcomingEvents && upcomingEvents.length > 0) {
      for (const ev of upcomingEvents) {
        const title = ev.title as string;
        const desc = ev.description as string | null;
        let content = `⏰ **¡RECORDATORIO! En aprox. 1 hora tenemos:**\n**${title}**\n${desc || ''}`;
        messages.push({ content, imageUrl: null });
      }
    }

    // Enviar todos los mensajes recolectados
    if (messages.length > 0 && env.DISCORD_WEBHOOK_URL) {
      for (const msg of messages) {
        const payload: any = {
          content: msg.content,
          username: "CelebraBot",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/3592/3592750.png"
        };

        if (msg.imageUrl) {
          payload.embeds = [{ image: { url: msg.imageUrl } }];
        }

        await fetch(env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    }
  }
};
