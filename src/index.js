import chunk from './module/chunck.js'

async function previewFile() {
    const file = document.querySelector('input[type=file]').files[0];
    
    const c = chunk()
    await c.initUpload(file)
    await c.upload()

}

document.getElementById('file').addEventListener('change', () => {
    previewFile()
})

export default chunk 
