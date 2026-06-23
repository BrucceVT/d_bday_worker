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
          'INSERT INTO birthdays (name, nickname, birth_date, image_url, custom_message) VALUES (?, ?, ?, ?, ?)'
        ).bind(body.name, body.nickname || null, body.birth_date, body.image_url || null, body.custom_message || null).run();
        
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
        'UPDATE birthdays SET name = ?, nickname = ?, birth_date = ?, image_url = ?, custom_message = ? WHERE id = ?'
      ).bind(body.name, body.nickname || null, body.birth_date, body.image_url || null, body.custom_message || null, id).run();
      
      return Response.json({ success: true }, { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Cron is scheduled at 13:00 UTC, which is 08:00 AM America/Lima
    // Get current date in America/Lima
    const limaDate = new Date().toLocaleString("en-US", { timeZone: "America/Lima" });
    const dateObj = new Date(limaDate);
    
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`; // Format MM-DD

    const { results } = await env.DB.prepare(
      'SELECT * FROM birthdays WHERE birth_date LIKE ?'
    ).bind(`%${todayStr}`).all();

    if (results && results.length > 0) {
      if (!env.DISCORD_WEBHOOK_URL) {
        console.error('DISCORD_WEBHOOK_URL is not set');
        return;
      }

      for (const bday of results) {
        const name = bday.name as string;
        const nickname = bday.nickname as string | null;
        const imageUrl = bday.image_url as string | null;
        const customMsg = bday.custom_message as string | null;

        let content = customMsg ? customMsg : `🎉 ¡Feliz cumpleaños, **${nickname || name}**! 🎂 Que tengas un día excelente. 🥳`;
        
        const payload: any = {
          content,
          username: "CelebraBot",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/3592/3592750.png"
        };

        if (imageUrl) {
          payload.embeds = [
            {
              image: {
                url: imageUrl
              }
            }
          ];
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
