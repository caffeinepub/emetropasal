import { ShoppingBag } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg text-primary mb-3">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary-foreground" />
            </div>
            Emetropasal
          </div>
          <p className="text-sm text-muted-foreground">
            Your local mart in Changunarayan, Bhaktapur.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Shop All</li>
            <li>Track Order</li>
            <li>My Account</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Fruits &amp; Vegetables</li>
            <li>Dairy &amp; Eggs</li>
            <li>Bakery &amp; Beverages</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>abiralleads@gmail.com</li>
            <li>9779843519254</li>
            <li>Mon-Sat 8am - 9pm</li>
            <li>Changunarayan, Bhaktapur</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {year}. Built with ❤️ using{" "}
        <a
          href={utmLink}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          caffeine.ai
        </a>
      </div>
    </footer>
  );
}
