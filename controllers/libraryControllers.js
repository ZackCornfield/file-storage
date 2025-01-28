const db = require('../db/queries');
const cloudinary = require('../utils/cloudinary.config');

const fs = require('fs');
const path = require('path');

const axios = require('axios');
const formatters = require('../utils/formatters');

module.exports = {
    redirectToRoot: async (req, res) => {
        const rootFolder = await db.getRootFolder(req.user.id);
        res.redirect(`/library/${rootFolder.id}`);
    },
    renderFolder: async (req, res) => {
        const userId = req.user.id;
        const folderId = req.params.folderId;
        const folder = await db.getFolder(userId, folderId);

        // Format data
        const formattedFolder = {
            ...folder,

            formattedCreatedAt: formatters.formatDate(folder.createdAt),
            formattedUpdatedAt: formatters.formatDate(folder.updatedAt),

            subfolders: folder.subfolders.map(subfolder => ({
                ...subfolder,
                formattedCreatedAt: formatters.formatDate(subfolder.createdAt),
                formattedUpdatedAt: formatters.formatDate(subfolder.updatedAt),
            })),

            files: folder.files.map(file => ({
                ...file,
                formattedSize: formatters.formatBytes(file.size),
                formattedCreatedAt: formatters.formatDate(file.createdAt),
                formattedUpdatedAt: formatters.formatDate(file.updatedAt),
            }))
        };

        res.render('library', {
            folder: formattedFolder
        })
    },
    createSubfolder: async (req, res) => {
        const userId = req.user.id;
        const parentId = req.params.folderId;

        await db.addSubfolder(userId, parentId);

        res.redirect(`/library/${parentId}`);
    },



    uploadFile: async (req, res) => {
        if (!req.file) {
            // Redirect back to the referring page
            const redirectUrl = req.get('Referer') || `/`;
            return res.redirect(redirectUrl);
        }
        console.log('uploaded file to uploads:', req.file); // Log the file to see what is being received

        const folderId = req.params.folderId;
        // Multer metadata of upload
        const { originalname, size, path } = req.file;

        try {
            // Upload file to Cloudinary
            const result = await cloudinary.uploader.upload(path, {
                resource_type: 'auto'
            });

            // Add file to database
            await db.addFile(originalname, result.secure_url, size, folderId);

            // Redirect back to the referring page
            const redirectUrl = req.get('Referer') || `/`;
            res.redirect(redirectUrl);

            // Clear temporary local download
            fs.unlinkSync(path);

        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    },
    renderFile: async (req, res) => {
        const fileId = req.params.fileId;
        const file = await db.getFile(fileId);

        res.render('file', {
            file: {
                ...file,
                formattedSize: formatters.formatBytes(file.size),
            }
        });
    },
    downloadFile: async (req, res) => {
        const fileToDownload = req.params.fileId;
        const file = await db.getFile(fileToDownload);

        try {
            // Use Axios to stream the file from Cloudinary
            const response = await axios.get(file.path, { responseType: 'stream' });

            // Set headers for file download
            res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
            res.setHeader('Content-Type', response.headers['content-type']);

            // Stream the file to the response
            response.data.pipe(res);
        } catch (error) {
            console.error('Error downloading file:', error);
            res.redirect(`/library/${file.folderId}`);
        }
    },



    renameByTypeAndId: async (req, res) => {
        const type = req.params.type;
        const idToUpdate = req.params.id;

        const { name } = req.body;

        await db.renameEntry(type, idToUpdate, name);

        // Redirect back to the referring page
        const redirectUrl = req.get('Referer') || `/`;
        res.redirect(redirectUrl);
    },
    deleteByTypeAndId: async (req, res) => {
        const type = req.params.type;
        const idToUpdate = req.params.id;

        await db.deleteEntry(type, idToUpdate);

        // Redirect back to the referring page
        const redirectUrl = req.get('Referer') || `/`;
        res.redirect(redirectUrl);
    }
}