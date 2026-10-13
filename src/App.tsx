import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  // Dán đường link API MỚI của bạn vào đây:
  const API_URL = 'https://script.google.com/macros/s/AKfycbyI3PGbU8yVF2tZnY5A10H7Eit_36ov9-3POwsxvRAJF54wvAD7xn_yr42cPNyYICGH/exec'

  const testAPI = async () => {
    setMessage('Đang gọi về Google Sheets...')
    try {
      // Đã thêm tuỳ chọn redirect: 'follow' để vượt tường lửa Google
      const response = await fetch(API_URL, {
        method: 'GET',
        redirect: 'follow'
      })
      const data = await response.json()
      setMessage('✅ ' + data.message)
    } catch (error) {
      setMessage('❌ Lỗi kết nối: ' + (error as Error).message + ' (Hãy kiểm tra lại quyền Anyone trên Apps Script)')
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#0056b3' }}>MODULE QUẢN LÝ ĐỔI TRẢ & CHO MƯỢN MÁU</h2>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
        <p>Bước 4: Kiểm tra kết nối 2 chiều giữa Netlify và Google Sheets</p>
        
        <button 
          onClick={testAPI}
          style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}
        >
          Kiểm tra kết nối Database
        </button>
        
        {message && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px', fontWeight: 'bold' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
