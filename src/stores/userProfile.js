import { defineStore } from 'pinia'

const storageKey = 'user_profiles_v1'

const loadAll = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

const saveAll = (profiles) => {
  localStorage.setItem(storageKey, JSON.stringify(profiles))
}

export const useUserProfileStore = defineStore('UserProfile', {
  state: () => ({
    profiles: loadAll()
  }),
  actions: {
    getForLogin(login) {
      if (!login) {
        return { avatarUrl: '', bio: '' }
      }
      const entry = this.profiles[login]
      return {
        avatarUrl: entry?.avatarUrl || '',
        bio: entry?.bio || ''
      }
    },
    saveForLogin(login, patch) {
      if (!login) {
        return
      }
      this.profiles = {
        ...this.profiles,
        [login]: {
          ...this.getForLogin(login),
          ...patch
        }
      }
      saveAll(this.profiles)
    },
    setAvatar(login, avatarUrl) {
      this.saveForLogin(login, { avatarUrl })
    },
    setBio(login, bio) {
      this.saveForLogin(login, { bio: String(bio || '').slice(0, 500) })
    },
    clearAvatar(login) {
      this.saveForLogin(login, { avatarUrl: '' })
    }
  }
})
