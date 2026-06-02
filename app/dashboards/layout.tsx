import { Plus_Jakarta_Sans } from "next/font/google";
import "./_bfsuma/styles.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta"
});

export const metadata = {
  title: "BF Suma Dashboards",
  description: "Admin console and customer account dashboard"
};

export default function DashboardsLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={plusJakartaSans.className}>
      {children}
    </div>
  );
}
