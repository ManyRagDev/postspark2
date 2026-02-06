import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Verificação de Metadados (Segurança PostSpark)
      const appId = data.user.app_metadata?.app_id;
      
      // Verifica se é usuário do postspark ou se não tem app_id (usuários legados)
      if (appId && appId !== 'postspark') {
        // Se o usuário for de outro app, redireciona com erro
        return NextResponse.redirect(`${origin}/login?error=invalid_app`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Retorno em caso de erro
  return NextResponse.redirect(`${origin}/login?error=auth_code_error`);
}
