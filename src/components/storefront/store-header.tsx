import SearchAutocomplete from "@/components/storefront/search-autocomplete";
import { CurrencySwitcher } from "@/components/storefront/currency-switcher";
import { MobileMenu } from "@/components/storefront/mobile-menu";
import { StoreAccountMenu } from "@/components/storefront/store-account-menu";
import { StoreCartButton } from "@/components/storefront/store-cart-button";
import { StoreWishlistButton } from "@/components/storefront/store-wishlist-button";
import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { STORE_NAV_LINKS } from "@/lib/constants";

export function StoreHeader() {
  const navLinks = STORE_NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <PageContainer className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-6">
        <Link href="/">
          <Image
            alt="BF Suma wellness store logo"
            className="h-10 w-auto"
            height={40}
            src="/bf-suma-logo.png"
            width={120}
          />
        </Link>

        <div className="hidden lg:block">
          <SearchAutocomplete placeholder="Search products, category, or benefit..." />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <nav aria-label="Main navigation" className="hidden items-center justify-end gap-5 text-sm font-semibold text-slate-700 lg:flex">
            {navLinks.map((item) => (
              <Link className="transition hover:text-slate-900" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link
              className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              href="/shop"
            >
              Shop Now
            </Link>
          </nav>

          <StoreAccountMenu />
          <CurrencySwitcher />
          <div className="flex shrink-0 items-center gap-2">
            <StoreWishlistButton />
            <StoreCartButton />
            <MobileMenu />
          </div>
        </div>
      </PageContainer>

      <div className="border-t border-slate-100 bg-white lg:hidden">
        <PageContainer className="py-2.5">
          <SearchAutocomplete placeholder="Search products..." />
        </PageContainer>
      </div>

    </header>
  );
}
