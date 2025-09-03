import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import ProfileService from '../services/user/profileService'

export const useProfile = (userId = null) => {
    const { user } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const targetUserId = userId || user?.id

    useEffect(() => {
        if (!targetUserId) {
            setLoading(false)
            return
        }

        const fetchProfile = async () => {
            try {
                setLoading(true)
                setError(null)

                const result = await ProfileService.getProfile(targetUserId)

                if (result.error) {
                    setError(result.error)
                } else {
                    setProfile(result.data)
                }
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [targetUserId])

    const updateProfile = async (updates) => {
        if (!targetUserId) {
            throw new Error('No user ID provided')
        }

        try {
            setLoading(true)
            setError(null)

            const result = await ProfileService.updateProfile(targetUserId, updates)

            if (result.error) {
                setError(result.error)
                throw result.error
            } else {
                setProfile(result.data)
                return result.data
            }
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const refreshProfile = async () => {
        if (!targetUserId) return

        try {
            setLoading(true)
            setError(null)

            const result = await ProfileService.getProfile(targetUserId)

            if (result.error) {
                setError(result.error)
            } else {
                setProfile(result.data)
            }
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        isOwnProfile: !userId || userId === user?.id
    }
}

export default useProfile
