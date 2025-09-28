import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, type = 'geral', professorType } = await req.json();
    
    console.log('AI Chat request:', { message, conversationId, type, professorType });

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Check if user is premium for certain features
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single();

    const isPremium = profile?.tipo_usuario === 'premium';

    // Create or get conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const { data: newConversation } = await supabase
        .from('ai_conversations')
        .insert({
          aluno_id: user.id,
          tipo: type,
          titulo: message.substring(0, 50)
        })
        .select()
        .single();
      
      currentConversationId = newConversation?.id;
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    // Prepare system prompts based on type and professor
    const systemPrompts: Record<string, string> = {
      'geral': 'Você é um assistente educacional inteligente do StudyPoint. Ajude os alunos com suas dúvidas acadêmicas de forma clara e educativa.',
      'redacao': getProfessorPrompt(professorType || 'redacao'),
      'duvida': 'Você é um professor experiente que explica conceitos de forma didática e clara. Use exemplos práticos.',
      'mapa_mental': 'Você é especialista em organização de estudos. Ajude a criar mapas mentais estruturados com tópicos principais e subtópicos.',
      'correcao': getProfessorPrompt(professorType || 'portugues')
    };

    function getProfessorPrompt(teacherType: string): string {
      const prompts: Record<string, string> = {
        'portugues': 'Você é um professor de Português especializado em gramática, ortografia e norma culta. Corrija textos com foco em aspectos linguísticos.',
        'redacao': 'Você é um professor de Redação especializado em estrutura textual, argumentação e coesão. Avalie a organização das ideias e argumentos.',
        'literatura': 'Você é um professor de Literatura com vasto conhecimento em obras clássicas e contemporâneas. Analise aspectos literários.',
        'matematica': 'Você é um professor de Matemática que explica conceitos de forma lógica e sequencial.',
        'historia': 'Você é um professor de História que contextualiza eventos e fatos históricos.',
        'geografia': 'Você é um professor de Geografia especializado em análise espacial e fenômenos geográficos.',
        'biologia': 'Você é um professor de Biologia que explica processos biológicos de forma clara.',
        'quimica': 'Você é um professor de Química especializado em reações e processos químicos.',
        'fisica': 'Você é um professor de Física que relaciona teoria com aplicações práticas.',
        'filosofia': 'Você é um professor de Filosofia que estimula o pensamento crítico.',
        'sociologia': 'Você é um professor de Sociologia que analisa fenômenos sociais.',
        'ingles': 'Você é um professor de Inglês especializado em gramática e conversação.',
        'espanhol': 'Você é um professor de Espanhol especializado em gramática e conversação.',
        'artes': 'Você é um professor de Artes que explica técnicas e história da arte.',
        'educacao_fisica': 'Você é um professor de Educação Física especializado em saúde e atividade física.',
        'geral': 'Você é um assistente educacional inteligente do StudyPoint. Ajude os alunos com suas dúvidas acadêmicas de forma clara e educativa.'
      };
      return prompts[teacherType] || prompts.geral;
    }

    // Prepare messages for OpenAI
    const conversationMessages = [
      { role: 'system', content: systemPrompts[type] },
      ...(messages || []),
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store messages in database
    await supabase.from('ai_messages').insert([
      {
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      },
      {
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiResponse
      }
    ]);

    // Update progress if applicable (simplified approach)
    if (type === 'duvida') {
      // Try to insert new record, if it exists, ignore
      const { data: existingProgress } = await supabase
        .from('progresso_aluno')
        .select('valor')
        .eq('aluno_id', user.id)
        .eq('tipo', 'duvidas_respondidas')
        .single();

      if (existingProgress) {
        await supabase
          .from('progresso_aluno')
          .update({ 
            valor: existingProgress.valor + 1,
            updated_at: new Date().toISOString()
          })
          .eq('aluno_id', user.id)
          .eq('tipo', 'duvidas_respondidas');
      } else {
        await supabase
          .from('progresso_aluno')
          .insert({
            aluno_id: user.id,
            tipo: 'duvidas_respondidas',
            valor: 1
          });
      }
    }

    return new Response(JSON.stringify({
      response: aiResponse,
      conversationId: currentConversationId,
      type,
      isPremium
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});