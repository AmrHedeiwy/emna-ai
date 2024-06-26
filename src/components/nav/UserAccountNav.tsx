import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Gem, User } from 'lucide-react';
import Link from 'next/link';
import SignOut from '../SignOut';
import { TGetUserSubscription } from '@/lib/stripe';
import DeleteAccount from '../DeleteAccount';

interface UserAccountNavProps {
  email: string | null | undefined;
  name: string | null | undefined;
  imageUrl: string | null | undefined;
  subscription: TGetUserSubscription;
}

const UserAccountNav = async ({
  email,
  imageUrl,
  name,
  subscription
}: UserAccountNavProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full w-8 h-8 aspect-square">
          <Avatar>
            <AvatarImage src={imageUrl ? imageUrl : ''} alt="profile image" />
            <AvatarFallback className="bg-slate-100">
              <User className="h-4 w-4 text-zinc-400" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52 mt-1" align="end">
        <div className="flex flex-col justify-center p-2">
          <p className="font-medium text-sm text-zinc-900">{name}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>

        <DropdownMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          {subscription.isSubscribed ? (
            <Link href="/dashboard/billing">Manege Subscription</Link>
          ) : (
            <Link href="/pricing" className="flex items-center gap-1">
              Upgrade <Gem className="text-green-600 w-4 h-4" />
            </Link>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <SignOut />

        <DeleteAccount />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
