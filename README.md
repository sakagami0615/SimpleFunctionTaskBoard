# SimpleFunctionTaskBoard

# 1. ツール概要

![Tool Image](https://github.com/sakagami0615/SimpleFunctionTaskBoard/blob/image/image/tool_image.png)

※GoogleChromeで使用することを想定しています。
※下記のライブラリを使用して作成しています。
+ jKanban
+ Bootstrap

<br>

# 2. 準備
+ 下記のリポジトリのデータをダウンロードする。<br>
https://github.com/riktar/jkanban
+ ダウンロードしたら、distフォルダを **taskbord.html** と同じフォルダに配置する
+ **taskbord.html** を実行し、上記の図のような画面が表示されればOK

<br>

# 3. 補足

+ **ファイルが読み込めなくなった場合**<br>
ページをF5などで更新すれば、読み込めるようになります。<br>
その際、更新前にボードにあるアイテムが無くなる可能性があるので、<br>
保存するのは忘れずに。

+ **ボードを追加/削除したい場合**<br>
**src/taskboard.js** のソース内にある **boardIds, initBoards** の変数を<br>
修正することでボードの追加/削除ができます。
なお、2つの変数のidは一致している必要があります。
