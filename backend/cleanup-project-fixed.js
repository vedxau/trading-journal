#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Configuration
const DELETE_FOLDERS = [
    'node_modules',
    'dist',
    'build',
    '.next',
    '.nuxt',
    'out',
    '.cache',
    '.vite',
    '.turbo',
    'coverage',
    'tmp'
];

// Get project root
const PROJECT_ROOT = process.cwd();

// Utility functions
function getFolderSize(dirPath) {
    try {
        let totalSize = 0;
        function walkDir(dir) {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    walkDir(fullPath);
                } else {
                    totalSize += fs.statSync(fullPath).size;
                }
            }
        }
        walkDir(dirPath);
        return totalSize;
    } catch (error) {
        return 0;
    }
}

function formatBytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}

function deleteFolder(folderPath) {
    try {
        if (fs.existsSync(folderPath)) {
            console.log(`Deleting: ${path.relative(PROJECT_ROOT, folderPath)}`);
            fs.rmSync(folderPath, { recursive: true, force: true });
            return true;
        }
    } catch (error) {
        console.error(`Error deleting ${folderPath}:`, error.message);
    }
    return false;
}

function findAndDeleteFolders(folderName) {
    let deletedCount = 0;
    
    function walkDir(dir) {
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory()) {
                    if (file.name === folderName) {
                        if (deleteFolder(fullPath)) {
                            deletedCount++;
                        }
                    } else if (!file.name.startsWith('.') || file.name === '.next' || file.name === '.nuxt') {
                        try {
                            walkDir(fullPath);
                        } catch (error) {
                            // Skip directories we can't access
                        }
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    walkDir(PROJECT_ROOT);
    return deletedCount;
}

function deleteLogFiles(dirPath) {
    let deletedCount = 0;
    
    function walkDirForLogs(dir) {
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory() && !file.name.startsWith('.')) {
                    try {
                        walkDirForLogs(fullPath);
                    } catch (error) {
                        // Skip directories we can't access
                    }
                } else if (file.isFile() && file.name.endsWith('.log')) {
                    try {
                        console.log(`Deleting log file: ${path.relative(PROJECT_ROOT, fullPath)}`);
                        fs.unlinkSync(fullPath);
                        deletedCount++;
                    } catch (error) {
                        console.error(`Error deleting log file ${fullPath}:`, error.message);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }
    
    walkDirForLogs(dirPath);
    return deletedCount;
}

// Main cleanup function
async function cleanupProject() {
    console.log('🧹 Starting project cleanup...\n');
    
    // Get initial size
    const initialSize = getFolderSize(PROJECT_ROOT);
    console.log(`📊 Initial project size: ${formatBytes(initialSize)} MB\n`);
    
    let totalDeletedFolders = 0;
    let totalDeletedLogFiles = 0;
    
    // Delete specified folders
    console.log('🗑️  Deleting build and dependency folders...');
    DELETE_FOLDERS.forEach(folderName => {
        const count = findAndDeleteFolders(folderName);
        totalDeletedFolders += count;
    });
    
    // Delete log files
    console.log('\n📝 Deleting log files...');
    totalDeletedLogFiles = deleteLogFiles(PROJECT_ROOT);
    
    // Get final size
    const finalSize = getFolderSize(PROJECT_ROOT);
    const savedSpace = initialSize - finalSize;
    
    console.log('\n✅ Cleanup completed!');
    console.log(`📈 Folders deleted: ${totalDeletedFolders}`);
    console.log(`📄 Log files deleted: ${totalDeletedLogFiles}`);
    console.log(`💾 Final project size: ${formatBytes(finalSize)} MB`);
    console.log(`💿 Space saved: ${formatBytes(savedSpace)} MB`);
    
    if (savedSpace > 100 * 1024 * 1024) {
        console.log(`\n🎉 Great! You saved ${formatBytes(savedSpace)} MB of space!`);
    }
}

// Run the cleanup
cleanupProject().catch(console.error);
