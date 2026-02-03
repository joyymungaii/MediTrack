import Link from 'next/link';
import { Pill, Twitter, Facebook, Instagram } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl font-headline">MediTrack Pro</span>
            </Link>
            <p className="text-muted-foreground text-sm">Your trusted partner in health management.</p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/medicines" className="text-sm text-muted-foreground hover:text-primary">Medicines</Link></li>
              <li><Link href="/symptom-checker" className="text-sm text-muted-foreground hover:text-primary">AI Symptom Checker</Link></li>
              <li><Link href="/upload-prescription" className="text-sm text-muted-foreground hover:text-primary">Upload Prescription</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold font-headline">Contact Us</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>123 Health St, Wellness City</li>
              <li>Email: support@meditrack.pro</li>
              <li>Phone: (123) 456-7890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediTrack Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
