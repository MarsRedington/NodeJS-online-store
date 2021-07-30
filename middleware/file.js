const multer = require('multer')

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null, 'images') // место куда записываем файл
    },
    filename(req, file, cb){
        cb(null, Math.floor(Math.random() * 1000).toString() + '-' + file.originalname) //придумали под каким именем записываем файл
    }
})

const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg']

const fileFilter = (req, file, cb) => {
    if(allowedTypes.includes(file.mimetype)){
        // console.log(file.mimetype)
        cb(null, true)
    } else {
        cb(null, false)
    }
}

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter
})