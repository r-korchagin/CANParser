const process = require('process');
const fs = require('fs');

// CAN Filter

function exec() {

    let fileName = process.argv[2] || '';

    if (fileName == '') return console.log('Please select file');

    console.log('Open file', process.argv[2]);

    fs.readFile(fileName, 'utf8', function(err, contents) {
        if (err) return console.error(err);
        let arr = [], idListCount = {}, unicSetId = new Set();
        arr = contents.split('\n');
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].split('8').length == 2){
                let id = arr[i].split(' ')[1];
                let data = arr[i].split('8')[1];
                if (idListCount[id] === undefined) idListCount[id] = data;
                else if (idListCount[id] !== data) unicSetId.add(id);
            }
        }

        let unicArr = [...unicSetId];
        for (let i = 0; i < unicArr.length; i++) {
            const el = unicArr[i];
            let currID = arr.filter(v=>el == v.split(' ')[1] );
            console.log(el, currID.length);
            let idFile = currID.join('\n');
            let fileNameId = fileName.split('.')[0]+'_'+el+'.txt';
            fs.writeFile(fileNameId, idFile, (err) => {if (err) throw err;} );
        }

        let filteredId = arr.filter(v=>unicSetId.has( v.split(' ')[1]) );
        let unFilteredId = arr.filter(v=>!unicSetId.has( v.split(' ')[1]) );
        
        fs.writeFile(fileName.split('.')[0]+'_fixed.txt', 
            unFilteredId.join('\n'), (err) => {if (err) throw err;} );

        console.log('Total row' ,arr.length, 'Filtered' , 
            filteredId.length,'Fixed ID' , unFilteredId.length,
            'Changed ID' , unicSetId.size);
    });

}

exec();