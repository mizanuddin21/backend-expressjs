import multer from 'multer'

// Set up Multer for file upload
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    // Accept only xlsx files
    const isXlsx = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                   file.mimetype === 'application/vnd.ms-excel'
    if (isXlsx) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type, only XLSX files are allowed!'), false)
    }
  }
})

export default upload
