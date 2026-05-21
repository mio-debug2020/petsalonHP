/**
 * ============================================================
 * ペットサロンLP お問い合わせフォーム → スプレッドシート連携
 * ============================================================
 *
 * 【セットアップ】
 * 1. Googleスプレッドシートを作成
 * 2. 拡張機能 → Apps Script を開き、このファイルの内容をすべて貼り付け
 * 3. 下の CONFIG の SPREADSHEET_ID を自分のIDに変更
 * 4. 関数「setupSheet」を選んで▶実行（初回は権限承認）
 * 5. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *      実行ユーザー: 自分　／　アクセス: 全員
 * 6. 表示されたURLを LP の script.js「GAS_ENDPOINT」に貼る
 *
 * 【LPから送られる項目】
 * salonName, name, email, phone, message, sourceUrl
 */

// ==================== CONFIG（ここだけ変更） ====================

/** スプレッドシートID（URLの /d/ と /edit の間） */
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

/** 記録するシート名 */
const SHEET_NAME = 'お問い合わせ';

/** 通知メール（不要なら空文字 '' のまま） */
const NOTIFY_EMAIL = '';

// ================================================================

/** ヘッダー行 */
const HEADERS = [
  '送信日時',
  'サロン名',
  'お名前',
  'メールアドレス',
  '電話番号',
  'ご相談内容',
  '送信元URL',
];

/**
 * フォーム送信（POST）— LPの script.js から呼ばれる
 */
function doPost(e) {
  try {
    const params = parseParams_(e);
    const result = saveToSheet_(params);

    return jsonResponse_({
      success: true,
      message: '送信が完了しました',
      row: result.row,
    });
  } catch (err) {
    Logger.log('[doPost ERROR] ' + err.message);
    return jsonResponse_({
      success: false,
      message: err.message || '送信に失敗しました',
    });
  }
}

/**
 * 動作確認（GET）— ブラウザでWebアプリURLを開いて確認
 */
function doGet() {
  return jsonResponse_({
    success: true,
    message: 'GASエンドポイントは正常に動作しています',
  });
}

/**
 * 初回セットアップ — シート作成＋ヘッダー行
 * Apps Scriptエディタで1回だけ実行してください
 */
function setupSheet() {
  if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    throw new Error('SPREADSHEET_ID を設定してから実行してください');
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setValues([HEADERS]);
    headerRange
      .setFontWeight('bold')
      .setBackground('#FFF0EC')
      .setFontColor('#2C2C2C');
    sheet.setFrozenRows(1);
  }

  sheet.setColumnWidth(1, 160); // 送信日時
  sheet.setColumnWidth(2, 200); // サロン名
  sheet.setColumnWidth(3, 120); // お名前
  sheet.setColumnWidth(4, 220); // メール
  sheet.setColumnWidth(5, 130); // 電話
  sheet.setColumnWidth(6, 400); // 内容
  sheet.setColumnWidth(7, 280); // URL

  Logger.log('セットアップ完了: ' + SHEET_NAME);
}

// ==================== 内部処理 ====================

/**
 * リクエストデータを取得
 */
function parseParams_(e) {
  if (!e) {
    throw new Error('リクエストデータがありません');
  }

  // LPは application/x-www-form-urlencoded で送信
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  // JSON送信にも対応
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      throw new Error('送信データの形式が正しくありません');
    }
  }

  throw new Error('送信データが空です');
}

/**
 * バリデーション → スプレッドシートに1行追加
 */
function saveToSheet_(params) {
  const salonName = trim_(params.salonName);
  const name = trim_(params.name);
  const email = trim_(params.email);
  const phone = trim_(params.phone);
  const message = trim_(params.message);
  const sourceUrl = trim_(params.sourceUrl);

  if (!salonName) throw new Error('サロン名を入力してください');
  if (!name) throw new Error('お名前を入力してください');
  if (!email) throw new Error('メールアドレスを入力してください');
  if (!isValidEmail_(email)) throw new Error('メールアドレスの形式が正しくありません');
  if (!message) throw new Error('ご相談内容を入力してください');

  const sheet = getSheet_();
  const timestamp = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone() || 'Asia/Tokyo',
    'yyyy/MM/dd HH:mm:ss'
  );

  const rowData = [timestamp, salonName, name, email, phone, message, sourceUrl];
  sheet.appendRow(rowData);

  const rowNumber = sheet.getLastRow();

  if (NOTIFY_EMAIL) {
    sendNotificationEmail_(rowData);
  }

  return { row: rowNumber };
}

/**
 * 対象シートを取得（なければ作成）
 */
function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    setupSheet();
    sheet = ss.getSheetByName(SHEET_NAME);
  }

  return sheet;
}

/**
 * JSONレスポンス（LPが読み取る形式）
 */
function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function trim_(value) {
  return String(value || '').trim();
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 管理者へメール通知（NOTIFY_EMAIL 設定時のみ）
 */
function sendNotificationEmail_(row) {
  const subject = '【SalonFlow】新しいお問い合わせ';
  const body =
    '新しいお問い合わせがありました。\n\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '送信日時: ' + row[0] + '\n' +
    'サロン名: ' + row[1] + '\n' +
    'お名前: ' + row[2] + '\n' +
    'メール: ' + row[3] + '\n' +
    '電話: ' + (row[4] || '（未入力）') + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    'ご相談内容:\n' + row[5] + '\n\n' +
    '送信元: ' + row[6];

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}
