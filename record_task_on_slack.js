function postSlackMessage(message) { // slackにmessageを送信
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
  var channel_token = PropertiesService.getScriptProperties().getProperty('SLACK_CHANNEL_TOKEN');
  var bot_name_token = PropertiesService.getScriptProperties().getProperty('BOT_NAME_TOKEN');
  var icon_url_token = PropertiesService.getScriptProperties().getProperty('ICON_URL_TOKEN');
  var slackApp = SlackApp.create(token); //SlackApp インスタンスの取得
 
  var options = {
    channelId: channel_token, //チャンネル名
    userName: bot_name_token, //投稿するbotの名前
    message: message, //投稿するメッセージ
    iconUrl: icon_url_token
  };
 
  slackApp.postMessage(options.channelId, options.message, {
    username: options.userName,
    icon_url: options.iconUrl
  });
}




function doPost(e) { // slackの#record_task channelからmessageを受け取った時に呼ばれる
  var verify_token = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_TOKEN');
  
  // 投稿の認証
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
    Logger.log("エラー");
  }
  
  var user = e.parameter.user_name;  
  // messageの種類を判定
  var message = e.parameter.text;
  var data = message.split(" ");
  var prefix = data[0];
  var word = "";
  if (data.length > 1) {
    var word = data[1];
  }
  
  switch (prefix) {
    case "$start":
    case "$s":
    case "$1":  
      startRecordingTask(user, word);
      break;
    case "$finish":
    case "$f":
    case "$2":
      if (isExistNowTask(user)) { // 今の作業がある場合のみ実施
        finishRecordingTask(user);
      }
      break;
    case "$break":
    case "$b":
    case "$3":
      if (isExistNowTask(user)) { // 今の作業がある場合のみ実施
        breakTask(user);
      }
      break;
    case "$restart":
    case "$r":
    case "$4":
      if (isExistNowTask(user)) { // 今の作業がある場合のみ実施
        restartRecordingTask(user);
      }
      break;
    case "$show":
    case "$7":
      if (word == "today") {
        showTodayRecord(user);
      } else if (word == "week") {
        showWeeklyRecord(user);
      } else {
        showTaskRecord(user, word);
      }
      break;
    case "$5":
      showTodayRecord(user);
      break;
    case "$6":
      showWeeklyRecord(user);
    default:
      var return_message = "使えるコマンドは以下の通りです\n\n" +
        ">>>$start\n" +
        "$s\n" +
        ": 何でもない作業開始\n\n" +
        "$start [作業名]\n" +
        "$s [作業名]\n" +
        ": 指定した作業開始\n\n" +
        "$finish\n" +
        "$f\n" +
        ": 指定した作業終了&作業時間表示\n\n" +
        "$break\n" +
        "$b\n" +
        ": 作業の一時中断\n\n" +
        "$restart\n" +
        "$r\n" +
        ": 作業再開\n\n" +
        "$show today\n" +
        ": 今日の合計作業時間表示\n\n" +
        "$show week\n" +
        ": 今週の合計作業時間表示\n\n" +
        "$show [作業名]"
        ": 指定した作業の作業時間表示";
      Logger.log("help表示");
      postSlackMessage(return_message);
      break;
  }
}




function createViewSpreadSheet(user, mainSheet, newRow) {  // 新しいスプレッドシートの作成
  
  // スプレッドシート作成
  var newSS = SpreadsheetApp.create("task_record_" + user);
  newSS.insertSheet("MAIN");
  var defaultSheet = newSS.getSheetByName('シート1');
  newSS.deleteSheet(defaultSheet);
  var newSSID = newSS.getId();
  var fileSS = DriveApp.getFileById(newSSID);
  var folderToken = PropertiesService.getScriptProperties().getProperty('FOLDER_ACCESS_TOKEN');
  var folderTarget = DriveApp.getFolderById(folderToken);
  folderTarget.addFile(fileSS);
  DriveApp.getRootFolder().removeFile(fileSS);
  
  
  // 新しいスプレッドシートのIDを保存
  mainSheet.getRange(newRow,1).setValue(user);
  mainSheet.getRange(newRow,2).setValue(newSSID);
  
  postSlackMessage("新規利用者ですね？あなた用のスプレッドシートを作成しました！\n>>>" + "https://docs.google.com/spreadsheets/d/" + newSSID);
  
  return newSS;
}




