'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCoralWaterMatch() {
  const [session, setSession] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setSession(data.session ?? null)
    }

    loadSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    async function fetchMatches() {
      if (!session?.user?.id) {
        setMatches([])
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc('get_current_coral_risks', {
        p_user_id: session.user.id,
      })

      if (!active) return

      if (error) {
        console.error(error)
        setMatches([])
        setError('水質とサンゴDBの照合に失敗しました。')
      } else {
        setMatches(data ?? [])
      }

      setLoading(false)
    }

    fetchMatches()

    return () => {
      active = false
    }
  }, [session?.user?.id])

  const matchByEntityId = useMemo(() => {
    const map = new Map()
    for (const match of matches) {
      map.set(match.coral_entity_id, match)
    }
    return map
  }, [matches])

  return {
    isDemo: !session,
    session,
    matches,
    matchByEntityId,
    loading,
    error,
    message: !session
      ? 'ログインして水質ログを保存すると、現在の水質で飼育しやすいサンゴを絞り込めます。'
      : matches.length === 0 && !loading
        ? '最新の水質ログがまだないため、サンゴとの相性判定は待機中です。'
        : null,
  }
}
