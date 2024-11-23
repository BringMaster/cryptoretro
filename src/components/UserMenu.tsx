import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function UserMenu() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <div className="flex gap-4">
        <Link href="/sign-in" className="text-sm hover:text-blue-500">
          Sign In
        </Link>
        <Link href="/sign-up" className="text-sm hover:text-blue-500">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/watchlist" className="text-sm hover:text-blue-500">
        Watchlist
      </Link>
      <Link href="/portfolio" className="text-sm hover:text-blue-500">
        Portfolio
      </Link>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
