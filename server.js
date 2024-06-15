const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// app.post('/upload', upload.single('file'), (req, res) => {
//   const independentVars = req.body.independentVars.split(',').map(varName => varName.trim());
//   const dependentVar = req.body.dependentVar;
//   const file = req.file;

//   if (!file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   const formData = new FormData();
//   formData.append('file', fs.createReadStream(path.join(__dirname, uploadDir, file.filename)));
//   formData.append('independentVars', independentVars.join(','));
//   formData.append('dependentVar', dependentVar);

//   axios.post('http://localhost:8000/analysis', formData, {
//     headers: formData.getHeaders()
//   })
//   .then(response => {
//     console.log(response.data);
//     fs.unlinkSync(path.join(__dirname, uploadDir, file.filename));
    
//     res.send(response.data)
//   })
//   .catch(error => {
//     console.error('Error sending analysis request:', error);
//     fs.unlinkSync(path.join(__dirname, uploadDir, file.filename));
//     res.status(500).send('Error processing the request.');
//   });
// });

app.use('/upload', require('./routes/analysis.js') )
// React가 NodeJs에 분석 요청 -> NodeJs가 Django에 요청 -> Django가 NodeJs에 결과 응답 -> NodeJs가 React에 응답

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
