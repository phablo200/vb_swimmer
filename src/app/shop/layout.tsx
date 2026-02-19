import Header from "@/app/components/shop/Header";
import Footer from "@/app/components/shop/Footer";
import CartProvider from "@/app/components/shop/CartProvider";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
