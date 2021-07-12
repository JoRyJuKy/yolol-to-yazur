const vscode = require('vscode');
const fs = require('fs')
const path = require("path")
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('yolol-to-yazur.convert-and-run', function(){
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
		fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.json"), json, {encoding:"utf-8"})
		fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.js"), yololtoyazur(), {encoding:"utf-8"})

		const terminal = vscode.window.activeTerminal ? vscode.window.activeTerminal : vscode.window.createTerminal()
		terminal.sendText("node yolol-to-yazur.js")

	}))
	context.subscriptions.push(vscode.commands.registerCommand('yolol-to-yazur.convert', function () {
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
		fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.json"), json, {encoding:"utf-8"})
		fs.writeFileSync(path.join(structure.yololPath, "yolol-to-yazur.js"), yololtoyazur(), {encoding:"utf-8"})
	}))	
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

//yes this is AWFUL practice but files are yuck :trol:
function yololtoyazur() {
	return "//this will NOT work right away, for best results run \"npm init\" and install Yazur from https://github.com/Azurethi/Yazur\n\n/* ########## CONFIG VARIABLES ########## */\n\nconst ticksToExecute = 20 //Number of YOLOL ticks to execute, must be positive integer\n\n/* ########## CONFIG VARIABLES ########## */\n\nconst Yazur = require(\"./Yazur\")\nconst fs = require(\'fs\')\nconst path = require(\'path\')\nconst { yololPath, networks } = require(\"./yolol-to-yazur.json\")\n\nconst main = []\n\nnetworks.forEach(item => {\n    const netmgr = new Yazur.netmgr()\n    const yololChips = item.yololChips.map(chipitem=>{\n        const file = fs.readFileSync(path.join(yololPath, item.networkName, chipitem), {encoding:\"utf-8\"})\n        const chip = new Yazur.yChip(\n            file.split(\"\\n\").map(item=> {return item.replace(\"\\r\", \"\")}),\n            item.networkName,\n            netmgr\n        )\n        chip.fileName = chipitem\n        return chip\n    })\n    const memoryChips = item.memoryChips.map(chipitem=>{\n        const file = fs.readFileSync(path.join(yololPath, item.networkName, chipitem), {encoding:\"utf-8\"})\n        const chip = new Yazur.mChip(\n            file.split(\"\\n\").map(item=> {return item.replace(\"\\r\", \"\")}),\n            item.networkName, \n            netmgr\n        )\n        chip.fileName = chipitem\n        return chip\n    })\n    main.push({\n        name: item.networkName,\n        networkManager: netmgr, \n        yololChips: yololChips,\n        memoryChips: memoryChips\n    })\n})\n\nfor(i=0; i < ticksToExecute; i++) {\n    main.forEach(item=>{\n        item.networkManager.queueTick()\n    })\n    main.forEach(item=>{\n        item.networkManager.doTick()\n    })\n}\n\nlet outputstring = \"<!--- please right click on this file, and choose \'open preview\' --->  \\n\"\nmain.forEach(item=>{\n    outputstring += \"# **\" + item.name + \"**  \\n\"\n    item.yololChips.forEach(yololChip=>{\n        outputstring += \"## *\" + yololChip.fileName + \"*  \\n\"\n        outputstring += \"|Local Variables|Values|Global Variables|Values|  \\n|---|---|---|---|  \\n\"\n        \n        const longer = Object.keys(yololChip.localEnv.vars).length > Object.keys(yololChip.localEnv.global).length ? yololChip.localEnv.vars : yololChip.localEnv.global\n        const global = yololChip.localEnv.global\n        const vars = yololChip.localEnv.vars\n\n        Object.keys(longer).forEach((key, index)=>{\n\n            let row = []\n            let rowstring = \"\"\n\n            Object.keys(vars)[index] ? row.push(Object.keys(vars)[index], vars[Object.keys(vars)[index]].value) : row.push(\"\",\"\")\n            Object.keys(global)[index] ? row.push(Object.keys(global)[index], global[Object.keys(global)[index]].value) : row.push(\"\",\"\")\n            row.forEach((rowitem, index)=>{\n                rowstring += \"|\" + rowitem\n                if(index == 3) {\n                    rowstring += \"|\"\n                }\n            })\n            outputstring += rowstring\n            outputstring += \"  \\n\"\n        })\n        outputstring += \"\\n\\n\"\n    })\n})\nfs.writeFileSync(\"./yolol-to-yazur-output.md\", outputstring, {encoding:\"utf-8\"})\n"
}