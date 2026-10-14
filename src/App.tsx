import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  // === TRẠNG THÁI CHUNG ===
  const [activeTab, setActiveTab] = useState<'XUAT' | 'NHAN'>('XUAT')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')

  // ĐIỀN ĐƯỜNG LINK API MỚI NHẤT VÀO ĐÂY:
  const API_URL = 'https://script.google.com/macros/s/AKfycbxNRYIbKKlDmJ-QIynXlQlm7vm1R2KL1shwC7pXddzGjGWECv3JgDblxvQ8OGLSbsaM/exec'

  // === STATE CHO TAB 1: XUẤT CHO MƯỢN / ĐỔI TRẢ ===
  const [barcodeOut, setBarcodeOut] = useState('')
  const [bloodBagOut, setBloodBagOut] = useState<any>(null)
  
  // Thông tin biên bản (TAB 1)
  const [formOut, setFormOut] = useState({
    mucDich: 'Cho mượn máu/chế phẩm máu giữa các đơn vị',
    donViNhan: '',
    daiDienNhan: '',
    chucVuNhan: '',
    daiDienGiao: 'Nguyễn Văn A', 
    chucVuGiao: 'Cử nhân XN'
  })

  const formatMedicalDate = (dateString: string) => {
    if (!dateString) return '---';
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  // --- HÀM TAB 1: TÌM TÚI XUẤT ---
  const handleSearchOut = async (e: FormEvent) => {
    e.preventDefault()
    if (!barcodeOut) return
    
    let queryId = barcodeOut.trim();
    if (queryId.includes('|')) {
      const parts = queryId.split('|');
      if (parts.length > 1) {
        queryId = parts[1]; 
        setBarcodeOut(queryId); 
      }
    }

    setLoading(true)
    setMessage('Đang truy xuất hệ thống...')
    setPdfUrl('')
    
    try {
      const response = await fetch(`${API_URL}?action=search&id=${queryId}`)
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        setBloodBagOut(result.data)
        setMessage('✅ TÌM THẤY TÚI MÁU TRONG KHO')
      } else {
        setBloodBagOut(null)
        setMessage('❌ ' + result.message.toUpperCase())
      }
    } catch (error) {
      setMessage('❌ LỖI KẾT NỐI MẠNG BỆNH VIỆN')
      setBloodBagOut(null)
    } finally {
      setLoading(false)
    }
  }

  // --- HÀM TAB 1: XUẤT PDF & CHỐT ---
  const handleExportPDFOut = async () => {
    if (!bloodBagOut) return;
    setLoading(true)
    setMessage('Đang tạo Biên bản PDF và cập nhật hệ thống...')
    
    const now = new Date();
    
    // Đóng gói dữ liệu gửi lên Apps Script để chèn vào {{...}}
    const payloadData = {
      SoBienBan: bloodBagOut.maTui, 
      KinhGui: formOut.donViNhan,
      Gio: String(now.getHours()).padStart(2, '0'),
      Phut: String(now.getMinutes()).padStart(2, '0'),
      Ngay: String(now.getDate()).padStart(2, '0'),
      Thang: String(now.getMonth() + 1).padStart(2, '0'),
      Nam: String(now.getFullYear()).slice(-2),
      NgayHienTai: String(now.getDate()).padStart(2, '0'),
      ThangHienTai: String(now.getMonth() + 1).padStart(2, '0'),
      NamHienTai: String(now.getFullYear()).slice(-2),
      DiaDiem: 'Khoa Xét nghiệm Bệnh viện Đa khoa Cà Mau',
      CheckDoiTra: formOut.mucDich.includes('Đổi trả') ? '☒' : '☐',
      CheckChoMuon: formOut.mucDich.includes('Cho mượn') ? '☒' : '☐',
      CheckHoanTra: '☐',
      DonViGiao: 'Khoa Xét Nghiệm - BVĐK Cà Mau',
      DaiDienGiao: formOut.daiDienGiao,
      ChucVuGiao: formOut.chucVuGiao,
      DonViNhan: formOut.donViNhan,
      DaiDienNhan: formOut.daiDienNhan,
      ChucVuNhan: formOut.chucVuNhan,
      MaTui: bloodBagOut.maTui,
      ChePham: bloodBagOut.loaiChePham,
      NhomMau: bloodBagOut.nhomMau,
      TheTich: bloodBagOut.theTich,
      NgayDieuChe: formatMedicalDate(bloodBagOut.ngayDieuChe),
      HanSuDung: formatMedicalDate(bloodBagOut.hanSuDung),
      TinhTrangTuiMau: 'Nguyên vẹn, không bọt khí, đúng nhãn',
      DieuKienBaoQuan: 'Đạt yêu cầu quy định',
      SoBan: '02'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'export_pdf', data: payloadData })
      });
      
      const result = await response.json();
      if (result.status === 'success') {
        setPdfUrl(result.pdfUrl);
        setMessage('✅ TẠO BIÊN BẢN THÀNH CÔNG! Bấm vào link bên dưới để in.');
      } else {
        setMessage('❌ ' + result.message);
      }
    } catch (error) {
      setMessage('❌ LỖI TẠO PDF');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#EAECEF', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER TỔNG */}
      <div style={{ backgroundColor: '#BE1128', color: 'white', padding: '15px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase' }}>HỆ THỐNG QUẢN LÝ NGÂN HÀNG MÁU</h1>
          <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>PHÂN HỆ GIAO NHẬN - ĐỔI TRẢ - IN BIÊN BẢN</div>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* NÚT CHUYỂN TAB */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
          <button 
            onClick={() => { setActiveTab('XUAT'); setMessage(''); setPdfUrl(''); }}
            style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: activeTab === 'XUAT' ? '#BE1128' : '#fff', color: activeTab === 'XUAT' ? '#fff' : '#495057', border: activeTab === 'XUAT' ? 'none' : '1px solid #CED4DA', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            📤 XUẤT CHO MƯỢN / ĐỔI TRẢ
          </button>
          <button 
            onClick={() => { setActiveTab('NHAN'); setMessage(''); setPdfUrl(''); }}
            style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: activeTab === 'NHAN' ? '#0056B3' : '#fff', color: activeTab === 'NHAN' ? '#fff' : '#495057', border: activeTab === 'NHAN' ? 'none' : '1px solid #CED4DA', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            📥 NHẬN MÁU BÙ VỀ (TRẢ NỢ)
          </button>
        </div>

        {/* THÔNG BÁO CHUNG */}
        {message && (
          <div style={{ padding: '12px 15px', backgroundColor: message.includes('❌') ? '#F8D7DA' : '#D4EDDA', color: message.includes('❌') ? '#721C24' : '#155724', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', border: `1px solid ${message.includes('❌') ? '#F5C6CB' : '#C3E6CB'}`, borderRadius: '4px' }}>
            {message}
          </div>
        )}
        
        {pdfUrl && (
          <div style={{ padding: '15px', backgroundColor: '#FFF3CD', border: '1px solid #FFEEBA', marginBottom: '20px', borderRadius: '4px', textAlign: 'center' }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#856404', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>
              🖨️ BẤM VÀO ĐÂY ĐỂ MỞ & IN BIÊN BẢN PDF
            </a>
          </div>
        )}

        {/* ==================== TAB 1: XUẤT ==================== */}
        {activeTab === 'XUAT' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Cột Trái: Quét túi */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0, color: '#495057' }}>1. QUÉT TÚI MÁU TRONG KHO</h3>
              <form onSubmit={handleSearchOut} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  value={barcodeOut}
                  onChange={(e) => setBarcodeOut(e.target.value)}
                  placeholder="Quét mã vạch/QR túi cần xuất..."
                  style={{ flex: '1', padding: '10px', fontSize: '14px', border: '1px solid #CED4DA', outline: 'none' }}
                />
                <button type="submit" disabled={loading} style={{ padding: '0 20px', backgroundColor: '#BE1128', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  Tìm
                </button>
              </form>

              {bloodBagOut && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Nhóm Máu</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold', color: '#BE1128', fontSize: '18px' }}>{bloodBagOut.nhomMau}</td></tr>
                    <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', width: '40%' }}>Mã Túi Máu</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>{bloodBagOut.maTui}</td></tr>
                    <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5' }}>Chế Phẩm</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBagOut.loaiChePham}</td></tr>
                    <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5' }}>Hạn Sử Dụng</td><td style={{ padding: '8px', border: '1px solid #CED4DA', color: '#BE1128' }}>{formatMedicalDate(bloodBagOut.hanSuDung)}</td></tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* Cột Phải: Thông tin biên bản */}
            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: bloodBagOut ? 1 : 0.5, pointerEvents: bloodBagOut ? 'auto' : 'none' }}>
              <h3 style={{ marginTop: 0, color: '#495057' }}>2. THÔNG TIN BIÊN BẢN</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6C757D', marginBottom: '4px' }}>Lý do xuất</label>
                <select value={formOut.mucDich} onChange={(e) => setFormOut({...formOut, mucDich: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #CED4DA', borderRadius: '4px' }}>
                  <option value="Cho mượn máu/chế phẩm máu giữa các đơn vị">Cho mượn máu</option>
                  <option value="Đổi trả máu/chế phẩm máu do vấn đề chất lượng">Đổi trả máu</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6C757D', marginBottom: '4px' }}>Đơn vị nhận (Bệnh viện / Khoa phòng)</label>
                <input type="text" value={formOut.donViNhan} onChange={(e) => setFormOut({...formOut, donViNhan: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="VD: Bệnh viện HTTM Cần Thơ" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6C757D', marginBottom: '4px' }}>Người nhận</label>
                  <input type="text" value={formOut.daiDienNhan} onChange={(e) => setFormOut({...formOut, daiDienNhan: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#6C757D', marginBottom: '4px' }}>Chức vụ</label>
                  <input type="text" value={formOut.chucVuNhan} onChange={(e) => setFormOut({...formOut, chucVuNhan: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button onClick={handleExportPDFOut} disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#6C757D' : '#0056B3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', cursor: loading ? 'wait' : 'pointer' }}>
                {loading ? 'ĐANG XỬ LÝ...' : 'XUẤT MÁU & IN BIÊN BẢN PDF'}
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: NHẬN ==================== */}
        {activeTab === 'NHAN' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #0056B3', padding: '30px', textAlign: 'center', color: '#6C757D', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚧</div>
            <h2 style={{ margin: '0 0 10px 0', color: '#495057' }}>TAB NHẬN BÙ (ĐANG XÂY DỰNG)</h2>
            <p>Chúng ta sẽ test tính năng IN PDF ở Tab XUẤT trước.<br/>Khi PDF chạy hoàn hảo, tôi sẽ hoàn thiện nốt Tab này cho bạn!</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default App
