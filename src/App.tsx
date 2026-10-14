import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

// DANH SÁCH NHÂN VIÊN
const DS_NHAN_VIEN = ["Phạm Minh Mẫn", "Thái Trường Trọng Tín", "Huỳnh Thanh Tòng", "Lâm Khánh Hưng", "Nguyễn Minh Duy", "Nguyễn Quang Thiện", "Trần Lâm", "Huỳnh Nam"];

function App() {
  const [activeTab, setActiveTab] = useState<'XUAT' | 'NHAN'>('XUAT')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')

  // LƯU Ý: THAY API MỚI VÀO ĐÂY LẦN CUỐI
  const API_URL = 'https://script.google.com/macros/s/AKfycbxNRYIbKKlDmJ-QIynXlQlm7vm1R2KL1shwC7pXddzGjGWECv3JgDblxvQ8OGLSbsaM/exec'

  // === TAB 1: XUẤT ===
  const [barcodeOut, setBarcodeOut] = useState('')
  const [bloodBagOut, setBloodBagOut] = useState<any>(null)
  
  const [formOut, setFormOut] = useState({
    mucDich: 'Cho mượn máu/chế phẩm máu giữa các đơn vị',
    donViNhan: '', daiDienNhan: '', chucVuNhan: '', thanhPhanKhac: '',
    daiDienGiao: 'Phạm Minh Mẫn', chucVuGiao: 'Nhân viên',
    tinhTrangTuiMau: 'Nguyên vẹn, không bọt khí, đúng nhãn', dieuKienBaoQuan: 'Đạt yêu cầu quy định',
    lyDo: '', yKienDeNghi: '', ghiChu: ''
  })

  // === TAB 2: NHẬN ===
  const [barcodeSearchIn, setBarcodeSearchIn] = useState('') 
  const [oldBagIn, setOldBagIn] = useState<any>(null)
  const [barcodeScanIn, setBarcodeScanIn] = useState('') 
  const [newBagIn, setNewBagIn] = useState<any>(null)
  const [nguoiNhanBu, setNguoiNhanBu] = useState('Phạm Minh Mẫn')

  const formatMedicalDate = (dateString: string) => {
    if (!dateString) return '---';
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }

  const checkExpired = (dateString: string) => {
    if (!dateString || dateString === '---') return false;
    try {
      let day, month, year;
      if (dateString.includes('/')) [day, month, year] = dateString.split('/');
      else if (dateString.includes('-')) [year, month, day] = dateString.split('T')[0].split('-');
      else return false;
      const expDate = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59);
      return expDate.getTime() < new Date().getTime();
    } catch (e) { return false; }
  }

  // --- HÀM TAB 1: TÌM XUẤT ---
  const handleSearchOut = async (e: FormEvent) => {
    e.preventDefault(); if (!barcodeOut) return;
    let queryId = barcodeOut.trim();
    if (queryId.includes('|')) queryId = queryId.split('|')[1]; setBarcodeOut(queryId);
    
    setLoading(true); setMessage('Đang truy xuất hệ thống...'); setPdfUrl('');
    try {
      const response = await fetch(`${API_URL}?action=search&id=${queryId}`)
      const result = await response.json()
      if (result.status === 'success' && result.data) {
        setBloodBagOut(result.data); setMessage('✅ TÌM THẤY TÚI MÁU TRONG KHO');
      } else { setBloodBagOut(null); setMessage('❌ ' + result.message); }
    } catch (error) { setMessage('❌ LỖI MẠNG'); setBloodBagOut(null); } 
    finally { setLoading(false); }
  }

  // --- HÀM TAB 1: XUẤT PDF ---
  const handleExportPDFOut = async () => {
    if (!bloodBagOut) return;
    setLoading(true); setMessage('Đang tạo Biên bản PDF và cập nhật hệ thống...');
    const now = new Date(); const endDate = new Date(now.getTime() + 30 * 60000); 
    
    const payloadData = {
      RowIndex: bloodBagOut.rowIndex, SoBienBan: bloodBagOut.maTui, KinhGui: formOut.donViNhan,
      Gio: String(now.getHours()).padStart(2, '0'), Phut: String(now.getMinutes()).padStart(2, '0'),
      Ngay: String(now.getDate()).padStart(2, '0'), Thang: String(now.getMonth() + 1).padStart(2, '0'), Nam: String(now.getFullYear()).slice(-2),
      GioKetThuc: String(endDate.getHours()).padStart(2, '0'), PhutKetThuc: String(endDate.getMinutes()).padStart(2, '0'),
      NgayHienTai: String(now.getDate()).padStart(2, '0'), ThangHienTai: String(now.getMonth() + 1).padStart(2, '0'), NamHienTai: String(now.getFullYear()).slice(-2),
      DiaDiem: 'Khoa Xét nghiệm Bệnh viện Đa khoa Cà Mau',
      CheckDoiTra: formOut.mucDich.includes('Đổi trả') ? '☒' : '☐', CheckChoMuon: formOut.mucDich.includes('Cho mượn') ? '☒' : '☐', CheckHoanTra: '☐',
      DonViGiao: 'Khoa Xét Nghiệm - BVĐK Cà Mau', DaiDienGiao: formOut.daiDienGiao, ChucVuGiao: formOut.chucVuGiao,
      DonViNhan: formOut.donViNhan, DaiDienNhan: formOut.daiDienNhan, ChucVuNhan: formOut.chucVuNhan,
      ThanhPhanKhac: formOut.thanhPhanKhac.trim() !== '' ? formOut.thanhPhanKhac : 'Không có',
      MaTui: bloodBagOut.maTui, ChePham: bloodBagOut.loaiChePham, NhomMau: bloodBagOut.nhomMau, TheTich: bloodBagOut.theTich,
      NgayDieuChe: formatMedicalDate(bloodBagOut.ngayDieuChe), HanSuDung: formatMedicalDate(bloodBagOut.hanSuDung),
      TinhTrangTuiMau: formOut.tinhTrangTuiMau, DieuKienBaoQuan: formOut.dieuKienBaoQuan,
      LyDo: formOut.lyDo.trim() !== '' ? formOut.lyDo : 'Không có', YKienDeNghi: formOut.yKienDeNghi.trim() !== '' ? formOut.yKienDeNghi : '', GhiChu: formOut.ghiChu.trim() !== '' ? formOut.ghiChu : '',
      SoBan: '02'
    };

    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'export_pdf', data: payloadData }) });
      const result = await response.json();
      if (result.status === 'success') {
        setPdfUrl(result.pdfUrl); setMessage('✅ TẠO BIÊN BẢN & CẬP NHẬT KHO THÀNH CÔNG!'); setBloodBagOut(null);
      } else setMessage('❌ ' + result.message);
    } catch (error) { setMessage('❌ LỖI TẠO PDF'); } finally { setLoading(false); }
  }

  // --- HÀM TAB 2: TÌM TÚI NỢ ---
  const handleSearchOldBag = async (e: FormEvent) => {
    e.preventDefault(); if (!barcodeSearchIn) return;
    let queryId = barcodeSearchIn.trim();
    if (queryId.includes('|')) queryId = queryId.split('|')[1]; setBarcodeSearchIn(queryId);

    setLoading(true); setMessage('Đang tìm túi nợ...'); setPdfUrl('');
    try {
      const response = await fetch(`${API_URL}?action=search&id=${queryId}`);
      const result = await response.json();
      if (result.status === 'success' && result.data) {
        const currentStatus = String(result.data.trangThai).toLowerCase();
        if (currentStatus.includes('tồn kho')) { setMessage('❌ TÚI NÀY VẪN ĐANG Ở TRONG KHO, CHƯA ĐƯỢC XUẤT ĐI!'); setOldBagIn(null); }
        else { setOldBagIn(result.data); setMessage('✅ TÌM THẤY TÚI ĐÃ XUẤT. Quét túi mới ở ô bên dưới.'); }
      } else { setOldBagIn(null); setMessage('❌ ' + result.message.toUpperCase()); }
    } catch (error) { setMessage('❌ LỖI MẠNG'); setOldBagIn(null); } finally { setLoading(false); }
  }

  // --- HÀM TAB 2: QUÉT TÚI BÙ ---
  const handleScanNewBag = (e: FormEvent) => {
    e.preventDefault(); if (!barcodeScanIn) return;
    const parts = barcodeScanIn.split('|');
    if (parts.length >= 8) {
      let abo = parts[4].replace('/RH', '').replace(/\(\+\)/g, '').replace(/\(-\)/g, '').trim();
      let rh = parts[5].trim(); if (abo.endsWith('+') || abo.endsWith('-')) rh = ''; 
      
      const extractedData = { maVach: parts[0], maTui: parts[1], loaiChePham: parts[2], theTich: parts[3], nhomMau: `${abo}${rh}`, ngayDieuChe: parts[6], hanSuDung: parts[7] };
      setNewBagIn(extractedData);
      
      if (oldBagIn) {
        let isSafe = true; let warningMsg = '';
        const normalizeBG = (bg: string) => (bg || '').toUpperCase().replace(/RH\(D\)/g, '').replace(/\s+/g, '');
        if (normalizeBG(oldBagIn.nhomMau) !== normalizeBG(extractedData.nhomMau)) { isSafe = false; warningMsg += 'BẤT ĐỒNG NHÓM MÁU. '; }
        if (String(oldBagIn.theTich) !== String(extractedData.theTich)) { isSafe = false; warningMsg += 'LỆCH THỂ TÍCH. '; }

        if (isSafe) setMessage('✅ THÔNG TIN KHỚP. ĐỦ ĐIỀU KIỆN NHẬN BÙ.'); else setMessage('❌ CẢNH BÁO: ' + warningMsg);
      }
    } else { setMessage('❌ MÃ QR KHÔNG HỢP LỆ'); setNewBagIn(null); }
  }

  // --- HÀM TAB 2: CHỐT NHẬN BÙ VÀO DB ---
  const handleConfirmNhanBu = async () => {
    if (!oldBagIn || !newBagIn) return;
    setLoading(true); setMessage('Đang ghi dữ liệu vào Kho máu...');
    
    const now = new Date();
    const payloadData = {
      OldRowIndex: oldBagIn.rowIndex,
      OldBagMaTui: oldBagIn.maTui,
      NewBag: newBagIn,
      NguoiThaoTac: nguoiNhanBu,
      NgayHienTai: String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear(),
      GioHienTai: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
    };

    try {
      const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'nhan_bu', data: payloadData }) });
      const result = await response.json();
      if (result.status === 'success') {
        setMessage('✅ HOÀN TẤT! Đã chốt sổ túi cũ và nhập túi mới vào kho.');
        setOldBagIn(null); setNewBagIn(null); setBarcodeSearchIn(''); setBarcodeScanIn('');
      } else setMessage('❌ ' + result.message);
    } catch (error) { setMessage('❌ LỖI GHI DATABASE'); } finally { setLoading(false); }
  }

  return (
    <div style={{ backgroundColor: '#EAECEF', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ backgroundColor: '#BE1128', color: 'white', padding: '15px 20px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>HỆ THỐNG QUẢN LÝ NGÂN HÀNG MÁU</h1><div style={{ fontSize: '13px', marginTop: '4px' }}>PHÂN HỆ GIAO NHẬN - ĐỔI TRẢ</div></div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* NÚT TAB */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
          <button onClick={() => { setActiveTab('XUAT'); setMessage(''); setPdfUrl(''); }} style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: activeTab === 'XUAT' ? '#BE1128' : '#fff', color: activeTab === 'XUAT' ? '#fff' : '#495057', border: activeTab === 'XUAT' ? 'none' : '1px solid #CED4DA', borderRadius: '4px', cursor: 'pointer' }}>📤 XUẤT CHO MƯỢN / ĐỔI TRẢ</button>
          <button onClick={() => { setActiveTab('NHAN'); setMessage(''); setPdfUrl(''); }} style={{ flex: 1, padding: '15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: activeTab === 'NHAN' ? '#0056B3' : '#fff', color: activeTab === 'NHAN' ? '#fff' : '#495057', border: activeTab === 'NHAN' ? 'none' : '1px solid #CED4DA', borderRadius: '4px', cursor: 'pointer' }}>📥 NHẬN MÁU BÙ VỀ (TRẢ NỢ)</button>
        </div>

        {/* THÔNG BÁO */}
        {message && (<div style={{ padding: '12px 15px', backgroundColor: message.includes('❌') ? '#F8D7DA' : '#D4EDDA', color: message.includes('❌') ? '#721C24' : '#155724', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold', borderRadius: '4px' }}>{message}</div>)}
        {pdfUrl && (<div style={{ padding: '15px', backgroundColor: '#FFF3CD', border: '1px solid #FFEEBA', marginBottom: '20px', borderRadius: '4px', textAlign: 'center' }}><a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#856404', fontWeight: 'bold', fontSize: '16px', textDecoration: 'none' }}>🖨️ BẤM VÀO ĐÂY ĐỂ MỞ & IN BIÊN BẢN PDF</a></div>)}

        {/* === TAB 1: XUẤT === */}
        {activeTab === 'XUAT' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>1. QUÉT TÚI MÁU TRONG KHO</h3>
              <form onSubmit={handleSearchOut} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input type="text" value={barcodeOut} onChange={(e) => setBarcodeOut(e.target.value)} placeholder="Quét túi cần xuất..." style={{ flex: '1', padding: '10px', fontSize: '14px', border: '1px solid #CED4DA', outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ padding: '0 20px', backgroundColor: '#BE1128', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Tìm</button>
              </form>
              {bloodBagOut && (
                <div style={{ marginTop: '10px' }}>
                  {checkExpired(bloodBagOut.hanSuDung) && (<div style={{ padding: '12px', backgroundColor: '#FFF2F0', color: '#CF1322', fontWeight: 'bold', marginBottom: '15px', borderRadius: '4px', textAlign: 'center', fontSize: '13px' }}>⚠️ TÚI MÁU ĐÃ HẾT HẠN SỬ DỤNG!</div>)}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}><tbody>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', fontWeight: 'bold' }}>Nhóm Máu</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold', color: '#BE1128', fontSize: '18px' }}>{bloodBagOut.nhomMau}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5', width: '40%' }}>Mã Túi</td><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>{bloodBagOut.maTui}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5' }}>Chế Phẩm</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBagOut.loaiChePham}</td></tr>
                      <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', backgroundColor: '#F1F3F5' }}>Thể Tích</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{bloodBagOut.theTich} ml</td></tr>
                  </tbody></table>
                </div>
              )}
            </div>
            
            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #BE1128', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: bloodBagOut ? 1 : 0.5, pointerEvents: bloodBagOut ? 'auto' : 'none' }}>
              <h3 style={{ marginTop: 0 }}>2. HOÀN THIỆN BIÊN BẢN</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Nhân viên thực hiện</label><select value={formOut.daiDienGiao} onChange={(e) => setFormOut({...formOut, daiDienGiao: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px' }}>{DS_NHAN_VIEN.map(nv => <option key={nv} value={nv}>{nv}</option>)}</select></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Lý do xuất</label><select value={formOut.mucDich} onChange={(e) => setFormOut({...formOut, mucDich: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px' }}><option>Cho mượn máu/chế phẩm máu giữa các đơn vị</option><option>Đổi trả máu/chế phẩm máu do vấn đề chất lượng</option></select></div>
              </div>
              <div style={{ marginBottom: '15px' }}><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Đơn vị nhận</label><input type="text" value={formOut.donViNhan} onChange={(e) => setFormOut({...formOut, donViNhan: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="VD: Bệnh viện HTTM Cần Thơ" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Người nhận</label><input type="text" value={formOut.daiDienNhan} onChange={(e) => setFormOut({...formOut, daiDienNhan: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Chức vụ</label><input type="text" value={formOut.chucVuNhan} onChange={(e) => setFormOut({...formOut, chucVuNhan: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Thành phần khác</label><input type="text" value={formOut.thanhPhanKhac} onChange={(e) => setFormOut({...formOut, thanhPhanKhac: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px', boxSizing: 'border-box' }} placeholder="Trống = Không có" /></div>
              </div>
              <button onClick={handleExportPDFOut} disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#6C757D' : '#0056B3', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'wait' : 'pointer' }}>{loading ? 'ĐANG XỬ LÝ...' : '🖨️ XÁC NHẬN XUẤT MÁU & GHI DATABASE'}</button>
            </div>
          </div>
        )}

        {/* === TAB 2: NHẬN BÙ === */}
        {activeTab === 'NHAN' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' }}>
            
            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #0056B3', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ marginTop: 0 }}>1. TÌM TÚI ĐÃ XUẤT NỢ</h3>
              <form onSubmit={handleSearchOldBag} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input type="text" value={barcodeSearchIn} onChange={(e) => setBarcodeSearchIn(e.target.value)} placeholder="Quét mã túi cũ..." style={{ flex: '1', padding: '10px', fontSize: '14px', border: '1px solid #CED4DA', outline: 'none' }} />
                <button type="submit" disabled={loading} style={{ padding: '0 20px', backgroundColor: '#0056B3', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Tìm</button>
              </form>
              {oldBagIn && (
                 <div style={{ marginTop: '10px', padding: '15px', border: '1px dashed #0056B3', backgroundColor: '#F8F9FA' }}>
                    <div style={{ fontSize: '12px', color: '#6C757D', fontWeight: 'bold', textAlign: 'center' }}>TÚI CŨ CHỜ TRẢ CÓ NHÓM MÁU</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: '#0056B3', textAlign: 'center', marginBottom: '10px' }}>{oldBagIn.nhomMau}</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}><tbody>
                        <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', width: '40%', fontWeight: 'bold' }}>Mã Túi</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{oldBagIn.maTui}</td></tr>
                        <tr><td style={{ padding: '8px', border: '1px solid #CED4DA', fontWeight: 'bold' }}>Thể Tích</td><td style={{ padding: '8px', border: '1px solid #CED4DA' }}>{oldBagIn.theTich} ml</td></tr>
                    </tbody></table>
                 </div>
              )}
            </div>

            <div style={{ backgroundColor: '#fff', border: '1px solid #CED4DA', borderTop: '4px solid #28A745', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: oldBagIn ? 1 : 0.5, pointerEvents: oldBagIn ? 'auto' : 'none' }}>
              <h3 style={{ marginTop: 0 }}>2. QUÉT TÚI MỚI & CHỐT SỔ</h3>
              <form onSubmit={handleScanNewBag} style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
                <input type="text" value={barcodeScanIn} onChange={(e) => setBarcodeScanIn(e.target.value)} placeholder="Quét QR dài túi bù mang về..." style={{ flex: '1', padding: '10px', fontSize: '14px', border: '1px solid #CED4DA', outline: 'none' }} />
                <button type="submit" style={{ padding: '0 20px', backgroundColor: '#28A745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Quét</button>
              </form>

              {newBagIn && (
                 <div style={{ marginTop: '10px', padding: '15px', border: message.includes('❌') ? '1px solid #DC3545' : '1px solid #28A745', backgroundColor: '#F8F9FA' }}>
                    <div style={{ fontSize: '12px', color: '#6C757D', fontWeight: 'bold', textAlign: 'center' }}>TÚI MỚI MANG VỀ</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', color: message.includes('❌') ? '#DC3545' : '#28A745', textAlign: 'center', marginBottom: '10px' }}>{newBagIn.nhomMau}</div>
                    
                    <div style={{ marginBottom: '15px' }}>
                       <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#6C757D' }}>Nhân viên thực hiện nhận máu bù:</label>
                       <select value={nguoiNhanBu} onChange={(e) => setNguoiNhanBu(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '4px', border: '1px solid #CED4DA', borderRadius: '4px' }}>{DS_NHAN_VIEN.map(nv => <option key={nv} value={nv}>{nv}</option>)}</select>
                    </div>

                    {!message.includes('❌') && (
                       <button onClick={handleConfirmNhanBu} disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: loading ? '#6C757D' : '#28A745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '15px', cursor: loading ? 'wait' : 'pointer' }}>
                          {loading ? 'ĐANG CẬP NHẬT...' : '✅ XÁC NHẬN ĐỔI MÁU & GHI DATABASE'}
                       </button>
                    )}
                 </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default App
