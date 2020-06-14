import chunk from './module/chunck.js'

const print = (data) => {
    document.getElementById("progress").innerText = `${(data * 100).toFixed(2)}%`
}

async function previewFile() {
    const file = document.querySelector('input[type=file]').files[0];
    
    const c = chunk('Planilha', '1337')
    c.subscribe(print)
    await c.initUpload(file)
    const body = await c.upload()

    console.log(body)

}

document.getElementById('file').addEventListener('change', () => {
    previewFile()
})



export default chunk 
