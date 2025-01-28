const libraryControllers = require('../controllers/libraryControllers');
const express = require('express');

const multer  = require('multer')
const upload = multer({ 
    limits: { fileSize: 10485760 },
    dest: 'uploads/' 
})

const libraryRouter = express.Router();

libraryRouter.get('/', libraryControllers.redirectToRoot);

libraryRouter.get('/:folderId', libraryControllers.renderFolder);

libraryRouter.post('/:folderId/add-subfolder', libraryControllers.createSubfolder);

// Save uploaded_file to local uploads/ folder temporarily
libraryRouter.post('/:folderId/upload', upload.single('uploaded_file'), libraryControllers.uploadFile);

// Get uploaded file
libraryRouter.get('/file/:fileId', libraryControllers.renderFile);

// Download file
libraryRouter.get('/file/:fileId/download', libraryControllers.downloadFile);

// Update + Delete post requests
libraryRouter.post('/:type/:id/rename', libraryControllers.renameByTypeAndId);
libraryRouter.post('/:type/:id/delete',  libraryControllers.deleteByTypeAndId);

module.exports = libraryRouter;