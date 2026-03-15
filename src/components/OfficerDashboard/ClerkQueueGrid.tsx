import ClerkCard from './ClerkCard';

interface Clerk {
    id: string;
    name: string;
    pendingCount: number;
}

interface ClerkQueueGridProps {
    clerks: Clerk[];
    onClerkClick: (clerkId: string) => void;
}

const ClerkQueueGrid = ({ clerks, onClerkClick }: ClerkQueueGridProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clerks.map((clerk) => (
                <ClerkCard
                    key={clerk.id}
                    name={clerk.name}
                    clerkId={clerk.id}
                    pendingCount={clerk.pendingCount}
                    onClick={() => onClerkClick(clerk.id)}
                />
            ))}
        </div>
    );
};

export default ClerkQueueGrid;
