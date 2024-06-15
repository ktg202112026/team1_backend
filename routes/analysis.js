const router = require('express').Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
  const independentVars = req.body.independentVars.split(',').map(varName => varName.trim());
  const dependentVar = req.body.dependentVar;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const formData = new FormData();
  const filePath = path.join(uploadDir, file.filename);
  formData.append('file', fs.createReadStream(filePath));
  formData.append('independentVars', independentVars.join(','));
  formData.append('dependentVar', dependentVar);

  axios.post('http://localhost:8000/analysis', formData, {
    headers: formData.getHeaders()
  })
  .then(response => {
    console.log(response.data);
    fs.unlinkSync(filePath);
    res.send(response.data);
  })
  .catch(error => {
    console.error('Error sending analysis request:', error);
    fs.unlinkSync(filePath);
    res.status(500).send('Error processing the request.');
  });
});

module.exports = router;
