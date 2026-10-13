import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [barcode, setBarcode] = useState('')
  const [bloodBag, setBloodBag] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // ĐIỀN LẠI ĐƯỜNG LINK API VÀO ĐÂY:
  const API_URL = 'https://script.google.com/macros/s/AKfycbxNRYIbKKlDmJ-QIynXlQlm7vm1R2KL1shwC7pXddzGjGWECv3JgDblxvQ8OGLSbsaM/exec'

  // Hàm xử lý định dạng ngày tháng y tế chuẩn Việt Nam (Bỏ chuỗi T17:00:00.000Z)
  const formatMedicalDate = (dateString: string) => {
    if (!dateString) return '---';
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  const handleScan = async (e: FormEvent) => {
    e.preventDefault()
    if (!barcode) return
    
    setLoading(true)
    setMessage('Đang truy xuất hệ thống...')
    
    try {
      const response = await fetch(`${API_URL}?action=search&id=${barcode}`, {
        method: 'GET',
        redirect: 'follow'
      })
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        setBloodBag(result.data)
        setMessage('✅ TRUY XUẤT THÀNH CÔNG')
      } else {
        setBloodBag(null)
        setMessage('❌ ' + result.message.toUpperCase())
      }
    } catch (error) {
      setMessage('❌ LỖI KẾT NỐI MẠNG BỆNH VIỆN')
      setBloodBag(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#EAECEF', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- HEADER CHUẨN QUỐC GIA --- */}
      <div style={{ backgroundColor: '#BE1128', color: 'white', padding: '15px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
            HỆ THỐNG QUẢN LÝ NGÂN HÀNG MÁU
          </h1>
          <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>
            KHOA XÉT NGHIỆM - PHÂN HỆ ĐỔI TRẢ & ĐIỀU CHUYỂN
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.8 }}>
          PHIÊN BẢN 1.0<br/>TIÊU CHUẨN Y TẾ
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
          
          {/* ================= CỘT 1: TÚI MÁU XUẤT ================= */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            
            {/* Thanh tiêu đề thẻ */}
            <div style={{ backgroundColor: '#F8F9FA', padding: '15px 20px', borderBottom: '1px solid #CED4DA' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#495057', fontWeight: 'bold' }}>
                <span style={{ color: '#BE1128', marginRight: '8px' }}>■</span> KHUNG QUÉT TÚI MÁU XUẤT
              </h2>
            </div>

            <div style={{ padding: '20px' }}>
              <form onSubmit={handleScan} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Quét mã vạch hoặc nhập mã túi máu..."
                  style={{ flex: '1', padding: '10px 15px', fontSize: '16px', border: '1px solid #CED4DA', outline: 'none', backgroundColor: '#FFF' }}
                  autoFocus
                />
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ padding: '0 25px', backgroundColor: loading ? '#6C757D' : '#0056B3', color: 'white', border: '1px solid ' + (loading ? '#6C757D' : '#004494'), cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}
                >
                  {loading ? 'Đang xử lý...' : 'Truy xuất'}
                </button>
              </form>

              {message && (
                <div style={{ padding: '10px 15px', backgroundColor: message.includes('❌') ? '#F8D7DA' : '#D4EDDA', border: `1px solid ${message.includes('❌') ? '#F5C6CB' : '#C3E6CB'}`, color: message.includes('❌') ? '#721C24' : '#155724', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                  {message}
                </div>
              )}

              {/* BẢNG THÔNG TIN TÚI MÁU (Chuẩn LIS Bệnh viện) */}
              {bloodBag && (
                <div style={{ marginTop: '10px' }}>
                  
                  {/* Highlight Nhóm máu siêu lớn để tránh nhầm lẫn */}
                  <div style={{ textAlign: 'center', padding: '15px 0', border: '1px solid #CED4DA', backgroundColor: '#F8F9FA', marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#6C757D', fontWeight: 'bold', textTransform: 'uppercase' }}>Nhóm Máu / Phân Loại</div>
                    <div style={{ fontSize: '42px', fontWeight: '900', color: '#BE1128', marginTop: '5px' }}>{bloodBag.nhomMau || '---'}</div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', width: '35%', fontWeight: 'bold', color: '#495057' }}>Mã Túi Máu</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', fontWeight: 'bold', color: '#212529' }}>{bloodBag.maTui || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Mã Vạch Cấp</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#212529' }}>{bloodBag.maVach || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Loại Chế Phẩm</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#212529' }}>{bloodBag.loaiChePham || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Thể Tích</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#212529' }}>{bloodBag.theTich || '---'}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Ngày Điều Chế</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#212529' }}>{formatMedicalDate(bloodBag.ngayDieuChe)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Hạn Sử Dụng</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#BE1128', fontWeight: 'bold' }}>{formatMedicalDate(bloodBag.hanSuDung)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold', color: '#495057' }}>Trạng Thái Kho</td>
                        <td style={{ padding: '10px', border: '1px solid #CED4DA', color: '#212529', fontWeight: 'bold' }}>
                          {bloodBag.trangThai ? bloodBag.trangThai.toUpperCase() : '---'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= CỘT 2: TÚI MÁU BÙ ================= */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #0056B3', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: bloodBag ? 1 : 0.6, pointerEvents: bloodBag ? 'auto' : 'none' }}>
            
            <div style={{ backgroundColor: '#F8F9FA', padding: '15px 20px', borderBottom: '1px solid #CED4DA' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#495057', fontWeight: 'bold' }}>
                <span style={{ color: '#0056B3', marginRight: '8px' }}>■</span> KHUNG QUÉT TÚI MÁU NHẬN (BÙ LẠI)
              </h2>
            </div>

            <div style={{ padding: '20px' }}>
              {!bloodBag ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6C757D' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>YÊU CẦU TRUY XUẤT TÚI XUẤT ĐI TRƯỚC</div>
                  <div style={{ fontSize: '13px', marginTop: '5px' }}>Hệ thống đang khóa chức năng nhận để đảm bảo quy trình.</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                    <input 
                      type="text" 
                      placeholder="Quét mã vạch túi máu bù..."
                      style={{ flex: '1', padding: '10px 15px', fontSize: '16px', border: '1px solid #CED4DA', outline: 'none', backgroundColor: '#F1F3F5' }}
                    />
                    <button style={{ padding: '0 25px', backgroundColor: '#28A745', color: 'white', border: '1px solid #218838', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                      Xác Nhận Nhận
                    </button>
                  </div>
                  <div style={{ padding: '15px', border: '1px dashed #6C757D', backgroundColor: '#F8F9FA', fontSize: '13px', color: '#495057', lineHeight: '1.6' }}>
                    <strong>Quy trình thực hiện:</strong><br/>
                    1. Quét mã vạch của túi máu nhận bù.<br/>
                    2. Hệ thống sẽ tự động đối chiếu Nhóm máu và Thể tích với túi xuất đi.<br/>
                    3. Báo động đỏ nếu phát hiện bất đồng nhóm máu.<br/>
                    4. Nhấn "Xác Nhận Nhận" để ghi lịch sử giao dịch vào hệ thống.
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
