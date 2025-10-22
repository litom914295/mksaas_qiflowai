import { AccountInfoCard } from '@/components/dashboard/profile/account-info-card';
import { BaziInfoCard } from '@/components/dashboard/profile/bazi-info-card';
import { PreferencesCard } from '@/components/dashboard/profile/preferences-card';
import { UpdateAvatarCard } from '@/components/settings/profile/update-avatar-card';
import { UpdateNameCard } from '@/components/settings/profile/update-name-card';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Basic Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <UpdateNameCard />
        </div>
        <div className="lg:col-span-1">
          <UpdateAvatarCard />
        </div>
        <div className="lg:col-span-1">
          <AccountInfoCard />
        </div>
      </div>

      {/* Bazi Information */}
      <div className="w-full">
        <BaziInfoCard />
      </div>

      {/* User Preferences */}
      <div className="w-full">
        <PreferencesCard />
      </div>
    </div>
  );
}
