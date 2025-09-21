//모듈
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = `public/uploads`;

const ensureUploadFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // 상위 폴더까지 자동 생성
  }
};

// 멀터 저장소 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 요청에서 지정한 목적에 따라 폴더 생성 (req.uploadTarget 없으면 'default')
    const folder = req.uploadTarget || "default";
    const uploadPath = path.join(__dirname, "..", "uploads", folder); // ex: /uploads/notice
    ensureUploadFolder(uploadPath);
    cb(null, uploadPath);
  },

  // 파일명을 원래 파일명 + 타임스탬프로 저장
  filename: function (req, file, cb) {
    const parsed = path.parse(file.originalname); // { name: '파일이름', ext: '.jpg' }
    const fname = `${parsed.name}-${Date.now()}${parsed.ext}`;
    cb(null, fname);
  },
});

// 업로드 미들웨어 export
const upload = multer({ storage });
module.exports = upload;
