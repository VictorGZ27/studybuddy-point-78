import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { Profile } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Ranking() {
  const [rankings, setRankings] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadRankings()
    
    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('ranking-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          loadRankings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadRankings = async () => {
    try {
      setError(null)
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000))
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'aluno')
        .order('pontos', { ascending: false })
        .limit(100)

      const { data, error } = (await Promise.race([fetchPromise, timeout])) as any

      if (error) throw error

      setRankings((data as Profile[]) || [])
    } catch (error: any) {
      console.error('Erro ao carregar ranking:', error)
      setError('Erro ao carregar dados, tente novamente')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
     if (position === 2) return <Medal className="h-6 w-6 text-primary/60" />
    if (position === 3) return <Award className="h-6 w-6 text-primary/80" />
    return <span className="text-lg font-bold text-muted-foreground">{position}</span>
  }

  const getRankBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 text-yellow-50">1º Lugar</Badge>
    if (position === 2) return <Badge className="bg-gray-400 text-gray-50">2º Lugar</Badge>
    if (position === 3) return <Badge className="bg-amber-600 text-amber-50">3º Lugar</Badge>
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando ranking...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-none h-0 w-0 mx-auto mb-4"></div>
            <p className="text-foreground font-medium mb-4">Erro ao carregar dados, tente novamente</p>
            <button onClick={loadRankings} className="px-4 py-2 rounded-md text-white" style={{ background: 'var(--primary)' }}>Recarregar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 Ranking dos Alunos</h1>
        <p className="text-muted-foreground">
          Veja quem está liderando nos estudos!
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {rankings.map((student, index) => {
          const position = index + 1
          const isCurrentUser = user?.id === student.id

          return (
            <Card 
              key={student.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                isCurrentUser 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(position)}
                    </div>
                    
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.foto_url} />
                      <AvatarFallback>
                        {student.nome.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">
                          {student.nome}
                          {isCurrentUser && (
                            <span className="text-primary ml-2">(Você)</span>
                          )}
                        </h3>
                        {getRankBadge(position)}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Estudante desde {new Date(student.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {student.pontos}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      pontos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {rankings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno no ranking</h3>
              <p className="text-muted-foreground">
                Seja o primeiro a completar exercícios e aparecer no ranking!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}