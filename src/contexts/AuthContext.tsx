import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isPremium: boolean
  canAccessFeature: (feature: string) => boolean
  signUp: (email: string, password: string, nome: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  upgradeToPremium: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log('🔐 Auth state changed:', event, !!session);
      
      // Only synchronous state updates here
      setSession(session);
      setUser(session?.user ?? null);
      
      // Defer async operations to prevent deadlock
      if (session?.user) {
        setTimeout(() => {
          if (mounted) {
            loadProfile(session.user.id).finally(() => {
              if (mounted) setLoading(false);
            });
          }
        }, 0);
      } else {
        setProfile(null);
        if (mounted) setLoading(false);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      console.log('🔐 Initial session:', !!session);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      console.log('👤 Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error loading profile:', error);
        throw error
      }

      console.log('✅ Profile loaded:', data);
      setProfile(data as Profile)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      // Don't show error toast for profile not found, just set null
      setProfile(null)
    }
  }

  const signUp = async (email: string, password: string, nome: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Criar perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              nome,
              email,
              pontos: 0,
            },
          ])

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }

      toast.success('Cadastro realizado com sucesso!')
    } catch (error: any) {
      console.error('Erro no cadastro:', error)
      toast.error(error.message || 'Erro ao realizar cadastro')
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Login realizado com sucesso!')
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast.error(error.message || 'Erro ao fazer login')
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast.success('Logout realizado com sucesso!')
    } catch (error: any) {
      console.error('Erro no logout:', error)
      toast.error(error.message || 'Erro ao fazer logout')
      throw error
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Recarregar perfil
      await loadProfile(user.id)
      toast.success('Perfil atualizado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error(error.message || 'Erro ao atualizar perfil')
      throw error
    }
  }

  const upgradeToPremium = async () => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      // Para simplificar, vamos usar o campo pontos para indicar premium
      // Na prática, você adicionaria um campo 'plano' à tabela profiles
      const { error } = await supabase
        .from('profiles')
        .update({ pontos: (profile?.pontos || 0) + 999999 }) // Marca como premium
        .eq('id', user.id)

      if (error) throw error

      await loadProfile(user.id)
      toast.success('Plano Premium ativado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao ativar Premium:', error)
      toast.error(error.message || 'Erro ao ativar Premium')
      throw error
    }
  }

  // Considera premium se tem muitos pontos (indicador temporário) ou é admin
  const isPremium = (profile?.pontos && profile.pontos >= 999999) || profile?.tipo_usuario === 'admin'

  const canAccessFeature = (feature: string): boolean => {
    if (isPremium) return true
    
    // Limitações do plano gratuito
    switch (feature) {
      case 'choose_teacher':
        return false
      case 'unlimited_essays':
        return false
      case 'detailed_feedback':
        return false
      case 'unlimited_chat':
        return false
      default:
        return true
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isPremium,
    canAccessFeature,
    signUp,
    signIn,
    signOut,
    updateProfile,
    upgradeToPremium,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}