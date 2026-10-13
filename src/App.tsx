import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [barcode, setBarcode] = useState('')
  const [bloodBag, setBloodBag] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // DÁN ĐƯỜNG LINK API MỚI VÀO ĐÂY:
  const API_URL = 'https://script.google.com/macros/s/AKfycbxNRYIbKKlDmJ-QIynXlQlm7vm1R2KL1shwC7pXddzGjGWECv3JgDblxvQ8OGLSbsaM/exec'

  const handleScan = async (e: FormEvent) => {
    e.preventDefault()
    if (!barcode) return
    
    setLoading(true)
    setMessage('Đang truy xuất Database...')
    
    try {
      const response = await fetch(`${API_URL}?action=search&id=${barcode}`, {
        method: 'GET',
        redirect: 'follow'
      })
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        setBloodBag(result.data)
        setMessage('✅ ' + result.message)
      } else {
        setBloodBag(null)
        setMessage('❌ ' + result.message)
      }
    } catch (error) {
      setMessage('❌ Lỗi kết nối mạng: ' + (error as Error).message)
      setBloodBag(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#1890ff', margin: '0 0 10px 0', fontSize: '28px', fontWeight: '700' }}>
            🏥 HỆ THỐNG QUẢN LÝ ĐỔI & MƯỢN MÁU
          </h1>
          <p style={{ color: '#595959', fontSize: '16px', margin: 0, fontWeight: '500' }}>Khoa Xét nghiệm - Bệnh viện Đa khoa</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* CỘT 1: TÚI MÁU XUẤT ĐI */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '5px solid #ff4d4f' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px', marginRight: '12px' }}>📤</span>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#262626', fontWeight: '700' }}>QUÉT TÚI MÁU XUẤT ĐI</h2>
            </div>

            <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Nhập mã vạch (VD: MV-123456)..."
                style={{ flex: '1', padding: '12px 16px', fontSize: '16px', borderRadius: '8px', border: '1px solid #d9d9d9', outline: 'none' }}
                autoFocus
              />
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '0 24px', backgroundColor: loading ? '#ffa39e' : '#ff4d4f', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '16px' }}
              >
                {loading ? 'Đang tìm...' : 'Kiểm tra'}
              </button>
            </form>

            {message && (
              <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: message.includes('❌') ? '#fff2f0' : '#f6ffed', border: `1px solid ${message.includes('❌') ? '#ffccc7' : '#b7eb8f'}`, color: message.includes('❌') ? '#ff4d4f' : '#52c41a', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
                {message}
              </div>
            )}

            {/* THÔNG TIN TÚI MÁU SAU KHI TÌM THẤY */}
            {bloodBag && (
              <div style={{ backgroundColor: '#fafafa', borderRadius: '8px', padding: '20px', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#8c8c8c', textTransform: 'uppercase' }}>Thông tin chi tiết</h3>
                  <span style={{ backgroundColor: bloodBag.trangThai === 'Tồn kho' ? '#d9f7be' : '#ffe58f', color: bloodBag.trangThai === 'Tồn kho' ? '#389e0d' : '#d46b08', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    {bloodBag.trangThai}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px', fontSize: '15px' }}>
                  <div style={{ color: '#595959' }}>Mã Vạch:</div>
                  <div style={{ fontWeight: '600', color: '#262626', textAlign: 'right' }}>{bloodBag.maVach}</div>
                  
                  <div style={{ color: '#595959' }}>Mã Túi Máu:</div>
                  <div style={{ fontWeight: '600', color: '#262626', textAlign: 'right' }}>{bloodBag.maTui}</div>
                  
                  <div style={{ color: '#595959' }}>Nhóm máu:</div>
                  <div style={{ fontWeight: '800', color: '#cf1322', textAlign: 'right', fontSize: '20px' }}>{bloodBag.nhomMau}</div>
                  
                  <div style={{ color: '#595959' }}>Chế phẩm:</div>
                  <div style={{ fontWeight: '500', color: '#262626', textAlign: 'right' }}>{bloodBag.loaiChePham}</div>
                  
                  <div style={{ color: '#595959' }}>Thể tích:</div>
                  <div style={{ fontWeight: '500', color: '#262626', textAlign: 'right' }}>{bloodBag.theTich}</div>

                  <div style={{ color: '#595959' }}>Ngày điều chế:</div>
                  <div style={{ fontWeight: '500', color: '#262626', textAlign: 'right' }}>{bloodBag.ngayDieuChe}</div>
                  
                  <div style={{ color: '#595959' }}>Hạn sử dụng:</div>
                  <div style={{ fontWeight: '600', color: '#fa8c16', textAlign: 'right' }}>{bloodBag.hanSuDung}</div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT 2: TÚI MÁU NHẬN VỀ (Đang khóa) */}
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderTop: '5px solid #52c41a', opacity: bloodBag ? 1 : 0.4, transition: 'opacity 0.4s ease', pointerEvents: bloodBag ? 'auto' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '28px', marginRight: '12px' }}>📥</span>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#262626', fontWeight: '700' }}>TÚI MÁU NHẬN VỀ (BÙ)</h2>
            </div>
            
            {!bloodBag ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: '#bfbfbf', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
                <p style={{ margin: 0, fontSize: '15px' }}>Hệ thống đang khóa.<br/>Vui lòng quét túi xuất đi để đối chiếu.</p>
              </div>
            ) : (
              <div>
                 <p style={{ color: '#595959', marginBottom: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                   * Quét mã túi máu nhận về từ đơn vị khác để hệ thống tự động kiểm tra tương thích.
                 </p>
                 <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input type="text" placeholder="Quét mã barcode túi BÙ..." style={{ flex: '1', padding: '12px 16px', fontSize: '16px', borderRadius: '8px', border: '1px solid #d9d9d9', outline: 'none', backgroundColor: '#f6ffed' }} />
                    <button style={{ padding: '0 24px', backgroundColor: '#52c41a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '16px' }}>Xác nhận</button>
                 </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
