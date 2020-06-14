const chunk = (system, salon) => {

    let _HOST = 'http://localhost:5000';

    let _file;
    let _chunksize = 1000000;
    let _qtd;
    let _contentType;
    let _fileID;

    let observers = []

    const subscribe = (f) => {
        observers.push(f);
    }

    const unsubscribe = (f) => {
        observers = observers.filter(subscriber => subscriber !== f);
    }

    const notify = (data) => {
        observers.forEach(observer => observer(data));
    }    

    const setHost = (host) =>  _HOST = host;

    const setChunkSize = (size) => _chunksize = size;

    const initUpload = async (file) => {

        let UPLOAD_INIT_URL = `${_HOST}/files`

        _file = file
        _contentType = _file.type;
        _qtd = Math.ceil(_file.size / _chunksize);
        let headers = new Headers();

        headers.append('Content-Type', _contentType);

        const request = await fetch(UPLOAD_INIT_URL, {
            method: 'POST',
            headers: headers
        })
    
        const response = await request.json();
        _fileID = response.fileID
    
    }

    const split = (start, end, contentType) => {
        let rangeHeader = `bytes ${start}-${end}`;
        
        let ch = _file.slice(start, end, contentType);
        return {
            rangeHeader,
            ch
        }
    }

    const upload = async () => {

        let UPLOAD_URL = `${_HOST}/files/${_fileID}/chunked-upload`

        let headers = new Headers();

        let cont = 0;

        let promises = []
        for (let i = 0; i < _qtd; i++) {

            let progress
            let start = i * _chunksize;
            let end = ((i + 1) * _chunksize);

            const {rangeHeader, ch } = split(start, end, _contentType)
            
            headers.set("Content-Range", rangeHeader);

            promises.push(fetch(UPLOAD_URL, {
                method: 'PUT',
                headers: headers,
                body: ch
            }).then(() => {
                progress = (++cont / _qtd)
                notify(progress)
            }));

        }

        await Promise.all(promises)

        let UPLOAD_FINISH_URL = `${_HOST}/files/${_fileID}/finish-upload`

        headers = new Headers();
        headers.append('Content-Type', _contentType);
        headers.append('Content-Salon', salon);
        headers.append('Content-System', system);
    
        const response = await fetch(UPLOAD_FINISH_URL, {
            method: 'PUT',
            headers: headers
        })

        if (response.status === 202) {
            return
        } else {
            const body = await response.json()
            return body
        }

    }

    return {
        setChunkSize,
        setHost,
        initUpload,
        upload,
        subscribe,
        unsubscribe
    }
}

export default chunk