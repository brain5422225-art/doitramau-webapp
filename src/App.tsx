import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

function App() {
  const [barcode, setBarcode] = useState('')
  const [bloodBag, setBloodBag] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // State cho Túi Nhận (Bù)
  const [barcodeIn, setBarcodeIn] = useState('')
  const [bloodBagIn, setBloodBagIn] = useState<any>(null)
  const [messageIn, setMessageIn] = useState('')

  // ĐIỀN ĐƯỜNG LINK API CỦA BẠN VÀO ĐÂY:
  const API_URL = 'https://script.google.com/macros/s/AKfycbxPzPgx4isUCFAARhaqgBvF2V_u3Hr2Xd8s8Ln1rpLIhlQkmJeuKKbkRAUWo4U9z5-q/exec'

  const formatMedicalDate = (dateString: string) => {
    if (!dateString) return '---';
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  // XỬ LÝ QUÉT TÚI XUẤT (CỘT 1)
  const handleScanOut = async (e: FormEvent) => {
    e.preventDefault()
    if (!barcode) return
    
    // Nếu quét mã QR dài, tự động bóc tách lấy Mã Túi Máu (Thành phần thứ 2) để tìm kiếm
    let queryId = barcode.trim();
    if (queryId.includes('|')) {
      const parts = queryId.split('|');
      if (parts.length > 1) {
        queryId = parts[1]; 
        setBarcode(queryId); // Rút gọn chuỗi dài trên ô input cho đẹp
      }
    }

    setLoading(true)
    setMessage('Đang truy xuất hệ thống...')
    
    try {
      const response = await fetch(`${API_URL}?action=search&id=${queryId}`, {
        method: 'GET',
        redirect: 'follow'
      })
      const result = await response.json()
      
      if (result.status === 'success' && result.data) {
        setBloodBag(result.data)
        setMessage('✅ TRUY XUẤT THÀNH CÔNG')
        // Reset cột 2 khi quét túi mới
        setBarcodeIn('')
        setBloodBagIn(null)
        setMessageIn('')
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

  // XỬ LÝ BÓC TÁCH MÃ VẠCH TÚI NHẬN (CỘT 2)
  const handleScanIn = (e: FormEvent) => {
    e.preventDefault()
    if (!barcodeIn) return
    
    const parts = barcodeIn.split('|');
    
    if (parts.length >= 8) {
      // Bóc tách chính xác Nhóm máu + Dấu Rh
      let abo = parts[4].replace('/RH', '').replace(/\(\+\)/g, '').replace(/\(-\)/g, '').trim();
      let rh = parts[5].trim();
      
      // Tránh lặp dấu (nếu abo đã là 'AB+' thì không ghép thêm '+')
      if (abo.endsWith('+') || abo.endsWith('-')) {
        rh = ''; 
      }
      let displayBloodGroup = `${abo}${rh}`;

      const extractedData = {
        maVach: parts[0],
        maTui: parts[1],
        loaiChePham: parts[2],
        theTich: parts[3],
        nhomMau: displayBloodGroup, 
        ngayDieuChe: parts[6],
        hanSuDung: parts[7]
      };
      
      setBloodBagIn(extractedData);
      
      // KIỂM TRA ĐỐI CHIẾU AN TOÀN TRUYỀN MÁU
      if (bloodBag) {
        let isSafe = true;
        let warningMsg = '';

        // Hàm chuẩn hóa chuỗi để so sánh (Loại bỏ khoảng trắng và chữ Rh(D) nếu có)
        const normalizeBG = (bg: string) => {
          return (bg || '').toUpperCase().replace(/RH\(D\)/g, '').replace(/\s+/g, '');
        }

        const outNhomMau = normalizeBG(bloodBag.nhomMau);
        const inNhomMau = normalizeBG(displayBloodGroup);

        if (outNhomMau !== inNhomMau) {
           isSafe = false;
           warningMsg += 'BẤT ĐỒNG NHÓM MÁU. ';
        }
        
        if (String(bloodBag.theTich) !== String(extractedData.theTich)) {
           isSafe = false;
           warningMsg += 'LỆCH THỂ TÍCH. ';
        }

        if (isSafe) {
          setMessageIn('✅ THÔNG TIN KHỚP. ĐỦ ĐIỀU KIỆN ĐỔI.');
        } else {
          setMessageIn('❌ CẢNH BÁO: ' + warningMsg);
        }
      }

    } else {
       setMessageIn('❌ ĐỊNH DẠNG MÃ QR KHÔNG HỢP LỆ');
       setBloodBagIn(null);
    }
  }

  return (
    <div style={{ backgroundColor: '#EAECEF', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ backgroundColor: '#BE1128', color: 'white', padding: '15px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>HỆ THỐNG QUẢN LÝ NGÂN HÀNG MÁU</h1>
          <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.9 }}>KHOA XÉT NGHIỆM - PHÂN HỆ ĐỔI TRẢ & ĐIỀU CHUYỂN</div>
        </div>
      </div>

      <div style={{ maxWidth: '1250px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
          
          {/* ================= CỘT 1: TÚI MÁU XUẤT ================= */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ backgroundColor: '#F8F9FA', padding: '15px 20px', borderBottom: '1px solid #CED4DA' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#495057', fontWeight: 'bold' }}>
                <span style={{ color: '#BE1128', marginRight: '8px' }}>■</span> KHUNG QUÉT TÚI MÁU XUẤT
              </h2>
            </div>

            <div style={{ padding: '20px' }}>
              <form onSubmit={handleScanOut} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Quét mã vạch hoặc mã QR túi xuất đi..."
                  style={{ flex: '1', padding: '10px 15px', fontSize: '16px', border: '1px solid #CED4DA', outline: 'none' }}
                  autoFocus
                />
                <button type="submit" disabled={loading} style={{ padding: '0 25px', backgroundColor: loading ? '#6C757D' : '#0056B3', color: 'white', border: 'none', cursor: loading ? 'wait' : 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Đang truy xuất...' : 'Truy xuất'}
                </button>
              </form>

              {message && (
                <div style={{ padding: '10px 15px', backgroundColor: message.includes('❌') ? '#F8D7DA' : '#D4EDDA', color: message.includes('❌') ? '#721C24' : '#155724', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                  {message}
                </div>
              )}

              {bloodBag && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ textAlign: 'center', padding: '15px 0', border: '1px solid #CED4DA', backgroundColor: '#F8F9FA', marginBottom: '15px' }}>
                    <div style={{ fontSize: '12px', color: '#6C757D', fontWeight: 'bold' }}>NHÓM MÁU</div>
                    <div style={{ fontSize: '42px', fontWeight: '900', color: '#BE1128', marginTop: '5px' }}>{bloodBag.nhomMau || '---'}</div>
                  </div>
                  
                  {/* Bảng full chi tiết */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <tbody>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', width: '35%', fontWeight: 'bold' }}>Mã Vạch Cấp</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBag.maVach}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Mã Túi Máu</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>{bloodBag.maTui}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Chế Phẩm</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBag.loaiChePham}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Thể Tích</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBag.theTich}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Ngày Điều Chế</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{formatMedicalDate(bloodBag.ngayDieuChe)}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Hạn Sử Dụng</td><td style={{ padding: '8px', border: '1px solid #CED4DA', color: '#BE1128', fontWeight: 'bold' }}>{formatMedicalDate(bloodBag.hanSuDung)}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Trạng Thái Kho</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>{bloodBag.trangThai}</td></tr>
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
                <span style={{ color: '#0056B3', marginRight: '8px' }}>■</span> KHUNG QUÉT TÚI NHẬN BÙ (THÔNG TIN MỚI)
              </h2>
            </div>

            <div style={{ padding: '20px' }}>
              {!bloodBag ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6C757D' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>YÊU CẦU TRUY XUẤT TÚI XUẤT ĐI TRƯỚC</div>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleScanIn} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                    <input 
                      type="text" 
                      value={barcodeIn}
                      onChange={(e) => setBarcodeIn(e.target.value)}
                      placeholder="Quét mã QR túi bù..."
                      style={{ flex: '1', padding: '10px 15px', fontSize: '16px', border: '1px solid #CED4DA', outline: 'none', backgroundColor: '#F8F9FA' }}
                    />
                    <button type="submit" style={{ padding: '0 25px', backgroundColor: '#28A745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                      Bóc tách
                    </button>
                  </form>

                  {messageIn && (
                    <div style={{ padding: '10px 15px', backgroundColor: messageIn.includes('❌') ? '#F8D7DA' : '#D4EDDA', color: messageIn.includes('❌') ? '#721C24' : '#155724', marginBottom: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      {messageIn}
                    </div>
                  )}

                  {bloodBagIn && (
                     <div style={{ marginTop: '10px' }}>
                        <div style={{ textAlign: 'center', padding: '15px 0', border: '1px solid #CED4DA', backgroundColor: '#F8F9FA', marginBottom: '15px' }}>
                          <div style={{ fontSize: '12px', color: '#6C757D', fontWeight: 'bold' }}>NHÓM MÁU TÚI BÙ</div>
                          <div style={{ fontSize: '42px', fontWeight: '900', color: messageIn.includes('❌') ? '#BE1128' : '#28A745', marginTop: '5px' }}>
                            {bloodBagIn.nhomMau || '---'}
                          </div>
                        </div>
                        
                        {/* Bảng full chi tiết túi bù */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                          <tbody>
                            <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', width: '35%', fontWeight: 'bold' }}>Mã Vạch Cấp</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBagIn.maVach}</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Mã Túi Mới</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>{bloodBagIn.maTui}</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Chế Phẩm</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBagIn.loaiChePham}</td></tr>
                            <tr>
                              <td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Thể Tích</td>
                              <td style={{ padding: '8px', border: '1px solid #CED4DA', color: messageIn.includes('LỆCH THỂ TÍCH') ? 'red' : 'inherit', fontWeight: messageIn.includes('LỆCH THỂ TÍCH') ? 'bold' : 'normal' }}>
                                {bloodBagIn.theTich}
                              </td>
                            </tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Ngày Điều Chế</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{formatMedicalDate(bloodBagIn.ngayDieuChe)}</td></tr>
                            <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Hạn Sử Dụng</td><td style={{ padding: '8px', border: '1px solid #CED4DA', color: '#BE1128', fontWeight: 'bold' }}>{formatMedicalDate(bloodBagIn.hanSuDung)}</td></tr>
                          </tbody>
                        </table>

                        {/* Nút lưu dữ liệu */}
                        {!messageIn.includes('❌') && (
                          <button style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#0056B3', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                            XÁC NHẬN ĐỔI MÁU & GHI DATABASE
                          </button>
                        )}
                     </div>
                  )}

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