function createNewTask(user, task) { // 新しいtaskのsheetを作成
  var mainSSToken = PropertiesService.getScriptProperties().getProperty('MAIN_SS_TOKEN');
  var mainSS = SpreadsheetApp.openById(mainSSToken);
  var mainSheet = mainSS.getSheetByName('MAIN');
  var lastRow = mainSheet.getLastRow(); // mainSheetの最終行番号
  var is_exist_name = false;
  var match_cell_index = 0;
  var userSS = null;
  // userと同じ名前があるか確認
  for (var i=1; i<=lastRow; i++) {
    var check_cell = 'A' + String(i)
    var check_name = mainSheet.getRange(check_cell).getValue();
    if (check_name == user) {
      is_exist_name = true;
      match_cell_index = i;
      break;
    }
  }
  // userのスプレッドシートが存在しない場合は新しくスプレッドシートを作成
  if (!is_exist_name) {
    userSS = createViewSpreadSheet(user, mainSheet, lastRow+1);
  } else {
    var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
    userSS = SpreadsheetApp.openById(SSID);
  }
  
  // 新しいtaskのsheetを作成
  userSS.insertSheet(task);
  var userMainSheet = userSS.getSheetByName('MAIN');
  var userLastRow = userMainSheet.getLastRow(); // userMainSheetの最終行番号
  userMainSheet.getRange(userLastRow+1, 1).setValue(task);
  return userSS;
  
}




function isExistNowTask(user) { // 現在作業中のtaskがあるかどうか確認
  
  var userSS = null;
  
  // userのSSが存在しなかったら新しくsheetを作成
  var mainSSToken = PropertiesService.getScriptProperties().getProperty('MAIN_SS_TOKEN');
  var mainSS = SpreadsheetApp.openById(mainSSToken);
  var mainSheet = mainSS.getSheetByName('MAIN');
  var lastRow = mainSheet.getLastRow(); // mainSheetの最終行番号
  var is_exist_name = false;
  var match_cell_index = 0;
  for (var i=1; i<=lastRow; i++) { // userと同じ名前があるか確認
    var check_cell = 'A' + String(i)
    var check_name = mainSheet.getRange(check_cell).getValue();
    if (check_name == user) {
      is_exist_name = true;
      match_cell_index = i;
      break;
    }
  }
  if (is_exist_name) {
    var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
    userSS = SpreadsheetApp.openById(SSID);
  } else {
    userSS = createNewTask(user, newTask);
  }
  
  // 現在記録中のtaskがあるか確認
  var userMainSheet = userSS.getSheetByName('MAIN');
  var recordingTask = userMainSheet.getRange("B1").getValue();
  if (recordingTask != "") {  // taskが記録されている
    postSlackMessage("■ 記録中の作業 ■　【" + recordingTask + "】");
    return true;
  } else { // taskが記録されていない
    postSlackMessage("現在記録中の作業がありません。まずは作業を開始しましょう。\n作業開始のコマンドは以下の通りです。\n>>>$start\n" +
        "$s\n" +
        ": 何でもない作業開始\n\n" +
        "$start [作業名]\n" +
        "$s [作業名]\n" +
        ": 指定した作業開始");
    return false;
  }
  
  
}




