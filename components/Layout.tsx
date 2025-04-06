import { SidebarProvider } from "@/components/ui/sidebar"; // SidebarProvider for managing state
import AppSidebar from "../components/Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 bg-muted">{children}</main>
        </SidebarProvider>
    );
};

export default Layout;
