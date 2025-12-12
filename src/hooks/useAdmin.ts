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
          // If admins table doesn't exist or query fails, check if user email matches hardcoded admin
          if (user.email.toLowerCase() === 'nader.ibrahim@cafonline.com') {
            console.log('Fallback: User is hardcoded admin')
            setIsAdmin(true)
          } else {
            setIsAdmin(false)
          }
        } else {
          const adminEmails = data?.map(a => a.email.toLowerCase()) || []
          console.log('Admin emails from DB:', adminEmails)
          console.log('Current user email:', user.email.toLowerCase())
          const isUserAdmin = adminEmails.includes(user.email.toLowerCase())
          console.log('Is admin:', isUserAdmin)
          setAdmins(adminEmails)
          setIsAdmin(isUserAdmin)
          
          // Fallback if table is empty but user is the main admin
          if (!isUserAdmin && user.email.toLowerCase() === 'nader.ibrahim@cafonline.com') {
            console.log('Fallback: User is hardcoded admin (table empty)')
            setIsAdmin(true)
          }
        }
      } catch (err) {
        console.error('Error checking admin:', err)
        // Fallback for hardcoded admin
        if (user.email.toLowerCase() === 'nader.ibrahim@cafonline.com') {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
        }
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
