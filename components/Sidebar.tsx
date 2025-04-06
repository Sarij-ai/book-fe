import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Clock,
    ChevronRight,
    ChevronLeft,
    Settings,
    Sun,
    Moon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const AppSidebar = () => {
    const { state, toggleSidebar } = useSidebar();
    const [isDark, setIsDark] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        {
            label: "Explore Books",
            href: "/",
            icon: <BookOpen className="mr-2 h-4 w-4" />,
        },
        {
            label: "Previous Books",
            href: "/access-books",
            icon: <Clock className="mr-2 h-4 w-4" />,
        },
    ];

    const toggleTheme = () => {
        setIsDark((prev) => !prev);
        document.documentElement.classList.toggle("dark", !isDark);
    };

    return (
        <Sidebar
            collapsible="icon"
            className={`transition-all bg-gray-800 text-white ${state === "expanded" ? "w-64" : "w-20"
                }`}
        >
            {/* Sidebar Header */}
            <SidebarHeader className="p-4 bg-gray-800 text-white relative flex items-center">
                {state === "expanded" ? (
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2">
                            <BookOpen className="mt-1 h-6 w-6 text-white" />
                            <h2 className="text-xl font-semibold">BookApp</h2>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={toggleSidebar}
                            className="dark:hover:bg-gray-600 dark:text-gray-100 text-gray-100  hover:bg-gray-600"
                        >

                            <ChevronLeft className="h-5 w-5" />

                        </Button>
                    </div>
                ) : (
                    <div className="gap-y-2">
                        <Button
                            variant="ghost"
                            onClick={toggleSidebar}
                            className="dark:hover:bg-gray-600 dark:text-gray-100 mb-2 hover:bg-gray-600 dark:bg-gray-800 text-gray-100"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <BookOpen className="h-6 w-6 mx-auto text-white" />
                    </div>
                )}



            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent className="bg-gray-900 text-gray-200 space-y-4 py-2">
                <SidebarGroup>
                    {links.map((link) => (
                        <Button
                            key={link.href}
                            onClick={() => router.push(link.href)}
                            className={`w-full hover:bg-gray-800 hover:text-gray-200 bg-gray-900 text-gray-200 justify-start p-0 !px-2 my-1 ${pathname === link.href ? "bg-gray-700 text-white" : ""}`}
                        >
                            {link.icon}
                            {state === "expanded" && link.label}
                        </Button>
                    ))}
                </SidebarGroup>
            </SidebarContent>

            {/* Sidebar Footer */}
            <SidebarFooter className="p-0 m-0 bg-gray-800 text-gray-200">
                <div className="p-1 bg-gray-900 m-2 rounded-md">
                    {state === "expanded" ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full hover:bg-gray-900 hover:text-white justify-start !px-2">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuItem onClick={toggleTheme}>
                                    {isDark ? (
                                        <Sun className="mr-2 h-4 w-4" />
                                    ) : (
                                        <Moon className="mr-2 h-4 w-4" />
                                    )}
                                    {isDark ? "Light Mode" : "Dark Mode"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button

                            onClick={toggleSidebar}
                            className="w-full justify-start p-0 !px-2"
                        >
                            <Settings className="mr-2 !px-0 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
