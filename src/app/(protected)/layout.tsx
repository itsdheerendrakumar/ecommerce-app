export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-4">
            <p>this is protected layout</p>
            {children}
        </div>
    )
}