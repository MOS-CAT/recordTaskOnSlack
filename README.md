# 作業時間記録用bot
Google Apps Scriptで書かれた、Slack上で動く作業時間記録bot

Slackで以下のコマンドを入力すると、BotがGoogle Spreadsheetに作業時間の記録・表示のあれこれをしてくれます。
  
![demo1](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo1.png)  

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
* $
* $help  
... 使用できるコマンドを表示します

## bot導入方法
このbotはプログラム本体をGoogleDrive上に保存して実行します。データは指定したfileの中にGoogleSpreadSheetが作成され、そのSpreadSheetに保存されます。
インストールは下記の手順に従ってください。
（ここではMacの場合のインストール手順を紹介しています。Windowsでは適宜作業を置き換えてください。基本的にはWindowsでもインストール手順は変わりません。)

### Google Apps Scriptを接続
https://drive.google.com/ を開き、画面中央で右クリック(Control + Click)をしてダイアログを表示します。
そのダイアログの【その他】をを選択し、【アプリを追加】を選択します。（この時点で【Google Apps Script】が表示される方はこの作業は飛ばしてください)  
![demo2](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo2.png)  
すると、【ドライブにアプリを追加】というダイアログが表示されるので、その中から【Google Apps Script】を探し、接続します。  
![demo3](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo3.png)  
接続が完了すると以下のようなダイアログが表示されます。  
![demo4](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo4.png)  
### Google Apps Scriptの作成
再びダイアログを表示し、【その他】を選択すると、【Google Apps Script】が追加されているはずなので、選択します。
すると、Google Apps Scriptの画面が開きます。  
![demo5](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo5.png)  
最初から記入されているコードは削除します。  
![demo6](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo6.png)  

[record_task_on_slack](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/record_task_on_slack.js)の内容をコピーし、今開いたGoogle Apps Scriptのエディタ部分にペーストします。  
![demo7](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo7.png)  
![demo8](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo8.png)  
この状態で一旦Google Apps Scriptを保存します。【ファイル】>【保存】を選択してください。  
![demo9](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo9.png)  
すると、プロジェクト名の編集のダイアログが表示されるので、プロジェクト名を"record_task_on_slack"にして【OK】を選択します。  
![demo10](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo10.png)  

#### APIとして公開
続いて、slackからのmessageを受け取れるようにするため、Webアプリケーション(API)として公開する設定をします。
【公開】>【ウェブアプリケーションとして導入...】をクリックしてください。  
![demo11](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo11.png)  
すると、以下のダイアログが表示されるので、【アプリケーションにアクセスできるユーザ：】を"全員（匿名ユーザを含む）"に変更し、【導入】をクリックします。  
![demo12](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo12.png)  
クリックすると、【承認が必要です】というダイアログが表示されるので、【許可を確認】をクリックします。  
![demo13](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo13.png)  
クリックすると表示されるダイアログで、今自分が使用しているGoogleアカウントを選択します。
すると、以下のようなダイアログが表示されるので、【詳細】をクリックしてください。  
![demo14](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo14.png)  
クリックすると表示が増えるので、その中の【record_task_on_slack（安全ではないページ）に移動】をクリックします。  
![demo15](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo15.png)  
以下のダイアログが表示されるので、テキストを入力し、【次へ】をクリックしてください。  
![demo16](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo16.png)  
以下のようなダイアログが表示されるので、【許可】をクリックしてください。  
![demo17](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo17.png)  
許可が確認されると、以下のダイアログが表示されます。【現在のウェブアプリケーションのURL:】に表示されているURLをコピーしてください（次の手順で使用します)  
![demo18](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo18.png)  
コピーしたら【OK】をクリックし、ダイアログを閉じます。

