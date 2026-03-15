import type { FileRecord, MovementLog, OfficeState, QrLogEntry } from '../types/OfficerTypes';

const currentUser = "OFFICER-001"; // Mock Logged In User

export const mockOffices: OfficeState[] = [
    { id: 'WARD-1', name: 'Ward 1 Sub-Office', code: 'W01', clerkCount: 4 },
    { id: 'WARD-2', name: 'Ward 2 Sub-Office', code: 'W02', clerkCount: 3 },
    { id: 'TEHSIL', name: 'Tehsil Headquarters', code: 'HQ', clerkCount: 8 }
];

const logEntry = (id: string, fileId: string, action: MovementLog['action'], from: string, to: string, timeOffsetHours: number, notes?: string): MovementLog => ({
    id,
    fileId,
    fromOfficerId: from,
    fromOfficerName: from === currentUser ? "You" : `Officer ${from}`,
    toOfficerId: to,
    toOfficerName: to === currentUser ? "You" : `Officer ${to}`,
    action,
    timestamp: new Date(Date.now() - timeOffsetHours * 60 * 60 * 1000).toISOString(),
    notes
});

export const mockFiles: FileRecord[] = [
    {
        id: "1",
        fileId: "FILE-2024-001",
        citizenName: "Ramesh Gupta",
        subject: "Land Registry Mutation Request - Plot 45B",
        category: "Land Revenue",
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago

        // Multi-office routing
        officeId: 'WARD-1',
        clerkId: 'CLERK-01',

        currentOfficerId: currentUser,
        sourceOfficerName: "Ward-1 Clerk",
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "Clerk Sharma",
        lastActionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "FORWARDED",
        status: "PENDING_REVIEW",
        workflowStage: "Clerk Verification",
        slaDays: 7,
        isDelayed: false,
        escalationLevel: 0,
        movementHistory: [
            logEntry("Log-1", "FILE-2024-001", "CREATED", "CLERK-01", currentUser, 48, "Initial creation")
        ]
    },
    {
        id: "2",
        fileId: "FILE-2024-002",
        citizenName: "Sita Verma",
        subject: "Pension Disbursement Issue - March 2024",
        category: "Social Welfare",
        createdDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago

        officeId: 'TEHSIL',
        clerkId: 'CLERK-06',

        currentOfficerId: currentUser,
        sourceOfficerName: "Pension Section Clerk",
        receivedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Held for 8 days
        lastActionBy: "Section Officer Rao",
        lastActionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "FORWARDED",
        status: "PENDING_REVIEW",
        workflowStage: "Section Officer Review",
        slaDays: 10,
        isDelayed: true, // Overdue
        escalationLevel: 0,
        movementHistory: [
            logEntry("Log-2-A", "FILE-2024-002", "CREATED", "CLERK-06", "SO-01", 240),
            logEntry("Log-2-B", "FILE-2024-002", "FORWARDED", "SO-01", currentUser, 230, "Please review urgently.")
        ]
    },
    {
        id: "3",
        fileId: "FILE-2024-003",
        citizenName: "Amit Singh",
        subject: "Road Construction Approval - Sector 12",
        category: "Public Works",
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'WARD-2',
        clerkId: 'CLERK-04',

        currentOfficerId: currentUser,
        sourceOfficerName: "PWD Desktop Clerk",
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "System",
        lastActionDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        lastActionType: "ESCALATED",
        status: "ESCALATED",
        workflowStage: "Final Approval",
        slaDays: 7,
        isDelayed: true,
        escalationLevel: 2, // High Escalation
        movementHistory: [
            logEntry("Log-3-A", "FILE-2024-003", "CREATED", "CLERK-04", currentUser, 360),
            logEntry("Log-3-B", "FILE-2024-003", "QUERY_RAISED", currentUser, "CLERK-04", 300, "Incomplete docs"),
            logEntry("Log-3-C", "FILE-2024-003", "FORWARDED", "CLERK-04", currentUser, 200, "Docs added"),
        ]
    },
    {
        id: "4",
        fileId: "FILE-2024-004",
        citizenName: "Priya Sharma",
        subject: "Scholarship Application - Merit Based",
        category: "Education",
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'WARD-1',
        clerkId: 'CLERK-01',

        currentOfficerId: "OFFICER-002", // Not with current user
        sourceOfficerName: "Education Dept Clerk",
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "You",
        lastActionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActionType: "APPROVED",
        status: "APPROVED",
        workflowStage: "Disbursement",
        slaDays: 15,
        isDelayed: false,
        escalationLevel: 0,
        // Legal Decision Metadata
        decisionTimestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        digitalSignatureToken: "0x9fa4b2e8c1d3f6a7...",
        decisionIpLog: "192.168.1.104",
        decisionSlaUtilized: 13.3, // 2 days out of 15
        movementHistory: [
            logEntry("Log-4-A", "FILE-2024-004", "CREATED", "CLERK-01", currentUser, 48),
            logEntry("Log-4-B", "FILE-2024-004", "APPROVED", currentUser, "OFFICER-002", 2, "Verified and approved.")
        ]
    },
    {
        id: "5",
        fileId: "FILE-2024-005",
        citizenName: "Vikram Malhotra",
        subject: "New Borewell Connection Request",
        category: "Water Resources",
        createdDate: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000).toISOString(), // Near expiry (6.5/7 days)

        officeId: 'WARD-2',
        clerkId: 'CLERK-03',

        currentOfficerId: currentUser,
        sourceOfficerName: "Groundwater Dept",
        receivedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "Clerk Verma",
        lastActionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "FORWARDED",
        status: "PENDING_REVIEW",
        workflowStage: "Technical Survey",
        slaDays: 7,
        isDelayed: false,
        escalationLevel: 0,
        movementHistory: [
            logEntry("Log-5-A", "FILE-2024-005", "CREATED", "CLERK-03", currentUser, 24)
        ]
    },
    {
        id: "6",
        fileId: "FILE-2024-006",
        citizenName: "Rahul Dravid",
        subject: "Property Tax Assessment Dispute",
        category: "Revenue",
        createdDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'HQ',
        clerkId: 'CLERK-08',

        currentOfficerId: currentUser,
        sourceOfficerName: "System",
        receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "System (Auto-Escalation)",
        lastActionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "ESCALATED",
        status: "ESCALATED",
        workflowStage: "Tax Officer Review",
        slaDays: 15,
        isDelayed: true,
        escalationLevel: 1, // Auto-Escalated due to SLA
        movementHistory: [
            logEntry("Log-6-A", "FILE-2024-006", "CREATED", "CLERK-08", "TAX-OFFICER-1", 600),
            logEntry("Log-6-B", "FILE-2024-006", "ESCALATED", "System", currentUser, 48, "SLA Breached (>15 days at Tax Officer Level)")
        ]
    },
    {
        id: "7",
        fileId: "FILE-2024-007",
        citizenName: "Anjali Desai",
        subject: "Commercial License Renewal - Category A",
        category: "Licensing",
        createdDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'WARD-1',
        clerkId: 'CLERK-02',

        currentOfficerId: currentUser,
        sourceOfficerName: "Licensing Inspector",
        receivedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "Inspector Singh",
        lastActionDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        lastActionType: "ESCALATED",
        status: "ESCALATED",
        workflowStage: "Final Approval",
        slaDays: 10,
        isDelayed: false, // Not delayed, just flagged for manual review
        escalationLevel: 1, // Manual Escalation
        movementHistory: [
            logEntry("Log-7-A", "FILE-2024-007", "CREATED", "CLERK-02", "INSPECTOR-1", 96),
            logEntry("Log-7-B", "FILE-2024-007", "ESCALATED", "INSPECTOR-1", currentUser, 4, "High value commercial property. Seeking higher authority review before final sign-off.")
        ]
    },
    {
        id: "8",
        fileId: "FILE-2024-008",
        citizenName: "Neha Sharma",
        subject: "Trade License Application - Bakery",
        category: "Licensing",
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'HQ',
        clerkId: 'CLERK-05',

        currentOfficerId: 'DISPATCH-CLERK-1',
        sourceOfficerName: "You",
        receivedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "You",
        lastActionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "APPROVED",
        status: "APPROVED",
        workflowStage: "Dispatch",
        slaDays: 15,
        isDelayed: false,
        escalationLevel: 0,
        decisionTimestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        digitalSignatureToken: "0x4b7c91a2d3e4f5...",
        decisionIpLog: "192.168.1.104",
        decisionSlaUtilized: 83.3, // 25 days out of 30
        movementHistory: [
            logEntry("Log-8-A", "FILE-2024-008", "CREATED", "CLERK-05", currentUser, 160),
            logEntry("Log-8-B", "FILE-2024-008", "APPROVED", currentUser, "DISPATCH-CLERK-1", 120, "All documents verified and found to be in order. License approved.")
        ]
    },
    {
        id: "9",
        fileId: "FILE-2024-009",
        citizenName: "Gajendra Singh",
        subject: "Gun License Renewal",
        category: "Home Affairs",
        createdDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),

        officeId: 'TEHSIL',
        clerkId: 'CLERK-07',

        currentOfficerId: 'RECORDS-CLERK',
        sourceOfficerName: "You",
        receivedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionBy: "You",
        lastActionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastActionType: "REJECTED",
        status: "REJECTED",
        workflowStage: "Closed",
        slaDays: 30,
        isDelayed: false,
        escalationLevel: 0,
        decisionTimestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        digitalSignatureToken: "0xe5f6a7b8c9d0e1...",
        decisionIpLog: "192.168.1.104",
        decisionSlaUtilized: 100, // 30 days used
        movementHistory: [
            logEntry("Log-9-A", "FILE-2024-009", "CREATED", "CLERK-07", "POLICE-VERIFY", 800),
            logEntry("Log-9-B", "FILE-2024-009", "FORWARDED", "POLICE-VERIFY", currentUser, 400),
            logEntry("Log-9-C", "FILE-2024-009", "REJECTED", currentUser, "RECORDS-CLERK", 240, "Police verification failed due to pending criminal case. Application rejected.")
        ]
    }
];

export const mockQrLogs: QrLogEntry[] = [
    {
        id: "QR-LOG-001",
        fileId: "FILE-2024-001",
        scanType: "RECEIVE",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        scannedBy: currentUser,
        status: "SUCCESS"
    },
    {
        id: "QR-LOG-002",
        fileId: "FILE-2024-002",
        scanType: "FORWARD",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        scannedBy: currentUser,
        status: "SUCCESS",
        details: "Transferred custody to Section Officer Rao"
    },
    {
        id: "QR-LOG-003",
        fileId: "FILE-2024-003",
        scanType: "MISMATCH",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        scannedBy: "CLERK-04",
        status: "FAILED_MISMATCH",
        details: "Attempted SCAN_RECEIVE but system shows file physically with PWD Desktop Clerk"
    },
    {
        id: "QR-LOG-004",
        fileId: "FILE-2024-004",
        scanType: "VERIFY",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        scannedBy: currentUser,
        status: "SUCCESS"
    }
];
