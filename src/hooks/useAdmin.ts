import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [admins, setAdmins] = useState<string[]>([])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('admins')
          .select('email')

        if (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        } else {
          const adminEmails = data?.map(a => a.email.toLowerCase()) || []
          setAdmins(adminEmails)
          setIsAdmin(adminEmails.includes(user.email.toLowerCase()))
        }
      } catch (err) {
        console.error('Error checking admin:', err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user?.email])

  const addAdmin = async (email: string): Promise<boolean> => {
    if (!isAdmin) return false

    try {
      const { error } = await supabase
        .from('admins')
        .insert({ email: email.toLowerCase(), created_by: user?.email })

      if (error) {
        console.error('Error adding admin:', error)
        return false
      }

      setAdmins(prev => [...prev, email.toLowerCase()])
      return true
    } catch (err) {
      console.error('Error adding admin:', err)
      return false
    }
  }

  const removeAdmin = async (email: string): Promise<boolean> => {
    if (!isAdmin) return false
    if (email.toLowerCase() === user?.email?.toLowerCase()) {
      alert("You can't remove yourself as admin")
      return false
    }

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('email', email.toLowerCase())

      if (error) {
        console.error('Error removing admin:', error)
        return false
      }

      setAdmins(prev => prev.filter(e => e !== email.toLowerCase()))
      return true
    } catch (err) {
      console.error('Error removing admin:', err)
      return false
    }
  }

  return { isAdmin, loading, admins, addAdmin, removeAdmin }
}