### Slackの設定
#### Outgoing Webhooksとの連携
[SlackのWebサイトへアクセス](https://my.slack.com/)します。  
![demo19](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo19.png)  
そして左下の【Apps】をクリックします。  
![demo20](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo20.png)  
すると以下のような画面が開かれるので、【Outgoing Webhooks】を検索し、【Outgoing Webhooks】をinstallします。  
![demo21](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo21.png)  
![demo22](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo22.png)  
Outgoing Wehooksの画面が表示されるので、【Add Configuration】をクリックします。  
![demo23](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo23.png)  
以下の画面が表示されるので、【Add Outgoing Webhooks integration】をクリックします。  
![demo24](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo24.png)  
成功すると以下の画面が表示されます。
![demo25](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo25.png)  

#### Outgoing Webhooksの設定
画面を下の方まで移動させ、【Integration Settings】の設定をします。  
![demo26](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo26.png)  
* 【Channel】は"Any"
* 【TriggerWord(s)】は"$"
* 【URL(s)】は先ほどコピーしたURLをペースト
* 【Token】に表示されているテキストをコピーしてください(次の手順で使用します)
以上の設定項目を入力・コピーしたら、【Save Settings】をクリックしてください。

### 各種Token(Property)の設定
#### SLACK_WEBHOOK_TOKEN
ここからは、再びGoogle Apps Scriptに戻って作業を行います。
【ファイル】>【プロジェクトのプロパティ】を選択してください。  
![demo27](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo27.png)  
選択すると【プロジェクトのプロパティ】というダイアログが表示されます。その中の【スクリプトのプロパティ】を選択してください。  
![demo28](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo28.png)  
【行を追加】をクリックし、プロパティに"SLACK_WEBHOOK_TOKEN"を入力し、値に先ほどコピーしたOutgoing WebhooksのTokenをペーストし、【保存】をクリックします。  
![demo29](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo29.png)  

#### SLACK_ACCESS_TOKEN
(slack API)[https://api.slack.com/custom-integrations/legacy-tokens] にアクセスし、Outgoing Webhooksと連携しているSlackのグループ(workspace)の行の【Create Token】をクリックします。（Tokenがnoneではなく、既に表示されている場合は、tokenをコピーし、この後の作業は飛ばしてください)  
![demo30](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo30.png)  
パスワードを求められた場合はパスワードを入力してください。
作成が完了すると、Tokenがnoneから、tokenの文字列に変わります。
作成されたtokenをコピーしてください。
再びGoogle Apps Scriptを開き、先ほどと同じ手順でスクリプトのプロパティを開き、
【行を追加】をクリックし、プロパティに"SLACK_ACCESS_TOKEN"を入力し、値に先ほどコピーしたtokenをペーストし、【保存】をクリックします。

#### FOLDER_ACCESS_TOKEN
スプレッドシートを作成するGoogleDrive上のフォルダを選択します。
GoogleDriveでスプレッドシートを作成・保存したいフォルダを選び、開いてください。  
![demo31](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo31.png)  
そのページのURLを表示します。
URLは  
https://drive.google.com/drive/folders/[id]  
のようになっているはずなので、この[id]の部分をコピーしてください。
Google Apps Scriptを開き、先ほどと同じ手順でスクリプトのプロパティを開き、
【行を追加】をクリックし、プロパティに"FOLDER_ACCESS_TOKEN"を入力し、値に先ほどコピーしたidをペーストし、【保存】をクリックします。

#### MAIN_SS_TOKEN
今選択したファイルの中にSpreadSheetを１つ作成してください。名前はなんでも構いません。  
![demo32](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo32.png)  
作成したSpreadSheetを開き、画面左下の【シート１】をダブルクリックし、名前を"MAIN"に変更します  
![demo33](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo33.png)  
この状態でページのURLを表示します。
URLは  
https://docs.google.com/spreadsheets/d/[id]/edit#gid=0  
のようになっているはずなので、この[id]の部分をコピーしてください。
Google Apps Scriptを開き、先ほどと同じ手順でスクリプトのプロパティを開き、
【行を追加】をクリックし、プロパティに"MAIN_SS_TOKEN"を入力し、値に先ほどコピーしたidをペーストし、【保存】をクリックします。

#### その他token
残りのtokenの設定を行います。ここからは、各自の好みで設定（値）を変更してください。
作成したSpreadSheetを開き、画面左下の【シート１】をダブルクリックし、名前を"MAIN"に変更しますの
作成したSpreadSheetを開き、画面左下の【シート１】をダブルクリックし、名前を"MAIN"に変更します
* プロパティ: SLACK_CHANNEL_TOKEN, 値: botを使いたいslackのchannel名(#general 等)
* プロパティ: BOT_NAME_TOKEN, 値: botの名前 (slack_assistant 等)
* プロパティ: ICON_URL_TOKEN, 値: botのicon画像のURL (https://upload.wikimedia.org/wikipedia/commons/7/76/Slack_Icon.png 等)

### slackApp ライブラリの導入
最後にGoogle Apps ScriptにslackApp ライブラリを導入します。
Google Apps Scriptを開き【リソース】>【ライブラリ...】を選択します。  
![demo34](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo34.png)  
すると、以下のようなダイアログが表示されるので、【ライブラリを追加】の入力欄に、  
M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO 　
と入力してください。  
![demo35](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo35.png)  
すると、SlackAppが追加・表示されるので、バージョンを最新(番号が最大のもの)にし、【保存】をクリックしてください。  
![demo36](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo36.png)  

### 起動
最後に再び、【公開】>【ウェブアプリケーションとして導入...】を選択し、ダイアログを開き、【プロジェクトバージョン】を"1"から、"新規作成"に変更し、【更新】をクリックしてください。  
（ここでも許可を求められるかもしれませんが、先ほどと同様の処理で許可してください）  
これで設定は完了です。

## テスト
slackを開き、SLACK_CHANNEL_TOKENに入力したchannelで  
$help  
と入力してみてください
以下が表示されたら成功です。
![demo1](https://github.com/MOS-CAT/recordTaskOnSlack/blob/master/img/demo1.png)
