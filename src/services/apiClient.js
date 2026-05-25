class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token') || ''
  }

  setAuthToken(token) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }

  async get(data) {
    return Promise.resolve(data)
  }

  async post(data) {
    return Promise.resolve(data)
  }

  async delete(data) {
    return Promise.resolve(data)
  }
}

export default new ApiClient()