function startRecordingTask(user, task) { // 記録を開始
  
  var newTask = task
  if (task == "") {
    newTask = "__ANY__"
  }
  var userSS = null;
  
  // userのSSが存在しない、またはSS内にtaskのsheetが存在しなかったら新しくsheetを作成
  var mainSSToken = PropertiesService.getScriptProperties().getProperty('MAIN_SS_TOKEN');
  var mainSS = SpreadsheetApp.openById(mainSSToken);
  var mainSheet = mainSS.getSheetByName('MAIN');
  var lastRow = mainSheet.getLastRow(); // mainSheetの最終行番号
  var isExistTaskSheet = false;
  var is_exist_name = false;
  var match_cell_index = 0;
  for (var i=1; i<=lastRow; i++) { // userと同じ名前があるか確認
    var check_cell = 'A' + String(i)
    var check_name = mainSheet.getRange(check_cell).getValue();
    if (check_name == user) {
      is_exist_name = true;
      match_cell_index = i;
      break;
    }
  }
  if (is_exist_name) { // userのSSがある時はtaskのsheetがあるか確認
    var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
    userSS = SpreadsheetApp.openById(SSID);
    var userMainSheet = userSS.getSheetByName('MAIN');
    var userLastRow = userMainSheet.getLastRow(); // userMainSheetの最終行番号
    for (var i=1; i<=userLastRow; i++) { // taskがあるか確認
      var check_cell = 'A' + String(i)
      var check_task = userMainSheet.getRange(check_cell).getValue();
      if (check_task == newTask) {
        isExistTaskSheet = true;
        break;
      }
    }
  }
  if (!is_exist_name) {
    userSS = createNewTask(user, newTask);
  } else if (!isExistTaskSheet) {
    createNewTask(user, newTask);
  }
  // taskが記録されていたら記録の終了処理
  var userMainSheet = userSS.getSheetByName('MAIN');
  var recordingTask = userMainSheet.getRange("B1").getValue();
  if (recordingTask != "") {  
    finishRecordingTask(user);
  }
  
  // taskを更新
  userMainSheet.getRange("B1").setValue(newTask);
  
  
  // taskの開始時間を記録
  var taskSheet = userSS.getSheetByName(newTask);
  var taskLastRow = taskSheet.getLastRow();
  var now = new Date();
  taskSheet.getRange(taskLastRow+1,1).setValue(now);
  postSlackMessage("■ 作業開始 ■　" + "【" + newTask + "】\n")
}




function getUserMainAndTaskSheet(user) { // userのMAINと現在のtaskのsheetを取得 (エラーハンドリングしてないので確実に現在作業中 & sheetが存在する時のみ使用)
  var mainSSToken = PropertiesService.getScriptProperties().getProperty('MAIN_SS_TOKEN');
  var mainSS = SpreadsheetApp.openById(mainSSToken);
  var mainSheet = mainSS.getSheetByName('MAIN');
  var lastRow = mainSheet.getLastRow(); // mainSheetの最終行番号
  var match_cell_index = 0;
  for (var i=1; i<=lastRow; i++) { // userと同じ名前があるか確認
    var check_cell = 'A' + String(i)
    var check_name = mainSheet.getRange(check_cell).getValue();
    if (check_name == user) {
      match_cell_index = i;
      break;
    }
  }
  var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
  var userSS = SpreadsheetApp.openById(SSID);
  var userMainSheet = userSS.getSheetByName('MAIN');
  var task = userMainSheet.getRange("B1").getValue();
  var taskSheet = userSS.getSheetByName(task);
  return [userMainSheet, taskSheet];
}




function finishRecordingTask(user) { // 記録を終了
  
  
  // userのmainと現在作業中のtaskのsheetを取得
  var sheets = getUserMainAndTaskSheet(user);
  
  // 終了時間を記入
  var taskLastRow = sheets[1].getLastRow();
  var now = new Date();
  sheets[1].getRange(taskLastRow,3).setValue(now);
  
  // 今回の作業時間を表示
  var taskTime = showRecentTask(sheets[1], taskLastRow);
  
  // taskを終了
  sheets[0].getRange("B1").setValue(""); 
  
  // 今日・今週の学習時間を更新
  var todayTime = Number(sheets[0].getRange("C1").getValue());
  var weeklyTime = Number(sheets[0].getRange("D1").getValue());
  var updateTime = sheets[0].getRange("E1").getValue();
  if (updateTime == "") {
    updateTime = now;
  }
  if (now.toDateString() != updateTime.toDateString() && now.getDay() == 1) {  // 週が変わっている場合はweeklyTime、todayTimeをreset
    todayTime = taskTime
    weeklyTime = taskTime
  } else if (now.toDateString() != updateTime.toDateString()) { // 日付のみ変わっている場合はtodayTimeだけreset
    todayTime = taskTime
    weeklyTime += taskTime
  } else {
    todayTime += taskTime
    weeklyTime += taskTime
  }
  sheets[0].getRange("C1").setValue(Math.floor(todayTime));
  sheets[0].getRange("D1").setValue(Math.floor(weeklyTime));
  // 最終更新時間を更新
  sheets[0].getRange("E1").setValue(now);
  

}




