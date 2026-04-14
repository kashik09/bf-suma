import SearchAutocomplete from "@/components/storefront/search-autocomplete";
import { CurrencySwitcher } from "@/components/storefront/currency-switcher";
import { StoreAccountMenu } from "@/components/storefront/store-account-menu";
import { StoreCartButton } from "@/components/storefront/store-cart-button";
import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { STORE_NAV_LINKS } from "@/lib/constants";

export function StoreHeader() {
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

        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <nav aria-label="Main navigation" className="hidden items-center justify-end gap-5 text-sm font-semibold text-slate-700 md:flex">
            {STORE_NAV_LINKS.map((item) => (
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
          <StoreCartButton />
        </div>
      </PageContainer>

      <div className="border-t border-slate-100 bg-white lg:hidden">
        <PageContainer className="py-2.5">
          <SearchAutocomplete placeholder="Search products..." />
        </PageContainer>
      </div>

      <div className="border-t border-slate-100 bg-white md:hidden lg:hidden">
        <PageContainer className="flex items-center gap-4 overflow-x-auto pb-2 pt-0 text-sm font-semibold text-slate-700">
          <nav aria-label="Mobile quick links" className="flex items-center gap-4">
            {STORE_NAV_LINKS.map((item) => (
              <Link className="shrink-0 rounded-full px-2.5 py-1 transition hover:bg-slate-100" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </PageContainer>
      </div>
    </header>
  );
}
