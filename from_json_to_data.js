const fs = require('fs');

/**
 * 
 * @param {String} reolution 
 */
function getResolution(resolution) {
    if (resolution.indexOf('states') > -1) return 1;
    let result = NaN, inputString = resolution.split(' ')[0];
    if (resolution.indexOf('.')>-1) result = parseFloat( inputString ).toFixed(6);
    else if (inputString.indexOf('/') > -1) {
        let f = parseInt( resolution.split('/')[0] );
        let s = parseInt( resolution.split('/')[1] );
        if (isNaN(s)) result = resolution.split('/')[0];
        else result = f/s;
        return result;
    }
    else result = parseInt( inputString );
    if (isNaN(result)){ 
        console.error('Incorrect resolution',resolution);
        return 1;
    }
    return result;
}

fs.readFile('j_1939.json', 'utf8', function(err, contents) {
    if (err) return console.error(err);
    let jsonFile = JSON.parse(contents);
    let jsonData = {};
    jsonFile.forEach(el => {
        let pgn = el.PGN || 99999;
        let spn = el.SPN || 0;
        // console.log(pgn,spn);
        if (jsonData[pgn] === undefined){
            jsonData[pgn] = {};
            jsonData[pgn][spn]= {};
            jsonData[pgn][spn].pos = el.pos;
            jsonData[pgn][spn].Name = el.Name;
            jsonData[pgn][spn].SPN_length = el['SPN length'];
            jsonData[pgn][spn].PGN_Length = el['PGN Length'];
            jsonData[pgn][spn].Offset = el.Offset;
            jsonData[pgn][spn].Units = el.Units;
            jsonData[pgn][spn].Resolution = getResolution(el.Resolution);
            jsonData[pgn][spn].Data_Range = el['Data Range'];
            // console.log(el.Resolution, getResolution(el.Resolution));
        }
    });
    fs.writeFile('PGN_Data.json', 
    JSON.stringify(jsonData), (err) => {if (err) throw err;} );

    console.log('Converted');
});