function breakTask(user) { // 作業を中断
  
  // userのmainと現在作業中のtaskのsheetを取得
  var sheets = getUserMainAndTaskSheet(user);
  
  // 休憩開始時間を記入
  var taskLastRow = sheets[1].getLastRow();
  var now = new Date();
  sheets[1].getRange(taskLastRow,4).setValue(now);
  
  postSlackMessage("作業を中断し、休憩を始めました！");
  
}




function restartRecordingTask(user) { // 作業を再開
  
  // userのmainと現在作業中のtaskのsheetを取得
  var sheets = getUserMainAndTaskSheet(user);
  
  // 休憩中で無ければその旨を表示
  var taskLastRow = sheets[1].getLastRow();
  var startBreakingTime = sheets[1].getRange(taskLastRow,4).getValue();
  if (startBreakingTime == "") {
    postSlackMessage("今は休憩中ではありません...");
    return;
  }
  
  // 今回の休憩時間を記録
  var now = new Date();
  var nowMsec = Date.parse(now);
  var startMsec = Date.parse(startBreakingTime);
  var breakSecond = Math.floor((nowMsec - startMsec)/1000);
  
  // 休憩時間を更新
  var breakingTime = sheets[1].getRange(taskLastRow,2).getValue();
  if (breakingTime != "") {
    breakSecond += Number(breakingTime);
  }
  sheets[1].getRange(taskLastRow,2).setValue(breakSecond);
  
  // 休憩開始時間をreset
  sheets[1].getRange(taskLastRow,4).setValue("");

  postSlackMessage("作業を再開しました！")
}




function isExistUserSS(user) { // UserのSSがあるかどうか確認 & userのSSを返す
  
  // userSSがあるかどうか確認
  var mainSSToken = PropertiesService.getScriptProperties().getProperty('MAIN_SS_TOKEN');
  var mainSS = SpreadsheetApp.openById(mainSSToken);
  var mainSheet = mainSS.getSheetByName('MAIN');
  var lastRow = mainSheet.getLastRow(); // mainSheetの最終行番号
  var isExistTaskSheet = false;
  var is_exist_name = false;
  var match_cell_index = 0;
  for (var i=1; i<=lastRow; i++) { // userと同じ名前があるか確認
    var check_cell = 'A' + String(i)
    var check_name = mainSheet.getRange(check_cell).getValue();
    if (check_name == user) {
      is_exist_name = true;
      match_cell_index = i;
      break;
    }
  }
  
  var userSS = null;
  if (is_exist_name) {
    var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
    userSS = SpreadsheetApp.openById(SSID);
  } else {
    userSS = createNewTask(user, "__ANY__")
  }
  
  return userSS;
  
}




function showTodayRecord(user) { // 今日の作業時間を表示
  
  // userSSを取得
  var userSS = isExistUserSS(user);
  
  // 今日の作業時間を返す
  var userMainSheet = userSS.getSheetByName('MAIN');
  var todayMinute = Number(userMainSheet.getRange("C1").getValue());
  var todayHour = Math.floor(todayMinute/60);
  todayMinute = todayMinute % 60;
  if (todayHour < 1) {
    postSlackMessage("■ 今日の作業時間 ■　" + String(todayMinute) + "分");
  } else {
    postSlackMessage("■ 今日の作業時間 ■　" + String(todayHour) + "時間" + String(todayMinute) + "分");
  }
  
}




function showWeeklyRecord(user) { // 今週の作業時間を表示
  
  // userSSを取得
  var userSS = isExistUserSS(user);
  
  // 今週の作業時間を返す
  var userMainSheet = userSS.getSheetByName('MAIN');
  var weeklyMinute = Number(userMainSheet.getRange("D1").getValue());
  var weeklyHour = Math.floor(weeklyMinute/60);
  weeklyMinute = weeklyMinute % 60;
  if (weeklyHour < 1) {
    postSlackMessage("■ 今週の作業時間 ■　" + String(weeklyMinute) + "分");
  } else {
    postSlackMessage("■ 今週の作業時間 ■　" + String(weeklyHour) + "時間" + String(weeklyMinute) + "分");
  }
  
}




