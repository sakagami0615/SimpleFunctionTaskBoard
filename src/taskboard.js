
const defaultBoards = [
	{
		"id": "sample-board-1",
		"title": "All Task",
		"class": "task",
		"item": [
			{ "title": "報告書の作成" },
			{ "title": "14時から打ち合わせ" }
		]
	},
	{
		"id": "sample-board-2",
		"title": "Today To Do",
		"class": "todo",
		"item": [{ "title": "○○案の企画書作成" }]
	},
	{
		"id": "sample-board-3",
		"title": "Doing",
		"class": "doing",
		"item": [{ "title": "日報の提出" }]
	},
	{
		"id": "sample-board-4",
		"title": "Done",
		"class": "done",
		"item": []
	}
];

// ----------------------------------------------------------------------------------------------------
// ゴミ箱領域を描画
// (黒線の右側にアイテムをドロップすると削除される)
// ----------------------------------------------------------------------------------------------------
const dust_area_x = 1150;
let canvas = document.getElementById("dust_region");
let context = canvas.getContext('2d');

context.beginPath();							// パスをリセット
context.moveTo(dust_area_x, 0);					// 開始地点に移動
context.lineTo(dust_area_x, canvas.height);		// 線を引く
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
	boards: defaultBoards,		// 初期状態のボードの中身をJSONで指定
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
	if (mouseX > dust_area_x) {
		kanban.removeElement(elem);
	}
}
