/**
 * Browser Console Script to Find Magic Eden Refresh Endpoint
 * 
 * INSTRUCTIONS:
 * 1. Open https://magiceden.io/item-details/Gj1MuHU8icqztxg2bidUAph4a5YnyBzQyk25k4J6WXH2
 * 2. Open DevTools (F12) -> Console tab
 * 3. Paste this entire script and press Enter
 * 4. Click the "Refresh" button on the page
 * 5. Check the console output - it will show the network request details
 */

// Intercept all fetch requests
const originalFetch = window.fetch
window.fetch = function(...args) {
  const url = args[0]
  const options = args[1] || {}
  
  // Log all requests
  console.log('🔍 Fetch Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
  })
  
  // Check if this looks like a refresh/metadata request
  if (
    url.includes('refresh') || 
    url.includes('metadata') || 
    url.includes('token') ||
    url.includes('update')
  ) {
    console.log('🎯 POTENTIAL REFRESH ENDPOINT FOUND!')
    console.log('URL:', url)
    console.log('Method:', options.method || 'GET')
    console.log('Headers:', options.headers)
    console.log('Body:', options.body)
    console.log('Full Request:', { url, ...options })
  }
  
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('📥 Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      })
      return response
    })
}

// Intercept XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open
const originalXHRSend = XMLHttpRequest.prototype.send

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._method = method
  this._url = url
  console.log('🔍 XHR Request:', { method, url })
  
  // Check if this looks like a refresh/metadata request
  if (
    url.includes('refresh') || 
    url.includes('metadata') || 
    url.includes('token') ||
    url.includes('update')
  ) {
    console.log('🎯 POTENTIAL REFRESH ENDPOINT FOUND!')
    console.log('URL:', url)
    console.log('Method:', method)
  }
  
  return originalXHROpen.apply(this, [method, url, ...rest])
}

XMLHttpRequest.prototype.send = function(body) {
  if (this._url) {
    console.log('📤 XHR Send:', {
      url: this._url,
      method: this._method,
      body: body,
    })
    
    // Check if this looks like a refresh/metadata request
    if (
      this._url.includes('refresh') || 
      this._url.includes('metadata') || 
      this._url.includes('token') ||
      this._url.includes('update')
    ) {
      console.log('🎯 POTENTIAL REFRESH ENDPOINT FOUND!')
      console.log('URL:', this._url)
      console.log('Method:', this._method)
      console.log('Body:', body)
    }
  }
  
  this.addEventListener('load', function() {
    console.log('📥 XHR Response:', {
      url: this._url,
      status: this.status,
      statusText: this.statusText,
      response: this.responseText?.substring(0, 200), // First 200 chars
    })
  })
  
  return originalXHRSend.apply(this, arguments)
}

console.log('✅ Network interceptor active! Now click the Refresh button and watch the console.')