function showTaskRecord(user, task) { // taskの作業時間を表示
  
  var newTask = task
  if (task == "") {
    newTask = "__ANY__"
  }
  
  // userSSを取得
  var userSS = isExistUserSS(user);
  
  // taskのsheetがあるかどうか確認
  var isExistTaskSheet = false;
  var userMainSheet = userSS.getSheetByName('MAIN');
  var userLastRow = userMainSheet.getLastRow(); // userMainSheetの最終行番号
  for (var i=1; i<=userLastRow; i++) { // taskがあるか確認
    var check_cell = 'A' + String(i)
    var check_task = userMainSheet.getRange(check_cell).getValue();
    if (check_task == newTask) {
      isExistTaskSheet = true;
      break;
    }
  }
  
  if (!isExistTaskSheet) { // taskがない場合はその旨を返す
    postSlackMessage("この名前の作業はありません...\nまずは作業を開始しましょう。\n作業開始のコマンドは以下の通りです。\n>>>$start\n" +
        "$s\n" +
        ": 何でもない作業開始\n\n" +
        "$start [作業名]\n" +
        "$s [作業名]\n" +
        ": 指定した作業開始");
    return;
  }
  
  // taskがある場合は合計作業時間を返す
  var taskSheet = userSS.getSheetByName(newTask);
  var totalRecordMinute = Number(taskSheet.getRange("F1").getValue());
  var totalRecordHour = totalRecordMinute/60
  if (totalRecordHour < 1) {
    postSlackMessage("■ 合計作業時間 ■" + "　【" + newTask + "】\n" + String(totalRecordMinute) + "分　");
  } else {
    totalRecordMinute = totalRecordMinute%60
    postSlackMessage("■ 合計作業時間 ■" + "　【" + newTask + "】\n" + String(totalRecordHour) + "時間" + String(totalRecordMinute) + "分　" + "【" + newTask + "】");
  }
  
  
  if (is_exist_name) { // userのSSがある時はtaskのsheetがあるか確認
    var SSID = mainSheet.getRange('B' + String(match_cell_index)).getValue();
    userSS = SpreadsheetApp.openById(SSID);
    
  }
  ("name判定完了");
  if (!is_exist_name) {
    userSS = createNewTask(user, newTask);
  } else if (!isExistTaskSheet) {
    createNewTask(user, newTask);
  }
  // taskが記録されていたら記録の終了処理
  var userMainSheet = userSS.getSheetByName('MAIN');
  var recordingTask = userMainSheet.getRange("B1").getValue();
  if (recordingTask != "") {  
    finishRecordingTask(user);
  }
  
  // taskを更新
  userMainSheet.getRange("B1").setValue(newTask);
  
}




function showRecentTask(taskSheet, lastRow, task) { // 今回の作業時間を表示(分単位)
  // ミリ秒のデータに変換
  var startTime = taskSheet.getRange(lastRow,1).getValue();
  var startMsec = Date.parse(startTime);
  var finishTime = taskSheet.getRange(lastRow,3).getValue();
  var finishMsec = Date.parse(finishTime);
  var breakSecond = Number(taskSheet.getRange(lastRow,2).getValue());
  var breakCell = taskSheet.getRange(lastRow,4).getValue();
  // 休憩中だったら最後の休憩時間を追加
  if (breakCell != "") {
    var breakTime = breakCell;
    var breakMsec = Date.parse(breakTime);
    breakSecond += (finishMsec - breakMsec) / 1000;
  }
  // 作業時間計算
  var startToFinish = (finishMsec - startMsec) / 1000;
  var taskSecond = Math.floor(startToFinish - breakSecond);
  var taskMinute = Math.floor(taskSecond/60);
  taskSecond = taskSecond%60;
  postSlackMessage("今回は" + String(taskMinute) + "分" + String(taskSecond) + "秒作業しました！");
  
  taskSheet.getRange(lastRow,5).setValue(taskMinute);
  var taskRecordMinute = taskMinute;
  var taskRecordTime = taskSheet.getRange(1,6).getValue();
  if (taskRecordTime != "") {
    taskRecordMinute += Number(taskRecordTime);
  }
  taskSheet.getRange(1,6).setValue(taskRecordMinute);
  
  return taskMinute;// 作業時間を返す
  
}