const HOST = 'http://localhost:5000'
let fileID = ''
let UPLOAD_INIT_URL = `${HOST}/files`
let UPLOAD_URL = `${HOST}/files/${fileID}/chunked-upload`
let UPLOAD_FINISH_URL = `${HOST}/files/${fileID}/finish-upload`



async function previewFile() {
    const file = document.querySelector('input[type=file]').files[0];
    
   chunks(file)
}

async function chunks(file) {

    const chunksize = 1000000;
    const size = file.size;
    const qtd = Math.ceil(size / chunksize);
    const contentType = file.type;

    var headers = new Headers()
    headers.append('Content-Type', contentType)

    response = await fetch(UPLOAD_INIT_URL, {
        method: 'POST',
        headers: headers
    })

    result = await response.json()
    console.log(result)
    fileID = result.fileID
    UPLOAD_URL = `${HOST}/files/${fileID}/chunked-upload`
    UPLOAD_FINISH_URL = `${HOST}/files/${fileID}/finish-upload`

    split = (start, end, contentType) => {
        const rangeHeader = `bytes ${start}-${end}`;
        const chunk = file.slice(start, end, contentType);
        return {
            rangeHeader,
            chunk
        }
    }

    promises = []
    for (let i = 0; i < qtd; i++) {

        let start = i * chunksize;
        let end = ((i + 1) * chunksize);

        ({rangeHeader, chunk } = split(start, end, contentType))

        headers.set("Content-Range", rangeHeader)

        promises.push(fetch(UPLOAD_URL, {
            method: 'PUT',
            headers: headers,
            body: chunk
        }))

    }

    
    console.log(promises)
    Promise.all(promises).then(() => {
        headers.delete("Content-Range")
        fetch(UPLOAD_FINISH_URL, {
            method: 'PUT',
            headers: headers
        })
    })



}
