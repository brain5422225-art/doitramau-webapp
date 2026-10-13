var SPREADSHEET_ID = '1658v2r89QpQtsU-LO_eC2HAIirs3P4HrKlljYcPDUlY'; 
var SHEET_NAME = 'KHO MÁU'; // Đã cập nhật thành tên bảng thật

function doGet(e) {
  try {
    var action = e.parameter.action;
    var id = e.parameter.id;

    if (action === 'search' && id) {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheetByName(SHEET_NAME);
      
      if (!sheet) return responseJSON({ status: 'error', message: 'Không tìm thấy bảng: ' + SHEET_NAME });

      var data = sheet.getDataRange().getValues();
      var headers = data[0]; 
      
      var colMaVach = -1, colMaTui = -1, colNhomMau = -1, colChePham = -1, colTheTich = -1;
      var colNgayDC = -1, colHSD = -1, colTrangThai = -1;
      
      for (var c = 0; c < headers.length; c++) {
        var h = String(headers[c]).trim().toLowerCase();
        if (h === 'mã vạch quét') colMaVach = c;
        if (h === 'mã túi máu') colMaTui = c;
        if (h === 'nhóm máu') colNhomMau = c;
        if (h === 'loại chế phẩm') colChePham = c;
        if (h === 'thể tích') colTheTich = c;
        if (h === 'ngày điều chế') colNgayDC = c;
        if (h === 'hạn sử dụng') colHSD = c;
        if (h === 'trạng thái') colTrangThai = c;
      }

      var result = null;
      var searchId = String(id).trim().toLowerCase();

      for (var i = 1; i < data.length; i++) {
        var cellMaVach = String(data[i][colMaVach] || '').trim().toLowerCase();
        var cellMaTui = String(data[i][colMaTui] || '').trim().toLowerCase();

        if (cellMaVach === searchId || cellMaTui === searchId) {
          
          var strNgayDC = (colNgayDC !== -1 && data[i][colNgayDC] instanceof Date) ? Utilities.formatDate(data[i][colNgayDC], Session.getScriptTimeZone(), "dd/MM/yyyy") : (data[i][colNgayDC] || '');
          var strHSD = (colHSD !== -1 && data[i][colHSD] instanceof Date) ? Utilities.formatDate(data[i][colHSD], Session.getScriptTimeZone(), "dd/MM/yyyy") : (data[i][colHSD] || '');

          result = {
            maVach: data[i][colMaVach],
            maTui: data[i][colMaTui],
            nhomMau: data[i][colNhomMau],
            loaiChePham: data[i][colChePham],
            theTich: data[i][colTheTich],
            ngayDieuChe: strNgayDC,
            hanSuDung: strHSD,
            trangThai: data[i][colTrangThai]
          };
          break;
        }
      }

      if (result) {
        return responseJSON({ status: 'success', message: 'Tìm thấy thông tin túi máu!', data: result });
      } else {
        return responseJSON({ status: 'error', message: 'Không tồn tại mã: ' + id });
      }
    }
    return responseJSON({ status: 'success', message: 'API Kết nối thành công!' });
  } catch (error) {
    return responseJSON({ status: 'error', message: 'Lỗi: ' + error.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
