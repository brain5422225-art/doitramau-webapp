import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [barcode, setBarcode] = useState('')
  const [bloodBag, setBloodBag] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Đường link API của bạn
  const API_URL = 'https://script.google.com/macros/s/AKfycbxPzPgx4isUCFAARhaqgBvF2V_u3Hr2Xd8s8Ln1rpLIhlQkmJeuKKbkRAUWo4U9z5-q/exec'

  const handleScan = async (e: FormEvent) => {
    e.preventDefault()
    if (!barcode) return
    
    setLoading(true)
    setMessage('Đang kết nối Database tìm túi máu: ' + barcode + '...')
    
    try {
      const response = await fetch(`${API_URL}?action=search&id=${barcode}`, {
        method: 'GET',
        redirect: 'follow'
      })
      
      // Sửa lỗi TS6133: Cho in biến data ra để Netlify không báo lỗi biến dư thừa
      const data = await response.json()
      console.log('Dữ liệu từ Apps Script trả về:', data)
      
      // TẠM THỜI: Dùng dữ liệu giả lập để bạn xem trước giao diện
      setBloodBag({
        id: barcode,
        nhomMau: 'O Rh(D)+',
        theTich: '250ml',
        loaiChePham: 'Khối hồng cầu',
        hanSuDung: '30/11/2026'
      })
      setMessage('✅ Tìm thấy thông tin túi máu (Dữ liệu mô phỏng)!')
      
    } catch (error) {
      setMessage('❌ Lỗi kết nối: ' + (error as Error).message)
      setBloodBag(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#0056b3', textAlign: 'center', marginBottom: '30px', textTransform: 'uppercase' }}>
        Phần mềm Quản lý Đổi/Mượn máu
      </h2>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* --- CỘT 1: TÚI MÁU XUẤT ĐI --- */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#fdfbfb', padding: '20px', borderRadius: '8px', border: '2px solid #ffc107', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#d9534f', marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            📤 TÚI MÁU XUẤT ĐI
          </h3>
          
          <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
            <input 
              type="text" 
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Quét mã vạch túi xuất..."
              style={{ flex: '1', padding: '12px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
              autoFocus
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>

          {message && <div style={{ marginBottom: '15px', color: message.includes('❌') ? 'red' : 'green', fontWeight: 'bold', fontSize: '14px' }}>{message}</div>}

          {bloodBag && (
            <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px dashed #d9534f' }}>
              <p style={{ margin: '8px 0' }}><strong>Mã túi:</strong> {bloodBag.id}</p>
              <p style={{ margin: '8px 0' }}><strong>Nhóm máu:</strong> <span style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>{bloodBag.nhomMau}</span></p>
              <p style={{ margin: '8px 0' }}><strong>Loại chế phẩm:</strong> {bloodBag.loaiChePham}</p>
              <p style={{ margin: '8px 0' }}><strong>Thể tích:</strong> {bloodBag.theTich}</p>
              <p style={{ margin: '8px 0' }}><strong>Hạn sử dụng:</strong> {bloodBag.hanSuDung}</p>
            </div>
          )}
        </div>

        {/* --- CỘT 2: TÚI MÁU NHẬN VỀ --- */}
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '2px solid #5cb85c', opacity: bloodBag ? 1 : 0.6, transition: 'opacity 0.3s' }}>
          <h3 style={{ color: '#5cb85c', marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
            📥 TÚI MÁU NHẬN VỀ (BÙ)
          </h3>
          {!bloodBag ? (
            <p style={{ fontStyle: 'italic', color: '#666', marginTop: '20px' }}>
              Vui lòng quét túi máu xuất đi để kích hoạt khung nhập túi nhận về.
            </p>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontStyle: 'italic', color: '#666' }}>Tính năng này đang được xây dựng...</p>
              {/* Form nhập túi về sẽ được thêm vào ở bước sau */}
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default App
