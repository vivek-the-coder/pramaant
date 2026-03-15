import { mockFiles } from '../src/data/mockFiles';
import { FileRecord } from '../src/types/OfficerTypes';

console.log("Verifying Officer Dashboard Types...");

const verifyFile = (file: FileRecord) => {
    if (!file.id) throw new Error(`File ${file.fileId} missing ID`);
    if (!file.status) throw new Error(`File ${file.fileId} missing status`);
    if (file.isDelayed && file.slaDays > 100) console.warn(`Warning: File ${file.fileId} has unusually high SLA days`);

    // Check movement history
    if (file.movementHistory.length === 0) console.warn(`Warning: File ${file.fileId} has no movement history`);
    file.movementHistory.forEach(log => {
        if (!log.timestamp) throw new Error(`Log ${log.id} missing timestamp`);
    });
};

try {
    mockFiles.forEach(verifyFile);
    console.log("✅ All mock files verified successfully against FileRecord interface.");
    console.log(`Total Files: ${mockFiles.length}`);
    console.log(`Delayed Files: ${mockFiles.filter(f => f.isDelayed).length}`);
    process.exit(0);
} catch (error) {
    console.error("❌ Verification Failed:", error);
    process.exit(1);
}
