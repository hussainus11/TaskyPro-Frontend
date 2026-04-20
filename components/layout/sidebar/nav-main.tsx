"use client";

import * as React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar
} from "@/components/ui/sidebar";
import {
  ActivityIcon,
  ArchiveRestoreIcon,
  BadgeDollarSignIcon,
  BrainCircuitIcon,
  BrainIcon,
  Building2Icon,
  CalendarIcon,
  ChartBarDecreasingIcon,
  ChartPieIcon,
  ChevronRight,
  ClipboardCheckIcon,
  ClipboardMinusIcon,
  ComponentIcon,
  CookieIcon,
  FingerprintIcon,
  FolderDotIcon,
  FolderIcon,
  GaugeIcon,
  GraduationCapIcon,
  ImagesIcon,
  KeyIcon,
  MailIcon,
  MessageSquareIcon,
  ProportionsIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SquareCheckIcon,
  StickyNoteIcon,
  UserIcon,
  UsersIcon,
  WalletMinimalIcon,
  type LucideIcon,
  GithubIcon,
  RedoDotIcon,
  BrushCleaningIcon,
  CreditCardIcon,
  SpeechIcon,
  MessageSquareHeartIcon,
  BookAIcon,
  PuzzleIcon,
  HardDrive,
  GroupIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  Plus,
  Package,
  ShoppingCart,
  FileText,
  List,
  GripVertical,
  RotateCcw,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { DashboardIcon } from "@radix-ui/react-icons";
import { usePermissionCheck } from "@/hooks/use-permission";
import { toast } from "sonner";
import { customEntityPageApi, menuItemsApi, settingsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type NavItem = {
  title: string;
  href: string;
  icon?: LucideIcon;
  isComing?: boolean;
  isDataBadge?: string;
  isNew?: boolean;
  newTab?: boolean;
  items?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Hide items/sections from the sidebar (even if present in DB menus)
const HIDDEN_GROUP_TITLES = new Set<string>(["AI Apps"]);
const HIDDEN_ITEM_HREFS = new Set<string>([
  "/dashboard/apps/api-keys",
  "/dashboard/pages/user-profile",
]);
const HIDDEN_ITEM_TITLES = new Set<string>(["Api Keys", "Profile V2"]);

function filterNavItemsDeep(items: NavItem[]): NavItem[] {
  return items
    .filter((i) => {
      if (HIDDEN_ITEM_HREFS.has(i.href)) return false;
      if (HIDDEN_ITEM_TITLES.has(i.title)) return false;
      return true;
    })
    .map((i) => ({
      ...i,
      items: i.items ? filterNavItemsDeep(i.items) : undefined,
    }))
    .filter((i) => (i.items ? i.items.length > 0 || i.href !== "#" : true));
}

function filterNavGroups(groups: NavGroup[]): NavGroup[] {
  return groups
    .filter((g) => !HIDDEN_GROUP_TITLES.has(g.title))
    .map((g) => ({ ...g, items: filterNavItemsDeep(g.items) }))
    .filter((g) => g.items.length > 0);
}

function filterNavByUserSelection(groups: NavGroup[], selectedIds: string[] | null): NavGroup[] {
  const normalizeId = (href: string) =>
    href
      .trim()
      .replace(/\/+$/, "")
      .replace(/\?[\s\S]*$/, "");

  const selected = new Set(
    (selectedIds || [])
      .filter((x) => typeof x === "string" && x.length > 0)
      .map((x) => normalizeId(x))
  );
  // If user didn't configure anything, keep default behavior (show all).
  if (selected.size === 0) return groups;

  const keepDeep = (items: NavItem[]): NavItem[] => {
    const next: NavItem[] = [];
    for (const item of items) {
      const keptChildren = item.items ? keepDeep(item.items) : undefined;
      const keepSelf =
        item.href && item.href !== "#"
          ? selected.has(normalizeId(item.href))
          : false;
      const keepBecauseChildren = !!keptChildren && keptChildren.length > 0;
      if (!keepSelf && !keepBecauseChildren) continue;
      next.push({
        ...item,
        items: keptChildren,
      });
    }
    return next;
  };

  return groups
    .map((g) => ({ ...g, items: keepDeep(g.items) }))
    .filter((g) => g.items.length > 0);
}

// Icon mapping from string names to icon components
const iconMap: Record<string, LucideIcon> = {
  ChartPie: ChartPieIcon,
  Users: UsersIcon,
  MessageSquare: MessageSquareIcon,
  FolderDot: FolderDotIcon,
  ClipboardMinus: ClipboardMinusIcon,
  Component: ComponentIcon,
  Folder: FolderIcon,
  ArchiveRestore: ArchiveRestoreIcon,
  Group: GroupIcon,
  LayoutDashboard: LayoutDashboardIcon,
  ShoppingBag: ShoppingBagIcon,
  Package: Package,
  Plus: Plus,
  ShoppingCart: ShoppingCart,
  FileText: FileText,
  RotateCcw: RotateCcw,
  BadgeDollarSign: BadgeDollarSignIcon,
  ChartBar: ChartBarDecreasingIcon,
  User: UserIcon,
  Settings: SettingsIcon,
  List: List,
  ClipboardCheck: ClipboardCheckIcon,
  CreditCard: CreditCardIcon,
  Wallet: WalletMinimalIcon,
  Building2: Building2Icon,
  StickyNote: StickyNoteIcon,
  MessageSquareHeart: MessageSquareHeartIcon,
  Mail: MailIcon,
  SquareCheck: SquareCheckIcon,
  Calendar: CalendarIcon,
  Key: KeyIcon,
  Cookie: CookieIcon,
  Brain: BrainIcon,
  BrainCircuit: BrainCircuitIcon,
  Images: ImagesIcon,
  Speech: SpeechIcon,
  Fingerprint: FingerprintIcon,
  Brush: BrushCleaningIcon,
  Puzzle: PuzzleIcon,
  History: HistoryIcon,
  Workflow: Workflow,
};

// Helper function to get icon component from string name
const getIcon = (iconName?: string | null): LucideIcon | undefined => {
  if (!iconName) return undefined;
  return iconMap[iconName] || undefined;
};

// Helper function to get icon name from icon component (reverse mapping)
const getIconName = (icon: LucideIcon | undefined): string | null => {
  if (!icon) return null;
  // Find the key in iconMap that matches this icon component
  for (const [name, iconComponent] of Object.entries(iconMap)) {
    if (iconComponent === icon) {
      return name;
    }
  }
  return null;
};

// Transform API menu items to NavItem format
const transformMenuItem = (item: any): NavItem & { id?: number } => {
  const navItem: NavItem & { id?: number } = {
    title: item.title,
    href: item.href,
    icon: getIcon(item.icon),
    isComing: item.isComing || false,
    isDataBadge: item.isDataBadge || undefined,
    isNew: item.isNew || false,
    newTab: item.newTab || false,
    id: item.id, // Store the database ID for reordering
  };

  if (item.items && item.items.length > 0) {
    navItem.items = item.items.map(transformMenuItem);
  }

  return navItem;
};

// Default nav items (fallback)
export const defaultNavItems: NavGroup[] = [
  {
    title: "Dashboards",
    items: [
      {
        title: "Default",
        href: "/dashboard/default",
        icon: ChartPieIcon
      },
      {
        title: "Collaboration",
        href: "#",
        icon: UsersIcon,
        items: [
          {
            title: "Messenger",
            href: "/dashboard/apps/chat",
            icon: MessageSquareIcon
          },
          {
            title: "Feed",
            href: "/dashboard/collaboration/feed",
            icon: FolderDotIcon
          },
          {
            title: "Collabs",
            href: "/dashboard/collaboration/collabs",
            icon: ClipboardMinusIcon
          },
          {
            title: "Online Documents",
            href: "/dashboard/collaboration/documents",
            icon: ComponentIcon
          },
          {
            title:"File Manager",
            href: "/dashboard/file-manager",
            icon: FolderIcon,
            items: [
              {
                title: "Dashboard",
                href: "/dashboard/file-manager",
                icon: FolderIcon,
              },
              {
                title: "File Manager",
                href: "/dashboard/apps/file-manager",
                icon: ArchiveRestoreIcon,
              },
            ]
          },
          {
            title:"Work Groups",
            href:"/dashboard/collaboration/work-groups",
            icon: GroupIcon
          },
          {
            title:"Boards",
            href:"/dashboard/collaboration/boards",
            icon: LayoutDashboardIcon
          }
        ]
      },
      {
        title: "E-commerce",
        href: "#",
        icon: ShoppingBagIcon,
        items: [
          { title: "Dashboard", href: "/dashboard/ecommerce", icon: ChartPieIcon },
          { title: "Product List", href: "/dashboard/pages/products", icon: Package },
          { title: "Add Product", href: "/dashboard/pages/products/create", icon: Plus },
          { title: "Customers", href: "/dashboard/crm/customers", icon: UsersIcon },
          { title: "Order List", href: "/dashboard/pages/orders", icon: ShoppingCart },
          { title: "Order Detail", href: "/dashboard/pages/orders/detail", icon: FileText },
          { title: "Returns", href: "/dashboard/pages/returns", icon: RotateCcw }
        ]
      },
      { title: "Sales", href: "/dashboard/sales", icon: BadgeDollarSignIcon },
      { 
        title: "CRM", 
        href: "#", 
        icon: ChartBarDecreasingIcon,
        items: [
          { title: "Dashboard", href: "/dashboard/crm", icon: ChartPieIcon },
          { title: "Leads", href: "/dashboard/crm/leads", icon: UserIcon },
          { title: "Contacts", href: "/dashboard/crm/contacts", icon: UsersIcon },
          { title: "Deals", href: "/dashboard/crm/deals", icon: BadgeDollarSignIcon },
          { title: "Form Builder", href: "/dashboard/pages/form-builder", icon: ComponentIcon },
          { title: "Settings", href: "/dashboard/crm/settings", icon: SettingsIcon },
        ]
      },
      // {
      //   title: "Website Analytics",
      //   href: "/dashboard/website-analytics",
      //   icon: GaugeIcon
      // },
      {
        title: "Project Management",
        href: "/dashboard/project-management",
        icon: FolderDotIcon,
        items: [
          { title: "Dashboard", href: "/dashboard/project-management", icon: LayoutDashboardIcon },
          { title: "Project List", href: "/dashboard/project-list", icon: List },
          {
            title: "Tasks",
            href: "/dashboard/apps/tasks",
            icon: ClipboardCheckIcon
          },
        ]
      },
      // {
      //   title: "File Manager",
      //   href: "/dashboard/file-manager",
      //   icon: FolderIcon
      // },
      // { title: "Crypto", href: "/dashboard/crypto", icon: WalletMinimalIcon },
      // { title: "Academy/School", href: "/dashboard/academy", icon: GraduationCapIcon },
      // { title: "Hospital Management", href: "/dashboard/hospital-management", icon: ActivityIcon },
      // {
      //   title: "Hotel Dashboard",
      //   href: "/dashboard/hotel",
      //   icon: Building2Icon,
      //   items: [
      //     { title: "Dashboard", href: "/dashboard/hotel" },
      //     { title: "Bookings", href: "/dashboard/hotel/bookings" }
      //   ]
      // },
      // {
      //   title: "Finance Dashboard",
      //   href: "/dashboard/finance",
      //   icon: WalletMinimalIcon
      // },
      {
        title: "Payment Dashboard",
        href: "/dashboard/payment",
        icon: CreditCardIcon,
        items: [
          { title: "Dashboard", href: "/dashboard/payment", icon: LayoutDashboardIcon },
          { title: "Transactions", href: "/dashboard/payment/transactions", icon: WalletMinimalIcon },
          { title: "Customer Payments", href: "/dashboard/payment/customer-payments", icon: UserIcon },
          { title: "Supplier Payments", href: "/dashboard/payment/supplier-payments", icon: UsersIcon }
        ]
      }
    ]
  },
  {
    title: "Apps",
    items: [
      {
        title: "Users",
        href: "/dashboard/pages/users",
        icon: UsersIcon
      },
      {
        title: "Companies",
        href: "/dashboard/pages/companies",
        icon: Building2Icon
      },
      {
        title: "Automation",
        href: "/dashboard/pages/business-processes",
        icon: Workflow
      },
      { title: "Notes", href: "/dashboard/apps/notes", icon: StickyNoteIcon, isDataBadge: "8" },
      // { title: "Chats", href: "/dashboard/apps/chat", icon: MessageSquareIcon, isDataBadge: "5" },
      { title: "Mail", href: "/dashboard/apps/mail", icon: MailIcon },
      {
        title: "Todo List App",
        href: "/dashboard/apps/todo-list-app",
        icon: SquareCheckIcon
      },
      // {
      //   title: "Tasks",
      //   href: "/dashboard/apps/tasks",
      //   icon: ClipboardCheckIcon
      // },
      { title: "Calendar", href: "/dashboard/apps/calendar", icon: CalendarIcon },
      // {
      //   title: "File Manager",
      //   href: "/dashboard/apps/file-manager",
      //   icon: ArchiveRestoreIcon,
      //   isNew: true
      // },
      { title: "Api Keys", href: "/dashboard/apps/api-keys", icon: KeyIcon },
      { title: "POS App", href: "/dashboard/apps/pos-system", icon: CookieIcon },
      //{ title: "Courses", href: "/dashboard/apps/courses", icon: BookAIcon, isComing: true }
    ]
  },
  {
    title: "AI Apps",
    items: [
      { title: "AI Chat", href: "/dashboard/apps/ai-chat", icon: BrainIcon },
      {
        title: "AI Chat V2",
        href: "/dashboard/apps/ai-chat-v2",
        icon: BrainCircuitIcon,
        isNew: true
      },
      {
        title: "Image Generator",
        href: "/dashboard/apps/ai-image-generator",
        icon: ImagesIcon
      },
      {
        title: "Text to Speech",
        href: "/dashboard/apps/text-to-speech",
        icon: SpeechIcon,
        isComing: true
      }
    ]
  },
  {
    title: "Pages",
    items: [
      {
        title: "Profile V2",
        href: "/dashboard/pages/user-profile",
        icon: UserIcon
      },
      {
        title: "Authentication",
        href: "/",
        icon: FingerprintIcon,
        items: [
          { title: "Login v1", href: "/dashboard/login/v1" },
          { title: "Login v2", href: "/dashboard/login/v2" },
          { title: "Register v1", href: "/dashboard/register/v1" },
          { title: "Register v2", href: "/dashboard/register/v2" },
          { title: "Forgot Password", href: "/dashboard/forgot-password" }
        ]
      },
      {
        title: "Error Pages",
        href: "/",
        icon: FingerprintIcon,
        items: [
          { title: "404", href: "/dashboard/pages/error/404" },
          { title: "500", href: "/dashboard/pages/error/500" },
          { title: "403", href: "/dashboard/pages/error/403" }
        ]
      }
    ]
  },
  {
    title: "Others",
    items: [
      {
        title: "Widgets",
        href: "#",
        icon: PuzzleIcon,
        items: [
          { title: "Fitness", href: "/dashboard/widgets/fitness" },
          { title: "E-commerce", href: "/dashboard/widgets/ecommerce" },
          { title: "Analytics", href: "/dashboard/widgets/analytics" }
        ]
      },
    ]
  }
];

// Administration group - always shown at the end (not company-specific)
const administrationGroup: NavGroup = {
  title: "Administration",
  items: [
    {
      title: "Pricing Plans",
      href: "/dashboard/pages/pricing-plans",
      icon: CreditCardIcon
    },
  ]
};

// Export navItems for backward compatibility with search.tsx
export const navItems: NavGroup[] = defaultNavItems;

export function NavMain() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { checkPermission } = usePermissionCheck();
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Record<string, boolean>>({});
  const [customEntityPages, setCustomEntityPages] = React.useState<any[]>([]);
  const [navItems, setNavItems] = React.useState<NavGroup[]>(defaultNavItems);
  const [loadingMenus, setLoadingMenus] = React.useState(true);
  const [selectedSidebarItems, setSelectedSidebarItems] = React.useState<string[] | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [draggingItem, setDraggingItem] = React.useState<NavItem | null>(null);
  const [hoveredItemId, setHoveredItemId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load menu items from API
  React.useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const user = getCurrentUser();
        if (!user) {
          setLoadingMenus(false);
          return;
        }

        const menuData = await menuItemsApi.getMenuItems(
          user.companyId || undefined,
          user.branchId || undefined
        );

        if (Array.isArray(menuData) && menuData.length > 0) {
          // Transform API response to NavGroup format
          const transformedMenus: NavGroup[] = menuData.map((group: any) => ({
            title: group.title,
            items: group.items.map(transformMenuItem),
          }));
          // Always append Administration group at the end
          setNavItems(filterNavGroups([...transformedMenus, administrationGroup]));
        } else {
          // Fallback to default nav items if API returns empty
          setNavItems(filterNavGroups(defaultNavItems));
        }
      } catch (error) {
        console.error("Error loading menu items:", error);
        // Fallback to default nav items on error
        setNavItems(filterNavGroups(defaultNavItems));
      } finally {
        setLoadingMenus(false);
      }
    };

    loadMenuItems();
  }, []);

  // Load per-user sidebar visibility selection (Display settings)
  React.useEffect(() => {
    const loadUserSidebarSelection = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;
        const settings = await settingsApi.getUserSettings(user.id);
        setSelectedSidebarItems(Array.isArray(settings?.sidebarItems) ? settings.sidebarItems : []);
      } catch {
        // If settings cannot be loaded, fall back to showing all items.
        setSelectedSidebarItems(null);
      }
    };
    loadUserSidebarSelection();
  }, []);

  // Load custom entity pages
  React.useEffect(() => {
    const loadCustomEntityPages = async () => {
      try {
        const user = getCurrentUser();
        if (!user) return;

        const pages = await customEntityPageApi.getCustomEntityPages(
          user.companyId || undefined,
          user.branchId || undefined
        );
        setCustomEntityPages(Array.isArray(pages) ? pages : []);
      } catch (error) {
        console.error("Error loading custom entity pages:", error);
        setCustomEntityPages([]);
      }
    };

    loadCustomEntityPages();
  }, []);

  const handleLinkClick = async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Skip permission check for hash links or external links
    if (href === "#" || href.startsWith("http") || href.startsWith("mailto:")) {
      return;
    }

    e.preventDefault();
    
    try {
      const hasPermission = await checkPermission(href);
      
      if (hasPermission) {
        router.push(href);
      } else {
        toast.error("You don't have permission to access this resource");
        // Optionally redirect to 403 page
        // router.push("/dashboard/pages/error/403");
      }
    } catch (error) {
      console.error("Permission check failed:", error);
      toast.error("Failed to verify permissions");
    }
  };

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Find the dragging item
    for (const nav of navItems) {
      const item = nav.items.find((i) => `${nav.title}-${i.title}` === active.id);
      if (item) {
        setDraggingItem(item);
        break;
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggingItem(null);

    if (!over || active.id === over.id) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // Check if it's a child item (contains "-child" suffix)
    if (activeIdStr.includes("-child") && overIdStr.includes("-child")) {
      // Handle child item reordering
      for (const nav of navItems) {
        for (const parentItem of nav.items) {
          if (parentItem.items && parentItem.items.length > 0) {
            const parentPrefix = `${nav.title}-${parentItem.title}-`;
            const activeChildIndex = parentItem.items.findIndex(
              (i) => `${parentPrefix}${i.title}-child` === activeIdStr
            );
            const overChildIndex = parentItem.items.findIndex(
              (i) => `${parentPrefix}${i.title}-child` === overIdStr
            );

            if (activeChildIndex !== -1 && overChildIndex !== -1 && activeChildIndex !== overChildIndex) {
              const newChildItems = arrayMove(parentItem.items, activeChildIndex, overChildIndex);
              
              // Update local state
              const updatedNavItems = navItems.map((n) =>
                n.title === nav.title
                  ? {
                      ...n,
                      items: n.items.map((i) =>
                        i.title === parentItem.title ? { ...i, items: newChildItems } : i
                      ),
                    }
                  : n
              );
              setNavItems(updatedNavItems);

              // Update order in database
              try {
                const user = getCurrentUser();
                if (user) {
                  // Get parent item ID
                  const parentItemId = (parentItem as any)?.id || null;

                  const reorderData = newChildItems.map((item, index) => ({
                    id: (item as any).id || 0,
                    order: index,
                    title: item.title,
                    href: item.href,
                    icon: getIconName(item.icon) || undefined,
                    group: nav.title,
                    parentId: parentItemId
                  }));

                  await menuItemsApi.reorderMenuItems(
                    reorderData,
                    user.companyId || undefined,
                    user.branchId || undefined
                  );
                  
                  // Reload menus to sync with database
                  const menuData = await menuItemsApi.getMenuItems(
                    user.companyId || undefined,
                    user.branchId || undefined
                  );
                  if (Array.isArray(menuData) && menuData.length > 0) {
                    const transformedMenus: NavGroup[] = menuData.map((group: any) => ({
                      title: group.title,
                      items: group.items.map(transformMenuItem),
                    }));
                    // Always append Administration group at the end
                    setNavItems([...transformedMenus, administrationGroup]);
                  }
                }
              } catch (error) {
                console.error("Error updating child menu order:", error);
                setNavItems(navItems);
              }
              return;
            }
          }
        }
      }
    } else {
      // Handle parent item reordering
      for (const nav of navItems) {
        const activeIndex = nav.items.findIndex((i) => `${nav.title}-${i.title}` === activeIdStr);
        const overIndex = nav.items.findIndex((i) => `${nav.title}-${i.title}` === overIdStr);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const newItems = arrayMove(nav.items, activeIndex, overIndex);
          
          // Update local state
          const updatedNavItems = navItems.map((n) =>
            n.title === nav.title ? { ...n, items: newItems } : n
          );
          setNavItems(updatedNavItems);

          // Update order in database
          try {
            const user = getCurrentUser();
            if (user) {
              const reorderData = newItems.map((item, index) => ({
                id: (item as any).id || 0,
                order: index,
                title: item.title,
                href: item.href,
                icon: getIconName(item.icon) || undefined,
                group: nav.title,
                parentId: undefined
              }));

              await menuItemsApi.reorderMenuItems(
                reorderData,
                user.companyId || undefined,
                user.branchId || undefined
              );
              
              // Reload menus to sync with database
              const menuData = await menuItemsApi.getMenuItems(
                user.companyId || undefined,
                user.branchId || undefined
              );
              if (Array.isArray(menuData) && menuData.length > 0) {
                const transformedMenus: NavGroup[] = menuData.map((group: any) => ({
                  title: group.title,
                  items: group.items.map(transformMenuItem),
                }));
                // Always append Administration group at the end
                setNavItems([...transformedMenus, administrationGroup]);
              }
            }
          } catch (error) {
            console.error("Error updating menu order:", error);
            setNavItems(navItems);
          }
          break;
        }
      }
    }
  };

  // Sortable Menu Item Component
  const SortableMenuItem = ({ item, groupTitle, parentTitle, isChild = false }: { item: NavItem; groupTitle: string; parentTitle?: string; isChild?: boolean }) => {
    const itemId = isChild ? `${groupTitle}-${parentTitle}-${item.title}-child` : `${groupTitle}-${item.title}`;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: itemId });

    // Filter out aria-describedby to prevent hydration mismatch
    // @dnd-kit generates different IDs on server vs client
    const { 'aria-describedby': _, ...filteredAttributes } = attributes;

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1
    };

    if (isChild) {
      const isHovered = hoveredItemId === itemId;
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="relative group/subitem"
          onMouseEnter={() => setHoveredItemId(itemId)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 [&>a>svg:not(.grip-icon)]:opacity-100 [&>a>svg:not(.grip-icon)]:text-sidebar-foreground data-[active=true]:[&>a>svg:not(.grip-icon)]:text-sidebar-accent-foreground relative"
              isActive={pathname === item.href}
              asChild
              suppressHydrationWarning>
              <Link 
                href={item.href} 
                target={(item as any).newTab ? "_blank" : ""}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event from bubbling to CollapsibleTrigger
                  if (item.href !== "#" && !(item as any).newTab) {
                    handleLinkClick(e as any, item.href);
                  }
                }}
                className="flex items-center gap-2"
                suppressHydrationWarning>
                <GripVertical
                  {...filteredAttributes}
                  {...listeners}
                  onClick={(e) => e.stopPropagation()}
                  suppressHydrationWarning
                  className={`grip-icon h-3.5 w-3.5 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 opacity-0 group-hover/subitem:opacity-100 transition-opacity duration-150 group-data-[collapsible=icon]:hidden ${isDragging ? '!opacity-100' : ''}`}
                />
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </div>
      );
    }

    const isHovered = hoveredItemId === itemId;
    
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative group/menuitem"
        onMouseEnter={() => setHoveredItemId(itemId)}
        onMouseLeave={() => setHoveredItemId(null)}
      >
        <SidebarMenuItem>
          {Array.isArray(item.items) && item.items.length > 0 ? (
            <>
              <div className="hidden group-data-[collapsible=icon]:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton suppressHydrationWarning tooltip={item.title} className="relative">
                      <GripVertical
                        {...filteredAttributes}
                        {...listeners}
                        onClick={(e) => e.stopPropagation()}
                        suppressHydrationWarning
                        className={`h-3.5 w-3.5 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-150 group-data-[collapsible=icon]:hidden ${isDragging ? '!opacity-100' : ''}`}
                      />
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side={isMobile ? "bottom" : "right"}
                    align={isMobile ? "end" : "start"}
                    className="min-w-48 rounded-lg">
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem
                        className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10! active:bg-[var(--primary)]/10!"
                        key={subItem.title}
                        onClick={(e) => {
                          if (subItem.href !== "#") {
                            handleLinkClick(e as any, subItem.href);
                          }
                        }}>
                        {subItem.href === "#" ? (
                          <>
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.title}</span>
                          </>
                        ) : (
                          <a href={subItem.href} onClick={(e) => e.preventDefault()} className="flex items-center gap-2">
                            {subItem.icon && <subItem.icon className="size-4" />}
                            <span>{subItem.title}</span>
                          </a>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Collapsible
                className="group/collapsible block group-data-[collapsible=icon]:hidden"
                open={openCollapsibles[`${groupTitle}-${item.title}`] ?? !!item.items.find((s) => s.href === pathname)}
                onOpenChange={(open) => {
                  setOpenCollapsibles((prev) => ({
                    ...prev,
                    [`${groupTitle}-${item.title}`]: open
                  }));
                }}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    suppressHydrationWarning
                    className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10 relative"
                    tooltip={item.title}
                    onClick={(e) => {
                      if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".grip-icon")) {
                        return;
                      }
                    }}>
                    <GripVertical
                      {...filteredAttributes}
                      {...listeners}
                      onClick={(e) => e.stopPropagation()}
                      suppressHydrationWarning
                      className={`grip-icon h-3.5 w-3.5 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-150 group-data-[collapsible=icon]:hidden ${isDragging ? "!opacity-100" : ""}`}
                    />
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub onClick={(e) => e.stopPropagation()}>
                    <SortableContext
                      items={item.items.map((subItem) => `${groupTitle}-${item.title}-${subItem.title}-child`)}
                      strategy={verticalListSortingStrategy}>
                      {item.items?.map((subItem, key) => (
                        <SortableMenuItem key={key} item={subItem} groupTitle={groupTitle} parentTitle={item.title} isChild />
                      ))}
                    </SortableContext>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : (
            <SidebarMenuButton
              className="hover:text-foreground active:text-foreground hover:bg-[var(--primary)]/10 active:bg-[var(--primary)]/10"
              isActive={pathname === item.href}
              tooltip={item.title}
              asChild>
              <Link 
                href={item.href} 
                target={(item as any).newTab ? "_blank" : ""}
                onClick={(e) => {
                  if (item.href !== "#" && !(item as any).newTab) {
                    handleLinkClick(e as any, item.href);
                  }
                }}
                className="flex items-center gap-2 relative"
                suppressHydrationWarning>
                <GripVertical
                  {...filteredAttributes}
                  {...listeners}
                  onClick={(e) => e.stopPropagation()}
                  suppressHydrationWarning
                  className={`h-3.5 w-3.5 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 opacity-0 group-hover/menuitem:opacity-100 transition-opacity duration-150 group-data-[collapsible=icon]:hidden ${isDragging ? '!opacity-100' : ''}`}
                />
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}
          {!!(item as any).isComing && (
            <SidebarMenuBadge className="peer-hover/menu-button:text-foreground opacity-50">
              Coming
            </SidebarMenuBadge>
          )}
          {!!(item as any).isNew && (
            <SidebarMenuBadge className="border border-green-400 text-green-600 peer-hover/menu-button:text-green-600">
              New
            </SidebarMenuBadge>
          )}
          {!!(item as any).isDataBadge && (
            <SidebarMenuBadge className="peer-hover/menu-button:text-foreground">
              {(item as any).isDataBadge}
            </SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      </div>
    );
  };

  // Merge custom entity pages into Pages section
  const enhancedNavItems = React.useMemo(() => {
    const withCustomPages = navItems.map((nav) => {
      if (nav.title === "Pages") {
        // Create custom entity pages items
        const customEntityItems = customEntityPages
          .filter((page) => page.isActive)
          .map((page) => ({
            title: page.name,
            href: `/dashboard/pages/custom-entities/${page.slug}`,
            icon: ComponentIcon, // Use ComponentIcon for custom entities
          }));

        // Add custom entity pages to the Pages section
        return {
          ...nav,
          items: [
            ...nav.items,
            ...(customEntityItems.length > 0
              ? [{ title: "Custom Pages", href: "#", icon: ComponentIcon, items: customEntityItems }]
              : []),
          ],
        };
      }
      return nav;
    });
    const filtered = filterNavGroups(withCustomPages);
    return filterNavByUserSelection(filtered, selectedSidebarItems);
  }, [navItems, customEntityPages, selectedSidebarItems]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      {enhancedNavItems.map((nav) => (
        <SidebarGroup key={nav.title}>
          <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SortableContext
                items={nav.items.map((item) => `${nav.title}-${item.title}`)}
                strategy={verticalListSortingStrategy}>
              {nav.items.map((item) => (
                  <SortableMenuItem key={item.title} item={item} groupTitle={nav.title} />
                ))}
              </SortableContext>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
      <DragOverlay>
        {activeId && draggingItem ? (
          <div className="rounded-md border bg-background p-2 shadow-lg">
            {draggingItem.icon && <draggingItem.icon className="mr-2 h-4 w-4 inline" />}
            <span>{draggingItem.title}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
