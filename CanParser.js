/**
 * CAN Parser
 */

const process = require('process');
const fs = require('fs');

function execute() {
    let fileName = process.argv[2] || '';
    if (fileName == '') return console.log('Please set file');
    console.log('Open file', process.argv[2]);

    fs.readFile(fileName, 'utf8', function(err, contents) {
        if (err) return console.error(err);
        fs.readFile('PGN_Data.json', 'utf8', function(err, pgnJson) {
            if (err) return console.error(err);
            parser(contents.split('\n'),JSON.parse(pgnJson));
        });
    });
}

/**
 * 
 * @param {Array.<String>} content 
 * @param {Object} pgn 
 */
function parser(content, pgn) {
    let parsedData = [];
    let notFound = [], notFoundUnic = [];
    for (let i = 0; i < content.length; i++) {
        let line = content[i];
        if (line.split(' ').length > 5 ){
            let time = line.split(' ')[0];
            let idStr = line.split(' ')[1];
            let dataStr = line.slice(18,line.length);
            let id = parseInt(idStr.slice(2,6),16);
            if (pgn[id] !== undefined)
                parsedData = parsedData.concat(selectData(pgn[id], dataStr, time, id, idStr));
            else 
                if (!isNaN(id)){
                    notFound.push(idStr +
                        ' [' + id + '] ' +
                        time + ' ' +
                        dataStr.trim().split(' ').reverse().join(' '));
                    if (notFoundUnic.indexOf(id) === -1)
                        notFoundUnic.push(id);
                }
        }
    }
    writeFile(process.argv[2].split('.')[0]+'_parsed.txt',
     parsedData.join('\n'));
    writeFile(process.argv[2].split('.')[0]+'_notFound.txt',
     notFound.join('\n'));
    if (notFoundUnic.length > 0) 
        console.log('Not Found ', notFoundUnic.length, 'PGN');
    console.log('Result saved at ', process.argv[2].split('.')[0]+'_parsed.txt');
}

/**
 * 
 * @param {String} data 
 */
function writeFile(fileName, data) {
    fs.writeFile(fileName, 
            data, (err) => {if (err) throw err;} );
}

/**
 * 
 * @param {Object} pgn 
 * @param {String} Data 
 */
function selectData(pgn, Data, time, id, idStr) {
    let parsedData = [];
    for (let spn in pgn) {
        let d = getSPN(pgn[spn], Data);
        if (d !== undefined){
            let r =idStr +
                ' ['+ id + '] ' +
                time + ' ' +
                 pgn[spn].Name + 
                 ' ('+spn+') ' + 
                 d + ' ' + 
                 pgn[spn].Units;
            // console.log(r);
            if (pgn[spn].Units !== 'bit')
                parsedData.push(r);
        }
    }
    return parsedData;
}

/**
 * 
 * @param {Object} spn 
 * @param {String} data 
 */
function getSPN(spn, data){
    let pos = spn.pos;
    // console.log('spn pos', pos);
    let resolution = parseFloat(spn.Resolution).toFixed(6);
    let Offset = parseFloat(spn.Offset);
    if (pos.indexOf('.') == -1 && pos.indexOf('-') == -1){
        // 1 byte  8 bit
        let bytePos = parseInt(pos);
        return parseInt(data.split(' ')[bytePos-1], 16)*resolution+Offset;
    }
    if (pos.indexOf('.') > -1 && pos.indexOf('-') == -1){
        // 1 byte less 8 bit
        let bytePos = parseInt(pos.split('.')[0],10);
        let byte = parseInt(data.split(' ')[bytePos-1],16);
        let startBit = parseInt(pos.split('.')[1],10);
        let len = parseInt(spn.SPN_length);
        // left shift
        byte = byte << 7-len+startBit;
        // Cut 
        byte = byte & 0x00FF;
        // Right shift
        byte = byte >> 8-len;
        return byte * resolution + Offset;
    }
    if (pos.indexOf('.') == -1 && pos.indexOf('-') > -1){
        // Some bytes
        let startByte = parseInt(pos.split('-')[0],10);
        let stopByte = parseInt(pos.split('-')[1],10);
        let dataArr = data.split(' ');
        let unionData = '';
        for (let i = startByte; i <= stopByte; i++) {
            unionData  += ' ' + dataArr[i-1];
        }
        unionData = unionData.split(' ').reverse().join('');
        return parseInt(unionData,16) * resolution + Offset;
    }
    if (pos.indexOf('.') == -1 && pos.indexOf('-') > -1){
        console.log('Please send source file to Developer');
    }
    /*
    if (pos.indexOf('.') == -1 && pos.indexOf('-') > -1){
        // R.x-S.w or R.x-S or R-S.w    
        let startByte = parseInt(pos.split('-')[0].split('.')[0],10);
        let startBit = parseInt(pos.split('-')[0].split('.')[1],10);
        let stopByte = parseInt(pos.split('-')[1].split('.')[0],10);
        let stopBit = parseInt(pos.split('-')[1].split('.')[1],10);
        let unionArr = [];
        for (let i = startByte; i <= stopByte; i++) {
            unionArr.push(parseInt(dataArr[i-1],16));
        }
        if (!isNaN(startBit)) {
            let first = unionArr[0];
            let len = 8-startBit;
            // left shift
            first = first << 7-len+startBit;
            // Cut 
            first = first & 0x00FF;
            // Right shift
            first = first >> 8-len;
            // return pos
            first = first << startBit;
        }

    }*/
}

execute();