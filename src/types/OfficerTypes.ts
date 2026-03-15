export type OfficerRole = 'CLERK' | 'SECTION_OFFICER' | 'SENIOR_OFFICER' | 'APPROVING_AUTHORITY';

export interface Officer {
    id: string;
    name: string;
    role: OfficerRole;
    department: string;
    designation: string;
}

// Multi-Office Architecture
export interface OfficeState {
    id: string; // e.g., 'WARD-1'
    name: string; // e.g., 'Ward 1 Sub-Office'
    code: string; // e.g., 'W01'
    clerkCount: number;
}

export interface ClerkQueue {
    clerkId: string;
    clerkName: string;
    officeId: string; // Which office this clerk belongs to
    filesPending: number;
}

export interface MovementLog {
    id: string;
    fileId: string;
    fromOfficerId: string;
    fromOfficerName: string;
    toOfficerId: string;
    toOfficerName: string;
    action: 'CREATED' | 'FORWARDED' | 'QUERY_RAISED' | 'APPROVED' | 'REJECTED' | 'QR_TRANSFER' | 'ESCALATED';
    timestamp: string; // ISO String
    notes?: string;
}

export type FileStatus = 'PENDING_REVIEW' | 'QUERY_RAISED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

export interface FileRecord {
    id: string;
    fileId: string; // The human-readable ID (e.g., FILE-2024-001)
    citizenName: string;
    subject: string;
    category: string;
    department?: string;
    createdDate: string; // ISO String

    // Multi-Office and Clerk Tracking
    officeId?: string; // e.g., 'WARD-1'
    clerkId?: string; // The ID of the clerk currently holding/processing it

    // Responsibility Tracking
    currentOfficerId: string;
    previousOfficerId?: string;
    sourceOfficerName?: string; // Where the file came from (Ward-1 Clerk, etc.)
    receivedDate?: string; // When the current officer received it
    lastActionBy: string; // Officer Name
    lastActionDate: string; // ISO String
    lastActionType?: 'FORWARDED' | 'CREATED' | 'QUERY_RAISED' | 'APPROVED' | 'REJECTED' | 'ESCALATED';

    // Status & SLA
    status: FileStatus;
    workflowStage: string; // E.g., "Section Officer Review"
    slaDays: number;
    isDelayed: boolean;
    escalationLevel: number; // 0 = none, 1 = L1, etc.

    // History
    movementHistory: MovementLog[];

    // QR Binding
    qrSerial?: string;

    // Legal Decision Metadata
    decisionTimestamp?: string; // Exact ISO String with seconds
    digitalSignatureToken?: string; // e.g., '0x9fa4b2...'
    decisionIpLog?: string; // IP Address
    decisionSlaUtilized?: number; // % of SLA consumed at decision time
}

// QR Tracking Module
export interface QrLogEntry {
    id: string;
    fileId: string;
    scanType: 'RECEIVE' | 'FORWARD' | 'VERIFY' | 'MISMATCH';
    timestamp: string; // ISO String
    scannedBy: string; // Officer/Clerk ID
    status: 'SUCCESS' | 'FAILED_MISMATCH';
    details?: string; // Reason for mismatch or additional notes
}
