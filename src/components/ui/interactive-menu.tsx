"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Home, CreditCard, FileText, Megaphone, User } from "lucide-react";
import { cn } from "@/lib/utils";

type IconComponentType = React.ElementType<{ className?: string }>;

export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  view?: string;
}

export interface InteractiveMenuProps {
  items?: InteractiveMenuItem[];
  accentColor?: string;
  onNavigate?: (view: string) => void;
  activeView?: string;
}

const defaultItems: InteractiveMenuItem[] = [
  { label: "Inicio", icon: Home, view: "home" },
  { label: "Pagos", icon: CreditCard, view: "payments" },
  { label: "Facturas", icon: FileText, view: "invoices" },
  { label: "Avisos", icon: Megaphone, view: "announcements" },
  { label: "Perfil", icon: User, view: "profile" },
];

const defaultAccentColor = "#047857";

export function InteractiveMenu({ items, accentColor, onNavigate, activeView }: InteractiveMenuProps) {
  const finalItems = useMemo(() => {
    const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
    if (!isValid) return defaultItems;
    return items;
  }, [items]);

  const [activeIndex, setActiveIndex] = useState(0);

  const desiredIndex = activeView
    ? finalItems.findIndex((item) => item.view === activeView)
    : -1;
  const safeActiveIndex = desiredIndex >= 0 ? desiredIndex : (activeIndex >= finalItems.length ? 0 : activeIndex);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[safeActiveIndex];
      const activeTextElement = textRefs.current[safeActiveIndex];
      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty("--lineWidth", `${textWidth}px`);
      }
    };
    setLineWidth();
    window.addEventListener("resize", setLineWidth);
    return () => window.removeEventListener("resize", setLineWidth);
  }, [safeActiveIndex, finalItems]);

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    const item = finalItems[index];
    if (item?.view && onNavigate) onNavigate(item.view);
  };

  const navStyle = useMemo(() => {
    const activeColor = accentColor || defaultAccentColor;
    return { "--component-active-color": activeColor } as React.CSSProperties;
  }, [accentColor]);

  return (
    <nav className="interactive-menu" role="navigation" aria-label="Navegación principal" style={navStyle}>
      {finalItems.map((item, index) => {
        const isActive = index === safeActiveIndex;
        const IconComponent = item.icon;
        return (
          <button
            key={item.label}
            className={cn("interactive-menu__item", isActive && "active")}
            onClick={() => handleItemClick(index)}
            ref={(el) => { itemRefs.current[index] = el; }}
            style={{ "--lineWidth": "0px" } as React.CSSProperties}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <div className="interactive-menu__icon">
              <IconComponent className="icon" />
            </div>
            <strong
              className={cn("interactive-menu__text", isActive && "active")}
              ref={(el) => { textRefs.current[index] = el; }}
            >
              {item.label}
            </strong>
          </button>
        );
      })}
    </nav>
  );
}

export { InteractiveMenu };
