const vscode = require('vscode');
const fs = require('fs')
const path = require("path")
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('yolol-to-yazur.convert-and-run', function(){
		vscode.window.showInputBox({
			ignoreFocusOut:true,
			password:false,
			placeHolder:"20",
			prompt:"The number of ticks Yazur should run",
			title:"Ticks",
			value:"20",
		}).then(inputBoxValue=>{
			inputBoxValue = inputBoxValue ? inputBoxValue : "20"
			const currentDirPath = vscode.workspace.workspaceFolders[0].uri.fsPath
			let networkFolders = fs.readdirSync(currentDirPath, {withFileTypes: true}).filter(dirent=>dirent.isDirectory() && dirent.name != "yazur").map(dirent => dirent.name)
			
			let structure = {
				yololPath: currentDirPath,
				networks: []
			}

			networkFolders.forEach(item=>{

				let yololChips = []
				let memoryChips = []

				const dirContents = fs.readdirSync(path.join(currentDirPath, item), {withFileTypes:true}).map(value=>value.name)
				dirContents.forEach(value=>{
					const type = value.split(".").pop()
					if(type == "yolol") { yololChips.push(value) } else
					if (type == "yololmem") {
						const file = fs.readFileSync(path.join(currentDirPath, item, value), {encoding:"utf-8"})
						if(file){ memoryChips.push(value) } //check if the file actually has stuff in it to avoid a single : variable from being added
					}
				})

				structure.networks.push({
					networkName: item,
					yololChips: yololChips,
					memoryChips: memoryChips
				})
			})
	
			const json = JSON.stringify(structure)
			let yololtoyazur = fs.readFileSync(path.join(__dirname, "yolol-to-yazur.js"), {encoding:"utf-8"})
			yololtoyazur = yololtoyazur.replace("20", inputBoxValue)
			fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.json"), json, {encoding:"utf-8"})
			fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.js"), yololtoyazur, {encoding:"utf-8"})

			const terminal = vscode.window.activeTerminal ? vscode.window.activeTerminal : vscode.window.createTerminal()
			terminal.sendText("node yolol-to-yazur.js")
		})
	}))
	context.subscriptions.push(vscode.commands.registerCommand('yolol-to-yazur.convert', function () {
		vscode.window.showInputBox({
			ignoreFocusOut:true,
			password:false,
			placeHolder:"20",
			prompt:"The number of ticks Yazur should run",
			title:"Ticks",
			value:"20",
		}).then(inputBoxValue=>{
			inputBoxValue = inputBoxValue ? inputBoxValue : "20"
			const currentDirPath = vscode.workspace.workspaceFolders[0].uri.fsPath
			let networkFolders = fs.readdirSync(currentDirPath, {withFileTypes: true}).filter(dirent=>dirent.isDirectory() && dirent.name != "yazur").map(dirent => dirent.name)
			
			let structure = {
				yololPath: currentDirPath,
				networks: []
			}

			networkFolders.forEach(item=>{

				let yololChips = []
				let memoryChips = []

				const dirContents = fs.readdirSync(path.join(currentDirPath, item), {withFileTypes:true}).map(value=>value.name)
				dirContents.forEach(value=>{
					const type = value.split(".").pop()
					if(type == "yolol") { yololChips.push(value) } else
					if (type == "yololmem") {
						const file = fs.readFileSync(path.join(currentDirPath, item, value), {encoding:"utf-8"})
						if(file){ memoryChips.push(value) } //check if the file actually has stuff in it to avoid a single : variable from being added
					}
				})

				structure.networks.push({
					networkName: item,
					yololChips: yololChips,
					memoryChips: memoryChips
				})
			})
			const json = JSON.stringify(structure)
			let yololtoyazur = fs.readFileSync(path.join(__dirname, "yolol-to-yazur.js"), {encoding:"utf-8"})
			yololtoyazur = yololtoyazur.replace("20", inputBoxValue)
			fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.json"), json, {encoding:"utf-8"})
			fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.js"), yololtoyazur, {encoding:"utf-8"})
		})
		
	}))	
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}