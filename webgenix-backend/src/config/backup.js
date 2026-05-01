import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Native MongoDB Backup Script (JSON Export)
 * This script connects to the database and exports all collections as JSON files.
 * It does NOT require mongodump to be installed.
 */
export const backupDatabase = async () => {
    let connection;
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.resolve(__dirname, '../../../backups');
        const backupPath = path.join(backupDir, `backup-${timestamp}`);

        // Ensure backup directory exists
        if (!fs.existsSync(backupPath)) {
            fs.mkdirSync(backupPath, { recursive: true });
        }

        console.log(`[Backup] Connecting to database: ${env.MONGODB_URI}`);
        connection = await mongoose.createConnection(env.MONGODB_URI).asPromise();
        
        // Get list of all collections
        const collections = await connection.db.listCollections().toArray();
        console.log(`[Backup] Found ${collections.length} collections. Starting export...`);

        for (const collectionInfo of collections) {
            const collectionName = collectionInfo.name;
            console.log(`[Backup] Exporting collection: ${collectionName}...`);
            
            const data = await connection.db.collection(collectionName).find({}).toArray();
            const filePath = path.join(backupPath, `${collectionName}.json`);
            
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        }

        console.log(`[Backup] SUCCESS! Database backed up to: ${backupPath}`);
        return { success: true, path: backupPath };

    } catch (error) {
        console.error(`[Backup] FAILED: ${error.message}`);
        throw error;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
};

// If run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    backupDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
