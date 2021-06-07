// ボードのID
const boardIds = [
	"sample-board-1",
	"sample-board-2",
	"sample-board-3",
	"sample-board-4"
]


// ボードの初期情報
const initBoards = [
	{
		"id": "sample-board-1",
		"title": "All Task",
		"class": "task",
		"item": []
	},
	{
		"id": "sample-board-2",
		"title": "Today To Do",
		"class": "todo",
		"item": []
	},
	{
		"id": "sample-board-3",
		"title": "Doing",
		"class": "doing",
		"item": []
	},
	{
		"id": "sample-board-4",
		"title": "Done",
		"class": "done",
		"item": []
	}
];


// ----------------------------------------------------------------------------------------------------
// タスク読み込み/書き込みイベント設定
// ----------------------------------------------------------------------------------------------------
let loadButton = document.getElementById("load-task-button");
loadButton.addEventListener("change", loadTaskFile);

let saveButton = document.getElementById("save-task-button");
saveButton.addEventListener("click", saveTaskFile);


// ----------------------------------------------------------------------------------------------------
// ゴミ箱領域を描画
// (黒線の右側にアイテムをドロップすると削除される)
// ----------------------------------------------------------------------------------------------------
const dustAreaX = 1150;
let canvas = document.getElementById("dust_region");
let context = canvas.getContext('2d');

context.beginPath();							// パスをリセット
context.moveTo(dustAreaX, 0);					// 開始地点に移動
context.lineTo(dustAreaX, canvas.height);		// 線を引く
context.strokeStyle = "#555555";				// 色指定
context.lineWidth = 6;							// 線の太さ指定
context.stroke();								// 線を描画


// ----------------------------------------------------------------------------------------------------
// マウスカーソル取得処理
// (アイテムの削除判定に使用)
// ----------------------------------------------------------------------------------------------------
let mouseX = 0;
let mouseY = 0;
window.addEventListener('load', function() {
	window.onmousemove = function (e) {
		mouseX = e.pageX;
		mouseY = e.pageY;
	}
});


// ----------------------------------------------------------------------------------------------------
// カンバン作成処理
// ----------------------------------------------------------------------------------------------------
const kanban = new jKanban({
	element: '#kanban',			// タスク管理ボードを表示させたいHTML要素
	gutter: '15px',				// ボード同士の間隔
	widthBoard: '250px',		// ボードのサイズ
	boards: initBoards,			// 初期状態のボードの中身をJSONで指定
	dragBoards: false,			// ボードのドラッグ
	addItemButton: true,		// タスク追加用のボタンを表示
	itemAddOptions: {
		enabled: true,
		content: '+ Add New Item',
		class: 'custom-button',
		footer: true
	},
	
	dragendEl: (elem) => removeElement(elem, mouseX, mouseY),	// タスクの削除
	click: (elem) => editFormElement(elem),						// タスクのリネーム
	buttonClick: (elem, id) => addFormElement(id)				// タスク追加用の関数を指定
});


// ----------------------------------------------------------------------------------------------------
// アイテム追加イベント
// ----------------------------------------------------------------------------------------------------
function addFormElement(id) {
	const formItem = document.createElement('form');
	formItem.innerHTML = '<input type="text">';
	formItem.innerHTML += '<button type="submit" class="submit-button">Submit</button>'
	formItem.innerHTML += '<button type="button" class="cancel-button">Cancel</button>';
	kanban.addForm(id, formItem);

	// キャンセル処理
	formItem.elements[2].addEventListener("click", (e) => {
		formItem.parentNode.removeChild(formItem); // 入力フォーム削除
	});
	// 追加処理
	formItem.addEventListener('submit', (e) => {
		e.preventDefault();
		const itemTitle = e.target[0].value;
		if (itemTitle.length == 0) {
			return;
		}
		// 入力された「タスク」をボードに登録
		kanban.addElement(id, {"title": itemTitle});
		// フォーム要素を非表示にするため削除
		formItem.parentNode.removeChild(formItem);
	})
}


// ----------------------------------------------------------------------------------------------------
// アイテム編集イベント
// ----------------------------------------------------------------------------------------------------
function editFormElement(elem) {
	const itemTitle = window.prompt("アイテム名を入力してください", elem.innerHTML);

	if (itemTitle != "" && itemTitle != null) {
		// 変更された「タスク」をボードに登録
		const id = kanban.getParentBoardID(elem);
		kanban.addElement(id, {"title": itemTitle});
		// 変更前の「タスク」をボードから削除
		kanban.removeElement(elem);
	}
}


// ----------------------------------------------------------------------------------------------------
// アイテム削除イベント
// ----------------------------------------------------------------------------------------------------
function removeElement(elem, mouseX, mouseY) {
	// 領域外にドロップしたアイテムを削除
	if (mouseX > dustAreaX) {
		kanban.removeElement(elem);
	}
}


// ----------------------------------------------------------------------------------------------------
// タスクファイル読み込みイベント
// ----------------------------------------------------------------------------------------------------
function loadTaskFile(event) {
	// FileReaderの作成
	const reader = new FileReader();
	// テキスト形式で読み込む
	const loadfile = event.target.files;
	reader.readAsText(loadfile[0]);

	// 読込終了後の処理
	reader.onload = function () {
		// 辞書に変換
		const loadBoards = JSON.parse(reader.result);

		// 現在のボードのアイテムを削除
		boardIds.filter(function (id) {
			let elems = kanban.getBoardElements(id);
			// 配列に変換
			elems = [].map.call(elems, (elem) => {
				return elem;
			});
			// ボードの下から順にアイテムを削除
			elems.reverse().map(function (elem) {
				kanban.removeElement(elem);
			});
		});

		// 読み込んだタスクをボードに追加
		boardIds.filter(function (id) {
			// ボードに追加するデータを抽出
			const targetBoard = loadBoards.board.find((board) => board.id === id);
			targetBoard.item.map(function (item) {
				kanban.addElement(id, item);
			});
		});
	}
}



// ----------------------------------------------------------------------------------------------------
// タスクファイル書き込みイベント
// ----------------------------------------------------------------------------------------------------
function saveTaskFile() {
	
	// 保存用変数を初期化
	let saveBoards = {board: initBoards};

	// ボードごとにアイテムを所得し、保存用変数に格納
	boardIds.filter(function (id) {
		const elems = kanban.getBoardElements(id);
		const items = [].map.call(elems, (elem) => {
			return {title: elem.innerHTML};
		});
		// 格納先のインデックスを取得し、アイテムを格納
		const boardIndex = saveBoards.board.findIndex((board) => board.id === id);
		saveBoards.board[boardIndex].item = items;
	});

	// 辞書をテキストに変換
	const saveText = JSON.stringify(saveBoards);

	// 変換後のテキストを保存
	let blob = new Blob([saveText],{type:"text/plan"});
	document.getElementById("save-task-button").href = window.URL.createObjectURL(blob);
}
