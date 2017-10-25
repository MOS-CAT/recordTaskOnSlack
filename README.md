# 作業時間記録用bot
Google Apps Scriptで書かれた、Slack上で動く作業時間記録bot

Slackで以下のコマンドを入力すると、BotがGoogle Spreadsheetに作業時間の記録・表示のあれこれをしてくれます。

![demo1](https://github.com/MOS-CAT/recordTaskOnSlack/master/img/demo1.png)

### コマンド一覧
* $start
* $s
* $1
... 作業名を指定せずに作業時間の記録を開始します
* $start 作業名
* $s 作業名
* $1 作業名
... 作業名の作業時間の記録を開始します
* $finish
* $f
* $2
... 作業時間の記録を終了します
* $break
* $b
* $3
... 作業時間の記録を一時停止し、休憩に入ります
* $restart
* $r
* $4
... 休憩を終了し、作業時間の記録を再開します
* $show today
* $5
... 本日の合計作業時間を表示します
* $show week
* $6
... 今週の合計作業時間を表示します
* $show 作業名
* $7 作業名
... 作業名の合計作業時間を表示します

## bot導入方法
このbotはプログラム本体をGoogleDrive上に保存して実行します。データは指定したfileの中にGoogleSpreadSheetが作成され、そのSpreadSheetに保存されます。
インストールは下記の手順に従ってください。
（ここではMacの場合のインストール手順を紹介しています。Windowsでは適宜作業を置き換えてください。基本的にはWindowsでもインストール手順は変わりません。)

### Google Apps Scriptを接続
https://drive.google.com/ を開き、画面中央で右クリック(Control + Click)をしてダイアログを表示します。
そのダイアログの【その他】をを選択し、【アプリを追加】を選択します。（この時点で【Google Apps Script】が表示される方はこの作業は飛ばしてください)
![]()
すると、【ドライブにアプリを追加】というダイアログが表示されるので、その中から【Google Apps Script】を探し、接続します。
![]()
接続が完了すると以下のようなダイアログが表示されます。
![]()
### Google Apps Scriptを作成
再びダイアログを表示し、【その他】を選択すると、【Google Apps Script】が追加されているはずなので、選択します。
すると、Google Apps Scriptの画面が開きます。
![]()
