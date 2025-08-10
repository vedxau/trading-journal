#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

const DELETE_FILES = [
    '*.log'
];

// Get project root (where script is run from)
const PROJECT_ROOT = process.cwd();

// Utility functions
function getFolderSize(dirPath) {
    try {
        const output = execSync(`powershell -Command "Get-ChildItem -Path '${dirPath}' -Recurse -File | Measure-Object -Property Length -Sum | Select-Object -ExpandProperty Sum"`, { encoding: 'utf8' });
        return parseInt(output.trim()) || 0;
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

function deleteLogFiles(dirPath) {
    try {
        const output = execSync(`powershell -Command "Get-ChildItem -Path '${dirPath}' -Recurse -Filter '*.log' -File | Select-Object -ExpandProperty FullName"`, { encoding: 'utf8' });
        const logFiles = output.trim().split('\n').filter(f => f);
        
        logFiles.forEach(logFile => {
            try {
                console.log(`Deleting log file: ${path.relative(PROJECT_ROOT, logFile)}`);
                fs.unlinkSync(logFile);
            } catch (error) {
                console.error(`Error deleting log file ${logFile}:`, error.message);
            }
        });
        
        return logFiles.length;
    } catch (error) {
        return 0;
    }
}

function findAndDeleteFolders(folderName) {
    try {
        const output = execSync(`powershell -Command "Get-ChildItem -Path '${PROJECT_ROOT}' -Recurse -Directory -Name '${folderName}' -Force | Select-Object -ExpandProperty FullName"`, { encoding: 'utf8' });
        const folders = output.trim().split('\n').filter(f => f);
        
        let deletedCount = 0;
        folders.forEach(folder => {
            if (deleteFolder(folder)) {
                deletedCount++;
            }
        });
        
        return deletedCount;
    } catch (error) {
        return 0;
    }
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
    
    if (savedSpace > 100 * 1024 * 1024) { // More than 100 MB
        console.log(`\n🎉 Great! You saved ${formatBytes(savedSpace)} MB of space!`);
    }
}

// Run the cleanup
cleanupProject().catch(console.error);
