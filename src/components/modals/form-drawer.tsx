"use client";

import { Drawer } from "@/components/ui/drawer";

export function FormDrawer({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Drawer onClose={onClose} open={open} title={title}>
      {children}
    </Drawer>
  );
}
