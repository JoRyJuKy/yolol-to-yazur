//THIS FILE IS AN EXAMPLE FILE! it should NOT be used, rather the contents copy and pasted into the extension.json

//this will NOT work right away, for best results run "npm init" and install Yazur from https://github.com/Azurethi/Yazur

/* ########## CONFIG VARIABLES ########## */

const ticksToExecute = 20 //Number of YOLOL ticks to execute, must be positive integer

/* ########## CONFIG VARIABLES ########## */

const Yazur = require("./Yazur")
const fs = require('fs')
const path = require('path')
const { yololPath, networks } = require("./yolol-to-yazur.json")

const main = []

networks.forEach(item => {
    const netmgr = new Yazur.netmgr()
    const yololChips = item.yololChips.map(chipitem=>{
        const file = fs.readFileSync(path.join(yololPath, item.networkName, chipitem), {encoding:"utf-8"})
        const chip = new Yazur.yChip(
            file.split("\n").map(item=> {return item.replace("\r", "")}),
            item.networkName,
            netmgr
        )
        chip.fileName = chipitem
        return chip
    })
    const memoryChips = item.memoryChips.map(chipitem=>{
        const file = fs.readFileSync(path.join(yololPath, item.networkName, chipitem), {encoding:"utf-8"})
        const chip = new Yazur.mChip(
            file.split("\n").map(item=> {return item.replace("\r", "")}),
            item.networkName, 
            netmgr
        )
        chip.fileName = chipitem
        return chip
    })
    main.push({
        name: item.networkName,
        networkManager: netmgr, 
        yololChips: yololChips,
        memoryChips: memoryChips
    })
})

for(i=0; i < ticksToExecute; i++) {
    main.forEach(item=>{
        item.networkManager.queueTick()
    })
    main.forEach(item=>{
        item.networkManager.doTick()
    })
}

let outputstring = "<!--- please right click on this file, and choose 'open preview' --->  \n"
main.forEach(item=>{
    outputstring += "# **" + item.name + "**  \n"
    item.yololChips.forEach(yololChip=>{
        outputstring += "## *" + yololChip.fileName + "*  \n"
        outputstring += "|Local Variables|Values|Global Variables|Values|  \n|---|---|---|---|  \n"
        
        const longer = Object.keys(yololChip.localEnv.vars).length > Object.keys(yololChip.localEnv.global).length ? yololChip.localEnv.vars : yololChip.localEnv.global
        const global = yololChip.localEnv.global
        const vars = yololChip.localEnv.vars

        Object.keys(longer).forEach((key, index)=>{

            let row = []
            let rowstring = ""

            Object.keys(vars)[index] ? row.push(Object.keys(vars)[index], vars[Object.keys(vars)[index]].value) : row.push("","")
            Object.keys(global)[index] ? row.push(Object.keys(global)[index], global[Object.keys(global)[index]].value) : row.push("","")
            row.forEach((rowitem, index)=>{
                rowstring += "|" + rowitem
                if(index == 3) {
                    rowstring += "|"
                }
            })
            outputstring += rowstring
            outputstring += "  \n"
        })
        outputstring += "\n\n"
    })
})
fs.writeFileSync("./yolol-to-yazur-output.md", outputstring, {encoding:"utf-8"})
