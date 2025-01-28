const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

module.exports = {
    findUser: async (colName, query) => {
        try {
            const whereClause = { [colName]: query };
            const user = await prisma.user.findUnique({
                where: whereClause
            })

            return user;
        } catch (error) {
            console.error('Error finding user:', error);
            throw error;
        }
    },
    addUser: async (username, password) => {
        try {
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(hashedPassword);
                });
            });
            const user = await prisma.user.create({
                data: {
                    username: username,
                    password: hashedPassword,
                    folders: {
                        create: {
                            name: `My Library`,
                        }
                    }
                }
            })

            return user;
        }
        catch(error) {
            console.error('Error adding user', error);
            throw error;
        }
    },
    getRootFolder: async (userId) => {
        try {
            const user = await prisma.folder.findFirst({
                where: {
                  userId: userId,
                  parentId: null
                },
                include: {
                  subfolders: true,
                  files: true
                }
            });
            return user;
        }
        catch(error) {
            console.error('Error getting root', error);
            throw error;
        }
    },
    getFolder: async (userId, folderId) => {
        try {
            const folder = await prisma.folder.findFirst({
                where: {
                    id: folderId,
                    userId: userId,
                },
                include: {
                    parent: true,
                    subfolders: {
                        orderBy: {
                            updatedAt: 'desc' // Orders subfolders by updatedAt in descending order
                        }
                    },
                    files: {
                        orderBy: {
                            updatedAt: 'desc' // Orders files by updatedAt in descending order
                        }
                    }
                }
            });
            return folder;
        }
        catch(error) {
            console.error('Error getting folder', error);
            throw error;
        }
    },
    addSubfolder: async (userId, parentId) => {
        try {
            const newSubfolder = await prisma.folder.create({
                data: {
                    name: "New Folder",   // Name of the new subfolder
                    userId: userId,           // User ID to associate with the new subfolder
                    parentId: parentId  // Set parentId to link to the parent folder
                }
            });
            return newSubfolder;
        }
        catch(error) {
            console.error('Error creating subfolder', error);
            throw error;
        }
    },
    addFile: async (name, path, size, folderId) => {
        try {
            const newFile = await prisma.file.create({
                data: {
                    name: name,
                    path: path,
                    size: size,           // User ID to associate with the new subfolder
                    folderId: folderId  // Set parentId to link to the parent folder
                }
            });
            return newFile;
        }
        catch(error) {
            console.error('Error creating file', error);
            throw error;
        }
    },
    getFile: async (fileId) => {
        try {
            const file = await prisma.file.findFirst({
                where: {
                    id: fileId
                },
                include: {
                    folder: true
                }
            })
            return file;
        }
        catch(error) {
            console.error('Error getting file', error);
            throw error;  
        }
    },
    renameEntry: async(type, id, newName) => {
        try {
            const query = {
                where: {
                    id: id
                },
                data: {
                    name: newName,
                }
            };
            if (type === 'folder') {
                const updatedFolder = await prisma.folder.update(query);
                return updatedFolder;
            }
            else if (type === 'file') {
                const updatedFile = await prisma.file.update(query);
                return updatedFile;
            }
        }
        catch(error) {
            console.error('Error renaming', error);
            throw error;
        }
    },
    deleteEntry: async(type, id) => {
        try {
            const query = {
                where: {
                    id: id
                }
            };
            if (type === 'folder') {
                const deleteFolder = await prisma.folder.delete(query);
                return deleteFolder;
            }
            else if (type === 'file') {
                const deleteFile = await prisma.file.delete(query);
                return deleteFile;
            }
        }
        catch(error) {
            console.error('Error renaming', error);
            throw error;
        }
    }
};